#!/usr/bin/env python3
"""
DVR Proxy — Bridges the Lorex/Dahua DVR and go2rtc for the React dashboard.
Handles both live camera WebRTC signaling and DVR playback.

Runs on the HA host at port 8766.

Endpoints:
  GET  /api/mse?src=channel_N                        — Live fMP4 stream (MSE over HTTP)
  POST /api/webrtc                                   — Live camera WebRTC (SDP proxy)
  GET  /api/recordings?channel=N&start=ISO&end=ISO   — Search recordings
  GET  /api/date-range?channel=N                     — Oldest/newest recording dates
  GET  /api/timeline?channel=N&date=YYYY-MM-DD       — Recording segments for a day
  POST /api/playback/start                           — Start ffmpeg playback (RTSP Scale proxy for speed)
  POST /api/playback/webrtc                          — Proxy WebRTC SDP offer→answer
  POST /api/playback/stop                            — Kill ffmpeg playback process

On startup, registers DVRIP streams (channel_1–channel_4) in go2rtc so the
React dashboard can get WebRTC video without going through Home Assistant.
  python3 dvr_proxy.py &
"""

import json
import os
import queue as _queue
import shutil
import socket
import time as _time
import urllib.request
import urllib.parse
import urllib.error
import subprocess
import http.client as _httplib
from datetime import datetime as _dt, timedelta as _td
from http.server import HTTPServer, BaseHTTPRequestHandler
from socketserver import ThreadingMixIn
import threading


class ThreadingHTTPServer(ThreadingMixIn, HTTPServer):
    daemon_threads = True

# ─── Config ───

DVR_HOST = "192.168.10.156"


def _load_credentials():
    """Load DVR credentials from env vars or /config/.dvr_credentials."""
    user = os.environ.get('DVR_USER')
    password = os.environ.get('DVR_PASS')
    if user and password:
        return user, password
    try:
        with open('/config/.dvr_credentials') as f:
            creds = {}
            for line in f:
                line = line.strip()
                if '=' in line and not line.startswith('#'):
                    k, v = line.split('=', 1)
                    creds[k.strip()] = v.strip()
            return creds.get('DVR_USER', ''), creds.get('DVR_PASS', '')
    except FileNotFoundError:
        raise RuntimeError(
            'DVR credentials not found. Set DVR_USER/DVR_PASS env vars '
            'or create /config/.dvr_credentials with DVR_USER=xxx and DVR_PASS=xxx'
        )


DVR_USER, DVR_PASS = _load_credentials()
DVR_BASE = f"http://{DVR_HOST}"

GO2RTC_BASE = "http://localhost:1984"

LISTEN_PORT = 8766
RTSP_PROXY_PORT = 8767

# Named streams to register in go2rtc at startup (bypasses HA entirely)
# Main stream (subtype=0): 960x480 30fps — used when a single camera is expanded
# Sub stream  (subtype=1): 704x480 15fps — used for the 2x2 grid (lighter decoder load)
DVRIP_STREAMS = {}
for _ch in range(1, 5):
    DVRIP_STREAMS[f"channel_{_ch}"] = f"rtsp://{DVR_USER}:{DVR_PASS}@{DVR_HOST}:554/cam/realmonitor?channel={_ch}&subtype=0"
    DVRIP_STREAMS[f"channel_{_ch}_sub"] = f"rtsp://{DVR_USER}:{DVR_PASS}@{DVR_HOST}:554/cam/realmonitor?channel={_ch}&subtype=1"

# Shared playback speed for the RTSP proxy (set by /api/playback/start)
_playback_scale = {"value": 1.0}

# ─── Recording Cache ───
#
# Downloads DVR recordings to local disk so playback can read from files
# instead of streaming via RTSP.  Benefits:
# - Any playback speed (no DVR delivery bottleneck)
# - Main stream HD 30fps instead of sub-stream
# - Instant seeking within cached segments
#
# Files are stored as raw .dav (Dahua DHAV format) which ffmpeg reads directly.
# Directory: /config/recordings/ch{1-4}/{YYYY-MM-DD}/{HH-MM-SS}_{HH-MM-SS}.dav

CACHE_DIR = "/config/recordings"
CACHE_AUTO_SYNC_DAYS = 1       # auto-download the last N days (background)
CACHE_RETENTION_HOURS = 24     # keep cached .dav files for the last 24 hours
CACHE_POLL_INTERVAL_S = 1800   # 30 minutes between sync cycles
CACHE_MIN_FREE_GB = 20         # stop downloading if less than this free

# ─── Saved Clips ───
CLIPS_DIR = "/config/recordings/clips"
CLIPS_META = os.path.join(CLIPS_DIR, "clips.json")

# Dahua digest auth opener (reused across requests)
_pw_mgr = urllib.request.HTTPPasswordMgrWithDefaultRealm()
_pw_mgr.add_password(None, DVR_BASE, DVR_USER, DVR_PASS)
_dvr_opener = urllib.request.build_opener(urllib.request.HTTPDigestAuthHandler(_pw_mgr))

# Track active playback (ffmpeg subprocess + params)
_playback_state = {
    "channel": None,
    "rtsp_start": None,
    "rtsp_end": None,
    "start_time_str": None,   # Original "YYYY-MM-DD HH:MM:SS"
    "end_time_str": None,
    "speed": 1,                # Current UI speed multiplier
    "real_start": None,        # time.time() when current speed segment began
    "proc": None,
}
_lock = threading.Lock()

# Speed → RTSP Scale header value (Lorex/Dahua XVR5104C-X1).
# Scale=N means DVR delivers N× real-time (I-frames only for N>1).
# Must match UI playbackRate so buffer stays neutral.
# Previous mapping (off by 2×) caused buffer underruns at all fast speeds.
_SPEED_TO_SCALE = {1: None, 2: 2.0, 4: 4.0, 8: 8.0, 16: 16.0}


# ─── fMP4 Timestamp Rewriter ───
#
# At Scale > 1, the DVR sends I-frames only with compressed/irregular RTP
# timestamps (all frames clustered within <0.5s regardless of actual playback
# span).  MSE SourceBuffer in 'segments' mode uses these timestamps directly,
# so the browser plays through all frames in <1s then stalls.
#
# The rewriter assigns evenly-spaced timestamps to each I-frame fragment so
# that MSE displays one frame per ~2s of presentation time (the DVR's trick-
# play interval).  With playbackRate=N, each frame is shown for ~2/N real
# seconds, and the buffer stays neutral because the DVR delivers at ~N/2 fps.
#
# The DVR's actual encoding GOP is ~0.58s, but trick play selects I-frames at
# ~2s intervals.  TARGET_DUR_TICKS = 180000 (2s at 90kHz timescale).
import struct as _struct

_FMP4_TIMESCALE = 90000
_FMP4_TARGET_DUR = 180000  # 2 seconds — DVR trick-play I-frame interval


class FMP4Rewriter:
    """Rewrite fMP4 timestamps for trick-play streams (Scale > 1).

    Buffers incoming bytes, parses fMP4 boxes, and rewrites each moof
    fragment's tfdt.baseMediaDecodeTime and tfhd.default_sample_duration
    so frames are evenly spaced at TARGET_DUR intervals.
    """

    def __init__(self, scale=1.0):
        self._buf = bytearray()
        self._frag_idx = 0
        # Duration per fragment scales inversely with Scale: scale=1→2.0s,
        # scale=4→0.5s, scale=16→0.125s.  With playbackRate≈1.0 the browser
        # shows each keyframe for target_dur wall-seconds; the DVR Scale
        # header already provides the fast-forward speed.
        self._target_dur = max(int(_FMP4_TARGET_DUR / max(scale, 1.0)), 900)

    def feed(self, data: bytes) -> bytes:
        """Feed raw bytes, return rewritten bytes ready to forward."""
        self._buf.extend(data)
        out = bytearray()
        while True:
            if len(self._buf) < 8:
                break
            box_size = _struct.unpack_from(">I", self._buf, 0)[0]
            if box_size < 8:
                # Malformed — flush everything
                out.extend(self._buf)
                self._buf.clear()
                break
            if box_size == 1:
                # 64-bit extended size
                if len(self._buf) < 16:
                    break
                box_size = _struct.unpack_from(">Q", self._buf, 8)[0]
            if len(self._buf) < box_size:
                break  # incomplete box — wait for more data
            box = bytes(self._buf[:box_size])
            del self._buf[:box_size]
            box_type = box[4:8]
            if box_type == b"moof":
                box = self._rewrite_moof(box)
                self._frag_idx += 1
            out.extend(box)
        return bytes(out)

    def _rewrite_moof(self, moof: bytes) -> bytes:
        moof = bytearray(moof)
        # Parse child boxes of moof
        off = 8
        while off < len(moof) - 8:
            csz = _struct.unpack_from(">I", moof, off)[0]
            if csz < 8:
                break
            if moof[off+4:off+8] == b"traf":
                self._rewrite_traf(moof, off + 8, off + csz)
            off += csz
        return bytes(moof)

    def _rewrite_traf(self, moof: bytearray, start: int, end: int):
        off = start
        while off < end - 8:
            csz = _struct.unpack_from(">I", moof, off)[0]
            if csz < 8:
                break
            btype = moof[off+4:off+8]
            if btype == b"tfdt":
                self._rewrite_tfdt(moof, off)
            elif btype == b"tfhd":
                self._rewrite_tfhd(moof, off, csz)
            off += csz

    def _rewrite_tfdt(self, moof: bytearray, off: int):
        """Set baseMediaDecodeTime = frag_idx * TARGET_DUR."""
        ver = moof[off + 8]
        new_bmdt = self._frag_idx * self._target_dur
        if ver == 1:
            _struct.pack_into(">Q", moof, off + 12, new_bmdt)
        else:
            _struct.pack_into(">I", moof, off + 12, new_bmdt)

    def _rewrite_tfhd(self, moof: bytearray, off: int, size: int):
        """Set default_sample_duration = TARGET_DUR."""
        flags = (moof[off+9] << 16) | (moof[off+10] << 8) | moof[off+11]
        p = off + 12 + 4   # skip fullbox header + track_id
        if flags & 0x000001:  # base_data_offset
            p += 8
        if flags & 0x000002:  # sample_description_index
            p += 4
        if flags & 0x000008:  # default_sample_duration — overwrite in place
            _struct.pack_into(">I", moof, p, self._target_dur)
        # If the flag isn't set, we can't easily add it without changing box
        # sizes.  go2rtc always includes it (verified empirically).


def _build_playback_url(channel, start_time, end_time, speed):
    """Build RTSP playback URL, routing through Scale proxy for 2x+ speeds."""
    rtsp_start = start_time.replace("-", "_").replace(" ", "_").replace(":", "_")
    rtsp_end = end_time.replace("-", "_").replace(" ", "_").replace(":", "_")

    scale = _SPEED_TO_SCALE.get(speed)
    if scale is not None:
        # Route through RTSP Scale proxy for accelerated playback (keyframes only)
        _playback_scale["value"] = scale
        host = f"127.0.0.1:{RTSP_PROXY_PORT}"
    else:
        # Direct to DVR for 1x speed (all frames, full quality)
        _playback_scale["value"] = 1.0
        host = f"{DVR_HOST}:554"

    return (
        f"rtsp://{DVR_USER}:{DVR_PASS}@{host}"
        f"/cam/playback?channel={channel}&subtype=0"
        f"&starttime={rtsp_start}&endtime={rtsp_end}"
    )


def _register_go2rtc_playback(rtsp_url):
    """Register (or replace) a 'playback' stream in go2rtc pointing at the given RTSP URL."""
    # Delete existing playback stream
    try:
        req = urllib.request.Request(
            f"{GO2RTC_BASE}/api/streams?name=playback", method="DELETE"
        )
        urllib.request.urlopen(req, timeout=5)
    except Exception:
        pass
    _time.sleep(2)  # DVR needs time to close old RTSP session
    # Register new stream
    encoded = urllib.parse.quote(rtsp_url, safe="")
    req = urllib.request.Request(
        f"{GO2RTC_BASE}/api/streams?name=playback&src={encoded}", method="PUT"
    )
    urllib.request.urlopen(req, timeout=10)


# ─── DVR helpers ───

def dvr_get(path, timeout=10):
    """GET request to DVR with digest auth."""
    try:
        r = _dvr_opener.open(DVR_BASE + path, timeout=timeout)
        return r.read().decode("utf-8", errors="replace")
    except Exception as e:
        return None


def parse_dahua_response(text):
    """Parse Dahua key=value response into a list of dicts."""
    if not text or not text.strip():
        return []
    items = []
    current = {}
    current_idx = -1
    for line in text.strip().split("\n"):
        line = line.strip()
        if not line or "=" not in line:
            continue
        key, val = line.split("=", 1)
        # Extract item index: items[N].Key
        if "items[" in key:
            idx_str = key.split("items[")[1].split("]")[0]
            idx = int(idx_str)
            field = key.split("].", 1)[1] if "]." in key else key
            if idx != current_idx:
                if current:
                    items.append(current)
                current = {}
                current_idx = idx
            current[field] = val
    if current:
        items.append(current)
    return items


def search_recordings(channel, start_time, end_time):
    """Search DVR recordings for a channel and time range.

    The Dahua API limits findNextFile to ~100 results per call, so we
    paginate until the DVR returns 'found=0' or the response is empty.
    """
    # Create search session
    resp = dvr_get("/cgi-bin/mediaFileFind.cgi?action=factory.create")
    if not resp:
        return []
    obj_id = resp.strip().replace("result=", "")

    # Start search
    params = (
        f"action=findFile&object={obj_id}"
        f"&condition.Channel={channel}"
        f"&condition.StartTime={urllib.parse.quote(start_time)}"
        f"&condition.EndTime={urllib.parse.quote(end_time)}"
    )
    dvr_get(f"/cgi-bin/mediaFileFind.cgi?{params}")

    # Paginate through all results
    all_items = []
    for _ in range(50):  # safety limit: 50 pages × 100 = 5000 max
        resp = dvr_get(f"/cgi-bin/mediaFileFind.cgi?action=findNextFile&object={obj_id}&count=100")
        if not resp or "found=0" in resp:
            break
        items = parse_dahua_response(resp)
        if not items:
            break
        all_items.extend(items)

    # Destroy session
    dvr_get(f"/cgi-bin/mediaFileFind.cgi?action=destroy&object={obj_id}")

    results = []
    for item in all_items:
        results.append({
            "channel": int(item.get("Channel", channel)),
            "start": item.get("StartTime", ""),
            "end": item.get("EndTime", ""),
            "path": item.get("FilePath", ""),
            "type": item.get("Type", ""),
            "length": int(item.get("Length", 0)),
            "flags": item.get("Flags[0]", ""),
        })
    return results


def find_date_range(channel):
    """Find the oldest and newest recording timestamps for a channel."""
    # Oldest: search from epoch to now, get first result
    oldest = search_recordings(channel, "2020-01-01 00:00:00", "2030-12-31 23:59:59")
    if not oldest:
        return None, None

    first = oldest[0]["start"] if oldest else None

    # Newest: search today, get last result
    today = _dt.now().strftime("%Y-%m-%d")
    today_recs = search_recordings(channel, f"{today} 00:00:00", f"{today} 23:59:59")
    last = today_recs[-1]["end"] if today_recs else None

    return first, last


# ─── Recording Cache Class ───

class RecordingCache(threading.Thread):
    """Background daemon: downloads DVR recordings to local disk.

    Periodically queries each channel for recording segments, downloads missing
    ones via loadfile.cgi (main stream, HD 30fps), and prunes files older than
    CACHE_MAX_AGE_DAYS.  Files are raw .dav (DHAV) that ffmpeg reads directly.

    Directory layout:
        /config/recordings/ch1/2026-04-16/14-00-00_14-30-00.dav
    """

    def __init__(self):
        super().__init__(daemon=True)
        os.makedirs(CACHE_DIR, exist_ok=True)
        self.state = "starting"
        self.last_sync = None
        self.last_error = None
        self._stop = threading.Event()
        # On-demand download queue and progress tracking
        self._ondemand_queue = _queue.Queue()
        self._ondemand_progress = {}  # (ch, start, end) → {status, segs_total, segs_done, bytes_done}
        self._ondemand_lock = threading.Lock()

    # ── path helpers ──

    @staticmethod
    def _seg_path(channel, start_time, end_time):
        """Local path for a segment.  channel=1..4, times='YYYY-MM-DD HH:MM:SS'."""
        date = start_time[:10]
        s = start_time[11:].replace(":", "-")
        e = end_time[11:].replace(":", "-")
        return os.path.join(CACHE_DIR, f"ch{channel}", date, f"{s}_{e}.dav")

    @staticmethod
    def _parse_filename(fname):
        """Parse 'HH-MM-SS_HH-MM-SS.dav' → (start_time_str, end_time_str) HH:MM:SS."""
        base = fname.replace(".dav", "")
        parts = base.split("_", 1)
        if len(parts) != 2:
            return None, None
        return parts[0].replace("-", ":"), parts[1].replace("-", ":")

    # ── query ──

    def find_local_files(self, channel, start_str, end_str):
        """Find cached .dav files overlapping [start_str, end_str].

        Returns list of (path, seg_start_dt, seg_end_dt) sorted by start.
        Channel is 1-indexed.  Times are 'YYYY-MM-DD HH:MM:SS'.
        """
        start_dt = _dt.strptime(start_str, "%Y-%m-%d %H:%M:%S")
        end_dt = _dt.strptime(end_str, "%Y-%m-%d %H:%M:%S")
        results = []
        ch_dir = os.path.join(CACHE_DIR, f"ch{channel}")
        if not os.path.isdir(ch_dir):
            return results

        day = start_dt.date()
        while day <= end_dt.date():
            date_dir = os.path.join(ch_dir, day.strftime("%Y-%m-%d"))
            if os.path.isdir(date_dir):
                date_str = day.strftime("%Y-%m-%d")
                for fname in os.listdir(date_dir):
                    if not fname.endswith(".dav"):
                        continue
                    s_time, e_time = self._parse_filename(fname)
                    if s_time is None:
                        continue
                    try:
                        seg_s = _dt.strptime(f"{date_str} {s_time}", "%Y-%m-%d %H:%M:%S")
                        seg_e = _dt.strptime(f"{date_str} {e_time}", "%Y-%m-%d %H:%M:%S")
                    except ValueError:
                        continue
                    # overlap check
                    if seg_s < end_dt and seg_e > start_dt:
                        results.append((os.path.join(date_dir, fname), seg_s, seg_e))
            day += _td(days=1)

        results.sort(key=lambda x: x[1])
        return results

    # ── on-demand download ──

    def request_download(self, channel, start_str, end_str):
        """Queue an on-demand download for a specific time range.

        Called when the user requests playback of uncached content.
        The background thread picks these up with priority over auto-sync.
        """
        key = (channel, start_str, end_str)
        with self._ondemand_lock:
            if key in self._ondemand_progress:
                st = self._ondemand_progress[key].get("status")
                if st in ("queued", "downloading", "ready"):
                    return  # already in progress or done
            self._ondemand_progress[key] = {
                "status": "queued",
                "segs_total": 0,
                "segs_done": 0,
                "bytes_done": 0,
            }
        self._ondemand_queue.put(key)

    def get_download_progress(self, channel, start_str, end_str):
        """Return progress dict for an on-demand download request."""
        key = (channel, start_str, end_str)
        with self._ondemand_lock:
            info = self._ondemand_progress.get(key)
            if info:
                return dict(info)
        # Not in on-demand tracker — check if already cached
        local = self.find_local_files(channel, start_str, end_str)
        if local:
            return {"status": "ready", "segs_total": len(local), "segs_done": len(local), "bytes_done": 0}
        return {"status": "none"}

    def _process_ondemand(self):
        """Process one on-demand download request.  Returns True if work was done."""
        try:
            key = self._ondemand_queue.get_nowait()
        except _queue.Empty:
            return False

        channel, start_str, end_str = key

        # Find DVR segments covering this range
        segments = search_recordings(str(channel), start_str, end_str)
        if not segments:
            with self._ondemand_lock:
                self._ondemand_progress[key] = {"status": "error", "error": "no recordings found",
                                                 "segs_total": 0, "segs_done": 0, "bytes_done": 0}
            return True

        # Filter to main-stream only, determine which need downloading
        main_segs = [s for s in segments if "/512/" not in s.get("path", "")]
        pending = []
        for seg in main_segs:
            if not os.path.exists(self._seg_path(channel, seg["start"], seg["end"])):
                pending.append((seg["start"], seg["end"]))

        total = len(main_segs)
        done = total - len(pending)

        with self._ondemand_lock:
            self._ondemand_progress[key].update({
                "status": "downloading" if pending else "ready",
                "segs_total": total,
                "segs_done": done,
                "bytes_done": 0,
            })

        if not pending:
            return True

        bytes_done = 0
        for seg_start, seg_end in pending:
            if self._stop.is_set():
                break
            print(f"[cache] on-demand ch{channel} {seg_start} → {seg_end}", flush=True)
            result = self._download_seg(channel, seg_start, seg_end)
            done += 1
            if result:
                bytes_done += os.path.getsize(result)
            with self._ondemand_lock:
                self._ondemand_progress[key].update({
                    "segs_done": done,
                    "bytes_done": bytes_done,
                })

        with self._ondemand_lock:
            self._ondemand_progress[key]["status"] = "ready"

        return True

    # ── download ──

    def _free_gb(self):
        try:
            st = os.statvfs(CACHE_DIR)
            return (st.f_bavail * st.f_frsize) / (1024 ** 3)
        except Exception:
            return 999  # can't check — don't block

    def _download_seg(self, channel, start_time, end_time):
        """Download one segment via loadfile.cgi.  channel=1..4.

        Returns file path on success, None on failure.
        """
        path = self._seg_path(channel, start_time, end_time)
        if os.path.exists(path):
            return path

        tmp = path + ".tmp"
        os.makedirs(os.path.dirname(path), exist_ok=True)

        # loadfile.cgi uses 1-indexed channel (same as RTSP)
        url = (
            f"{DVR_BASE}/cgi-bin/loadfile.cgi"
            f"?action=startLoad&channel={channel}"
            f"&startTime={urllib.parse.quote(start_time)}"
            f"&endTime={urllib.parse.quote(end_time)}"
            f"&subtype=0"
        )
        try:
            resp = _dvr_opener.open(url, timeout=600)
            total = 0
            with open(tmp, "wb") as f:
                while True:
                    chunk = resp.read(65536)
                    if not chunk:
                        break
                    f.write(chunk)
                    total += len(chunk)
            if total < 1024:
                os.remove(tmp)
                return None
            os.rename(tmp, path)
            return path
        except Exception as e:
            print(f"[cache] download failed ch{channel} {start_time}: {e}", flush=True)
            try:
                os.remove(tmp)
            except OSError:
                pass
            return None

    # ── sync ──

    def _sync_channel(self, channel):
        """Download missing segments for one channel (1-indexed).
        Returns list of (seg_start, seg_end) pairs that need downloading."""
        now = _dt.now()
        start = (now - _td(days=CACHE_AUTO_SYNC_DAYS)).strftime("%Y-%m-%d 00:00:00")
        end = now.strftime("%Y-%m-%d %H:%M:%S")

        segments = search_recordings(str(channel), start, end)
        if not segments:
            return []

        # Sort newest first so recent recordings are available sooner
        segments.sort(key=lambda s: s["start"], reverse=True)

        pending = []
        for seg in segments:
            seg_start = seg["start"]
            seg_end = seg["end"]
            # Skip sub-stream paths (contain /512/ in DVR file path)
            if "/512/" in seg.get("path", ""):
                continue
            if os.path.exists(self._seg_path(channel, seg_start, seg_end)):
                continue
            pending.append((seg_start, seg_end))

        return pending

    def _prune(self):
        """Delete cached .dav files older than CACHE_RETENTION_HOURS."""
        cutoff_dt = _dt.now() - _td(hours=CACHE_RETENTION_HOURS)
        removed = 0
        for ch_name in os.listdir(CACHE_DIR):
            ch_dir = os.path.join(CACHE_DIR, ch_name)
            if not os.path.isdir(ch_dir) or not ch_name.startswith("ch"):
                continue
            for date_name in os.listdir(ch_dir):
                date_dir = os.path.join(ch_dir, date_name)
                if not os.path.isdir(date_dir):
                    continue
                for fname in os.listdir(date_dir):
                    if not fname.endswith(".dav"):
                        continue
                    fpath = os.path.join(date_dir, fname)
                    _, end_time = self._parse_filename(fname)
                    seg_end = None
                    if end_time:
                        try:
                            seg_end = _dt.strptime(f"{date_name} {end_time}", "%Y-%m-%d %H:%M:%S")
                        except ValueError:
                            seg_end = None
                    if seg_end is None:
                        seg_end = _dt.fromtimestamp(os.path.getmtime(fpath))
                    if seg_end < cutoff_dt:
                        try:
                            os.remove(fpath)
                            removed += 1
                        except OSError:
                            pass

                # Remove now-empty date directories
                try:
                    if not os.listdir(date_dir):
                        os.rmdir(date_dir)
                        print(f"[cache] pruned {ch_name}/{date_name}", flush=True)
                except OSError:
                    pass
        return removed

    def sync_once(self):
        """Run one full sync: round-robin across all channels + prune.

        Interleaves downloads across channels so all 4 get recent
        recordings quickly, rather than completing ch1 before starting ch2.
        """
        # Gather pending segments for each channel
        queues = {}
        for ch in range(1, 5):
            if self._stop.is_set():
                break
            queues[ch] = self._sync_channel(ch)
            if queues[ch]:
                print(f"[cache] ch{ch}: {len(queues[ch])} segments to download", flush=True)

        # Round-robin: download one segment from each channel in turn
        total = 0
        any_left = True
        while any_left and not self._stop.is_set():
            # Yield to on-demand requests — they have priority
            if not self._ondemand_queue.empty():
                print("[cache] pausing auto-sync for on-demand request", flush=True)
                break

            any_left = False
            for ch in range(1, 5):
                if self._stop.is_set() or not self._ondemand_queue.empty():
                    break
                if not queues.get(ch):
                    continue
                any_left = True

                if self._free_gb() < CACHE_MIN_FREE_GB:
                    print(f"[cache] low disk ({self._free_gb():.0f} GB free), pausing", flush=True)
                    any_left = False
                    break

                seg_start, seg_end = queues[ch].pop(0)
                # Re-check in case another thread cached it
                if os.path.exists(self._seg_path(ch, seg_start, seg_end)):
                    continue

                print(f"[cache] downloading ch{ch} {seg_start} → {seg_end}", flush=True)
                t0 = _time.time()
                result = self._download_seg(ch, seg_start, seg_end)
                if result:
                    sz = os.path.getsize(result) / (1024 * 1024)
                    elapsed = _time.time() - t0
                    print(f"[cache] done {sz:.0f} MB in {elapsed:.0f}s ({sz/elapsed:.1f} MB/s)", flush=True)
                    total += 1

        self._prune()
        self.last_sync = _dt.now().isoformat()
        return total

    def get_stats(self):
        """Return cache statistics for /api/cache/status."""
        total_files = 0
        total_bytes = 0
        for root, _dirs, files in os.walk(CACHE_DIR):
            for f in files:
                if f.endswith(".dav"):
                    total_files += 1
                    total_bytes += os.path.getsize(os.path.join(root, f))
        return {
            "state": self.state,
            "last_sync": self.last_sync,
            "last_error": self.last_error,
            "files": total_files,
            "size_gb": round(total_bytes / (1024 ** 3), 2),
            "free_gb": round(self._free_gb(), 1),
        }

    def run(self):
        """Background loop: on-demand downloads have priority, then auto-sync."""
        _time.sleep(15)  # let DVR proxy + go2rtc start first
        print("[cache] recording cache daemon started", flush=True)

        while not self._stop.is_set():
            # Priority: process all pending on-demand requests first
            while self._process_ondemand():
                if self._stop.is_set():
                    return

            try:
                self.state = "syncing"
                n = self.sync_once()
                self.state = "idle"
                self.last_error = None
                if n:
                    print(f"[cache] sync done: {n} new segments", flush=True)
            except Exception as e:
                self.state = "error"
                self.last_error = str(e)
                print(f"[cache] sync error: {e}", flush=True)

            # Sleep in 1s increments so we wake quickly for on-demand requests
            for _ in range(CACHE_POLL_INTERVAL_S):
                if self._stop.is_set():
                    return
                if not self._ondemand_queue.empty():
                    break
                _time.sleep(1)


# Global cache instance (created in main())
_recording_cache = None


def go2rtc_webrtc(stream_name, sdp_offer):
    """Exchange SDP offer for answer via go2rtc WebRTC API."""
    try:
        encoded = urllib.parse.quote(stream_name, safe="")
        req = urllib.request.Request(
            f"{GO2RTC_BASE}/api/webrtc?src={encoded}",
            data=sdp_offer.encode(),
            method="POST",
            headers={"Content-Type": "application/sdp"},
        )
        r = urllib.request.urlopen(req, timeout=15)
        return r.read().decode()
    except Exception as e:
        return None


def ensure_dvrip_streams():
    """Register DVRIP streams in go2rtc if they don't already exist."""
    try:
        r = urllib.request.urlopen(f"{GO2RTC_BASE}/api/streams", timeout=5)
        existing = json.loads(r.read().decode())
    except Exception as e:
        print(f"[dvr_proxy] go2rtc not ready, will retry: {e}", flush=True)
        return False

    for name, url in DVRIP_STREAMS.items():
        if name in existing:
            continue
        try:
            encoded_url = urllib.parse.quote(url, safe="")
            req = urllib.request.Request(
                f"{GO2RTC_BASE}/api/streams?name={name}&src={encoded_url}",
                method="PUT",
            )
            urllib.request.urlopen(req, timeout=10)
            print(f"[dvr_proxy] Registered stream '{name}' (DVRIP)", flush=True)
        except Exception as e:
            print(f"[dvr_proxy] Failed to register '{name}': {e}", flush=True)
            return False
    return True


# ─── RTSP Scale Proxy ───
#
# go2rtc doesn't send an RTSP Scale header in PLAY commands, so the DVR
# always plays at its default speed.  This transparent TCP proxy sits between
# go2rtc and the DVR, forwarding all bytes unchanged *except* PLAY requests
# where it injects "Scale: N.000".  The scale value is set by /api/playback/start.


class RTSPScaleProxy(threading.Thread):
    """Transparent TCP proxy that injects Scale header into RTSP PLAY."""

    def __init__(self, port=RTSP_PROXY_PORT):
        super().__init__(daemon=True)
        self.port = port

    def run(self):
        srv = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        srv.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        srv.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEPORT, 1)
        srv.bind(("0.0.0.0", self.port))
        srv.listen(5)
        print(f"RTSP Scale proxy listening on port {self.port}", flush=True)
        while True:
            client, _ = srv.accept()
            threading.Thread(
                target=self._handle_session, args=(client,), daemon=True
            ).start()

    # ── per-session handler ──

    def _handle_session(self, client):
        scale = _playback_scale["value"]
        dvr = None
        try:
            dvr = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            dvr.settimeout(10)
            dvr.connect((DVR_HOST, 554))

            done = threading.Event()

            def client_to_dvr():
                """Forward client→DVR; inject Scale into PLAY requests."""
                buf = b""
                try:
                    while not done.is_set():
                        client.settimeout(1)
                        try:
                            data = client.recv(4096)
                        except socket.timeout:
                            continue
                        if not data:
                            break
                        buf += data

                        # Process complete messages in the buffer
                        while buf:
                            if buf[0:1] == b"$":
                                # Interleaved RTP/RTCP: $<ch:1><len:2><payload>
                                if len(buf) < 4:
                                    break
                                pkt_len = int.from_bytes(buf[2:4], "big") + 4
                                if len(buf) < pkt_len:
                                    break
                                dvr.sendall(buf[:pkt_len])
                                buf = buf[pkt_len:]
                            elif b"\r\n\r\n" in buf:
                                idx = buf.index(b"\r\n\r\n") + 4
                                req = buf[:idx]
                                buf = buf[idx:]
                                req = _inject_scale(req, scale)
                                dvr.sendall(req)
                            else:
                                break
                except Exception:
                    pass
                finally:
                    done.set()
                    try:
                        dvr.shutdown(socket.SHUT_WR)
                    except Exception:
                        pass

            def dvr_to_client():
                """Forward DVR→Client: all data unchanged."""
                try:
                    while not done.is_set():
                        dvr.settimeout(1)
                        try:
                            data = dvr.recv(65536)
                        except socket.timeout:
                            continue
                        if not data:
                            break
                        client.sendall(data)
                except Exception:
                    pass
                finally:
                    done.set()
                    try:
                        client.shutdown(socket.SHUT_WR)
                    except Exception:
                        pass

            t1 = threading.Thread(target=client_to_dvr, daemon=True)
            t2 = threading.Thread(target=dvr_to_client, daemon=True)
            t1.start()
            t2.start()
            t1.join(timeout=14400)  # max 4 h playback session
            t2.join(timeout=5)
        except Exception as e:
            print(f"RTSP proxy session error: {e}", flush=True)
        finally:
            for s in (client, dvr):
                if s:
                    try:
                        s.close()
                    except Exception:
                        pass


def _inject_scale(req_bytes, scale):
    """If req is a PLAY request, insert a Scale header."""
    if not req_bytes[:5].upper().startswith(b"PLAY "):
        return req_bytes
    # Find the end-of-headers marker \r\n\r\n
    end = req_bytes.rfind(b"\r\n\r\n")
    if end < 0:
        return req_bytes
    # Remove any existing Scale header (shouldn't be one, but be safe)
    lines = req_bytes[:end].split(b"\r\n")
    lines = [l for l in lines if not l.lower().startswith(b"scale:")]
    # Re-assemble with Scale header appended
    lines.append(f"Scale: {float(scale):.3f}".encode())
    return b"\r\n".join(lines) + b"\r\n\r\n"


# ─── HTTP Handler ───

# Sub-stream I-frame interval: 1 second (90000 ticks at 90 kHz).
# Main stream I-frame interval: ~10 seconds — sub-stream is required for Scale
# trick-play so setts can assign the correct 1 s duration per keyframe.
_SUB_STREAM_IFRAME_DUR = 90000  # 1 s at 90 kHz timescale


def _start_ffmpeg(channel, rtsp_start, rtsp_end, speed=1, start_time_str=None, end_time_str=None):
    """Start ffmpeg for DVR playback and return (subprocess, source_type).

    If cached .dav files exist locally, reads from disk (any speed works).
    Otherwise falls back to RTSP sub-stream from DVR at 1x only.

    Returns:
        (proc, source) where source is "cache" or "dvr".
        proc may be None if streaming is handled by go2rtc (legacy path).
    """
    _playback_scale["value"] = 1.0
    _playback_state["use_go2rtc"] = False

    # ── Try local cache first ──
    local_files = None
    if _recording_cache and start_time_str and end_time_str:
        local_files = _recording_cache.find_local_files(channel, start_time_str, end_time_str)
        if local_files:
            # Verify the cache actually covers the requested start time.
            # If the first cached file starts AFTER the requested time,
            # the cache has a gap at the beginning — fall back to RTSP.
            req_start = _dt.strptime(start_time_str, "%Y-%m-%d %H:%M:%S")
            first_seg_start = local_files[0][1]
            if first_seg_start > req_start:
                print(
                    f"[dvr_proxy] ffmpeg: ch{channel} cache gap — "
                    f"requested {start_time_str}, first cached file starts "
                    f"{first_seg_start.strftime('%H:%M:%S')}, falling back to RTSP",
                    flush=True,
                )
                local_files = None

    if local_files:
        # Calculate seek offset: how far into the first file to start
        req_start = _dt.strptime(start_time_str, "%Y-%m-%d %H:%M:%S")
        req_end = _dt.strptime(end_time_str, "%Y-%m-%d %H:%M:%S")
        first_seg_start = local_files[0][1]
        seek_secs = max(0, (req_start - first_seg_start).total_seconds())
        duration_secs = (req_end - req_start).total_seconds()

        # Seeking strategy:
        #   Single file  → pre-input -ss (fast keyframe seek) + -readrate OK
        #   Concat files → post-input -ss (pre-input is silently ignored by
        #                   concat demuxer).  With -c:v copy the seek just
        #                   scans packets (~1s for 30min file from disk).
        #                   -readrate doesn't work with post-input -ss, so
        #                   we always use Python-side throttling for concat.
        use_readrate = False  # default off; enabled for single-file path
        post_input_args = []  # args placed after -i (output-side)

        if len(local_files) == 1:
            # Pre-input -ss for fast keyframe-accurate seek
            input_args = ["-ss", str(seek_secs), "-i", local_files[0][0]]
            use_readrate = True
        else:
            concat_path = f"/tmp/dvr_concat_{channel}_{int(_time.time())}.txt"
            with open(concat_path, "w") as f:
                for fpath, _, _ in local_files:
                    f.write(f"file '{fpath}'\n")
            input_args = ["-f", "concat", "-safe", "0", "-i", concat_path]
            if seek_secs > 0:
                post_input_args = ["-ss", str(seek_secs)]

        readrate_args = []
        if use_readrate:
            readrate_args = ["-readrate", str(max(1, speed)), "-readrate_initial_burst", "2"]

        cmd = [
            "ffmpeg", "-hide_banner", "-loglevel", "error",
            *readrate_args,
            *input_args,
            *post_input_args,
            "-t", str(duration_secs),
            "-c:v", "copy",
            "-an",
            "-f", "mp4",
            "-movflags", "frag_keyframe+empty_moov+default_base_moof",
            "pipe:1",
        ]

        n = len(local_files)
        if not use_readrate:
            throttle = "python"
        else:
            throttle = f"readrate={max(1, speed)}"
        print(
            f"[dvr_proxy] ffmpeg: ch{channel} LOCAL {n} file(s), "
            f"seek={seek_secs:.0f}s, duration={duration_secs:.0f}s, speed={speed}x, "
            f"throttle={throttle}",
            flush=True,
        )
        # Full-frame copy: use Python throttle for concat (no -readrate).
        _playback_state["needs_throttle"] = not use_readrate
        return subprocess.Popen(
            cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
        ), "cache"

    # ── Fallback: RTSP from DVR — always 1x ──
    # Speed controls are only available for cached content.  DVR streams
    # always play at 1x; the frontend disables speed buttons accordingly.
    _playback_scale["value"] = 1.0
    _playback_state["needs_throttle"] = False
    rtsp_url = (
        f"rtsp://{DVR_USER}:{DVR_PASS}@{DVR_HOST}:554"
        f"/cam/playback?channel={channel}&subtype=1"
        f"&starttime={rtsp_start}&endtime={rtsp_end}"
    )
    cmd = [
        "ffmpeg", "-hide_banner", "-loglevel", "error",
        "-rtsp_transport", "tcp",
        "-fflags", "+nobuffer+discardcorrupt",
        "-flags", "+low_delay",
        "-probesize", "32768",
        "-analyzeduration", "500000",
        "-i", rtsp_url,
        "-c:v", "copy",
        "-an",
        "-f", "mp4",
        "-movflags", "frag_keyframe+empty_moov+default_base_moof",
        "pipe:1",
    ]
    print(f"[dvr_proxy] ffmpeg: ch{channel} RTSP {rtsp_start}\u2192{rtsp_end} speed=1x (sub-stream, DVR fallback)", flush=True)
    return subprocess.Popen(
        cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
    ), "dvr"


def _kill_ffmpeg():
    """Kill any active ffmpeg playback process and clean up go2rtc stream."""
    proc = _playback_state["proc"]
    if proc and proc.poll() is None:
        proc.terminate()
        try:
            proc.wait(timeout=5)
        except Exception:
            proc.kill()
    _playback_state["proc"] = None
    # Clean up go2rtc playback stream if it was registered
    if _playback_state.get("use_go2rtc"):
        _playback_state["use_go2rtc"] = False
        _playback_scale["value"] = 1.0
        try:
            req = urllib.request.Request(
                f"{GO2RTC_BASE}/api/streams?name=playback", method="DELETE"
            )
            urllib.request.urlopen(req, timeout=5)
        except Exception:
            pass


# ─── Clip Export System ───
#
# Exports DVR recordings as MP4 clips. Uses ffmpeg to remux cached .dav files
# (or RTSP stream for uncached segments) into a proper MP4 container.
# Clips are stored in CLIPS_DIR with metadata in clips.json.

_clips_lock = threading.Lock()
_active_exports: dict[str, subprocess.Popen] = {}  # clip_id → ffmpeg proc


def _load_clips_meta() -> list:
    """Load clips metadata from JSON file."""
    if not os.path.exists(CLIPS_META):
        return []
    try:
        with open(CLIPS_META, "r") as f:
            return json.load(f)
    except (json.JSONDecodeError, OSError):
        return []


def _save_clips_meta(clips: list):
    """Save clips metadata to JSON file."""
    os.makedirs(CLIPS_DIR, exist_ok=True)
    tmp = CLIPS_META + ".tmp"
    with open(tmp, "w") as f:
        json.dump(clips, f, indent=2)
    os.rename(tmp, CLIPS_META)


def _export_clip(clip_id, channel, start_str, end_str, name):
    """Background thread: export a clip from cached .dav files → MP4."""
    try:
        os.makedirs(CLIPS_DIR, exist_ok=True)
        out_path = os.path.join(CLIPS_DIR, f"{clip_id}.mp4")
        thumb_path = os.path.join(CLIPS_DIR, f"{clip_id}.jpg")

        # Find cached files covering the range
        local_files = None
        if _recording_cache:
            local_files = _recording_cache.find_local_files(channel, start_str, end_str)
            if local_files:
                req_start = _dt.strptime(start_str, "%Y-%m-%d %H:%M:%S")
                if local_files[0][1] > req_start:
                    local_files = None  # cache gap

        if local_files:
            req_start = _dt.strptime(start_str, "%Y-%m-%d %H:%M:%S")
            req_end = _dt.strptime(end_str, "%Y-%m-%d %H:%M:%S")
            first_seg_start = local_files[0][1]
            seek_secs = max(0, (req_start - first_seg_start).total_seconds())
            duration_secs = (req_end - req_start).total_seconds()

            if len(local_files) == 1:
                input_args = ["-i", local_files[0][0]]
            else:
                concat_path = f"/tmp/dvr_clip_concat_{clip_id}.txt"
                with open(concat_path, "w") as f:
                    for fpath, _, _ in local_files:
                        f.write(f"file '{fpath}'\n")
                input_args = ["-f", "concat", "-safe", "0", "-i", concat_path]

            cmd = [
                "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
                "-ss", str(seek_secs),
                *input_args,
                "-t", str(duration_secs),
                "-c:v", "copy",
                "-an",
                "-movflags", "+faststart",
                out_path,
            ]
        else:
            # RTSP fallback
            rtsp_start = start_str.replace("-", "_").replace(" ", "_").replace(":", "_")
            rtsp_end = end_str.replace("-", "_").replace(" ", "_").replace(":", "_")
            rtsp_url = (
                f"rtsp://{DVR_USER}:{DVR_PASS}@{DVR_HOST}:554"
                f"/cam/playback?channel={channel}&subtype=0"
                f"&starttime={rtsp_start}&endtime={rtsp_end}"
            )
            cmd = [
                "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
                "-rtsp_transport", "tcp",
                "-i", rtsp_url,
                "-c:v", "copy",
                "-an",
                "-movflags", "+faststart",
                out_path,
            ]

        print(f"[clips] exporting {clip_id}: ch{channel} {start_str} → {end_str}", flush=True)
        proc = subprocess.Popen(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
        with _clips_lock:
            _active_exports[clip_id] = proc
        proc.wait()
        with _clips_lock:
            _active_exports.pop(clip_id, None)

        if proc.returncode != 0:
            stderr_out = proc.stderr.read().decode(errors="replace") if proc.stderr else ""
            print(f"[clips] export failed {clip_id}: {stderr_out[:200]}", flush=True)
            _update_clip_status(clip_id, "failed")
            return

        # Generate thumbnail from first frame
        try:
            subprocess.run([
                "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
                "-i", out_path,
                "-frames:v", "1",
                "-vf", "scale=320:-1",
                thumb_path,
            ], timeout=30, capture_output=True)
        except Exception:
            pass  # thumbnail is optional

        file_size = os.path.getsize(out_path)
        _update_clip_status(clip_id, "ready", file_size=file_size)
        print(f"[clips] exported {clip_id}: {file_size / (1024*1024):.1f} MB", flush=True)

    except Exception as e:
        print(f"[clips] export error {clip_id}: {e}", flush=True)
        _update_clip_status(clip_id, "failed")
        with _clips_lock:
            _active_exports.pop(clip_id, None)


def _update_clip_status(clip_id, status, file_size=None):
    """Update a clip's status in the metadata file."""
    with _clips_lock:
        clips = _load_clips_meta()
        for clip in clips:
            if clip["id"] == clip_id:
                clip["status"] = status
                if file_size is not None:
                    clip["file_size"] = file_size
                break
        _save_clips_meta(clips)


class DVRHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        pass  # Suppress access logs

    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, DELETE")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.send_header("Access-Control-Expose-Headers", "X-Rate-Hint")

    def _json_response(self, data, status=200):
        body = json.dumps(data).encode()
        self.send_response(status)
        self._cors()
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _proxy_mse_stream(self, stream_name):
        """Proxy go2rtc's fMP4 live stream to the browser.

        Uses a producer-consumer queue to decouple reading from go2rtc and
        writing to the browser.  Without this, a slow browser (JS busy) backs
        up the browser TCP socket → dvr_proxy write() blocks → can't read from
        go2rtc → go2rtc overfills its output queue and drops H.264 packets.

        The reader thread drains go2rtc as fast as possible (localhost speed)
        into a bounded queue (~128 × 65 KB = ~8 MB).  The main thread drains
        the queue to the browser at browser speed.  If the browser falls too
        far behind, the reader blocks up to 2 s before dropping a chunk.
        Blocking (not immediate drop) prevents fMP4 stream corruption: a dropped
        65 KB raw chunk straddles atom boundaries, sending malformed data to MSE
        which triggers MediaError → reconnect.  The 2 s window absorbs typical
        VBR spikes without propagating backpressure to go2rtc.
        """
        stop_event = threading.Event()
        buf = _queue.Queue(maxsize=128)  # ~8 MB headroom at 65 KB/chunk; absorbs VBR spikes
        conn = None

        def reader():
            nonlocal conn
            try:
                encoded = urllib.parse.quote(stream_name, safe="")
                # Retry connection — after DELETE+PUT, go2rtc may need time to
                # establish the new RTSP connection through the Scale proxy.
                resp = None
                for attempt in range(5):
                    try:
                        conn = _httplib.HTTPConnection("localhost", 1984, timeout=10)
                        conn.request("GET", f"/api/stream.mp4?src={encoded}")
                        resp = conn.getresponse()
                        if resp.status == 200:
                            break
                        conn.close()
                        conn = None
                    except Exception:
                        if conn:
                            try: conn.close()
                            except Exception: pass
                            conn = None
                    if attempt < 4:
                        _time.sleep(1)
                if resp is None or resp.status != 200:
                    buf.put(None)  # signal: header error
                    return
                buf.put(("headers", resp.getheader("Content-Type", 'video/mp4; codecs="avc1.640028"')))
                # For playback at speed > 1, rewrite fMP4 timestamps so the
                # browser's MSE SourceBuffer spreads I-frames evenly instead
                # of clustering them all within <0.5s (DVR's compressed RTP
                # timestamps).
                rewriter = None
                if stream_name == "playback" and _playback_scale.get("value", 1.0) > 1.0:
                    rewriter = FMP4Rewriter(scale=_playback_scale.get("value", 1.0))
                while not stop_event.is_set():
                    chunk = resp.read(65536)
                    if not chunk:
                        break
                    if rewriter:
                        chunk = rewriter.feed(chunk)
                        if not chunk:
                            continue  # rewriter buffering incomplete box
                    try:
                        buf.put(chunk, timeout=2.0)  # allow brief backpressure before dropping
                    except _queue.Full:
                        pass  # drop only if browser stalled >2s — prevents fMP4 corruption from mid-chunk drops
            except Exception:
                pass
            finally:
                buf.put(None)  # sentinel: stream ended
                try:
                    conn.close()
                except Exception:
                    pass

        t = threading.Thread(target=reader, daemon=True)
        t.start()

        try:
            first = buf.get(timeout=10)
            if first is None or not isinstance(first, tuple):
                self._json_response({"error": "go2rtc stream failed"}, 502)
                stop_event.set()
                return

            _, ct = first
            self.send_response(200)
            self._cors()
            self.send_header("Content-Type", ct)
            # Tell PlaybackFeed the target playback rate.  When FMP4Rewriter
            # is active, rate=1 because DVR Scale already provides speed.
            if stream_name == "playback" and _playback_scale.get("value", 1.0) > 1.0:
                self.send_header("X-Rate-Hint", "1")
            self.send_header("Cache-Control", "no-cache, no-store")
            self.send_header("Connection", "close")
            self.end_headers()
            self.wfile.flush()

            while True:
                chunk = buf.get(timeout=30)
                if chunk is None:
                    break
                self.wfile.write(chunk)
                self.wfile.flush()
        except (BrokenPipeError, ConnectionResetError):
            pass  # Browser closed connection
        except Exception as e:
            try:
                self._json_response({"error": str(e)}, 502)
            except Exception:
                pass
        finally:
            stop_event.set()
            t.join(timeout=2)

    def _proxy_mp4_stream(self):
        """Stream DVR playback as fMP4 directly to the HTTP response.

        If ffmpeg was pre-started by /api/playback/start, reuse that process.
        Otherwise start it now.  For RTSP fallback at speed > 1, delegates
        to go2rtc via _proxy_mse_stream (proven Scale proxy + FMP4Rewriter path).
        """
        # go2rtc mode: RTSP fallback at speed > 1 registered a go2rtc stream
        if _playback_state.get("use_go2rtc"):
            self._proxy_mse_stream("playback")
            return

        with _lock:
            proc = _playback_state["proc"]
            channel = _playback_state["channel"]
            speed = _playback_state.get("speed", 1)
            needs_throttle = _playback_state.get("needs_throttle", False)

            if proc and proc.poll() is not None:
                # Pre-started ffmpeg already exited (error) — clear it
                stderr_out = b""
                try:
                    stderr_out = proc.stderr.read(4096) if proc.stderr else b""
                except Exception:
                    pass
                if stderr_out:
                    print(f"[dvr_proxy] ffmpeg stderr: {stderr_out.decode(errors='replace').strip()}", flush=True)
                proc = None
                _playback_state["proc"] = None

        if not proc:
            # No pre-started process — start one now (fallback)
            with _lock:
                channel = _playback_state["channel"]
                rtsp_start = _playback_state["rtsp_start"]
                rtsp_end = _playback_state["rtsp_end"]
            if not channel or not rtsp_start:
                self._json_response({"error": "no active playback"}, 404)
                return
            speed = _playback_state.get("speed", 1)
            start_str = _playback_state.get("start_time_str")
            end_str = _playback_state.get("end_time_str")
            proc, _src = _start_ffmpeg(channel, rtsp_start, rtsp_end, speed,
                                       start_time_str=start_str, end_time_str=end_str)
            with _lock:
                _playback_state["proc"] = proc

        try:
            self.send_response(200)
            self._cors()
            self.send_header("Content-Type", 'video/mp4; codecs="avc1.640028"')
            self.send_header("X-Rate-Hint", str(speed))
            self.send_header("Connection", "close")
            self.end_headers()
            self.wfile.flush()

            # Stream ffmpeg stdout → HTTP response using os.read for
            # non-buffered reads (returns as soon as data is available).
            # When -readrate can't be used (concat + seek), throttle here.
            fd = proc.stdout.fileno()
            if needs_throttle and speed >= 1:
                # Main stream: 768kbps = 96KB/s.  Use generous 3× headroom —
                # browser-side flow control (pause reader at 15s ahead, resume
                # at 10s) handles precise rate limiting via TCP backpressure.
                # This throttle just prevents disk-speed data dumps.
                target_bps = 96_000 * 3.0 * max(1, speed)
                burst_bytes = int(target_bps * 2)  # 2s initial burst
                t0 = _time.time()
                total = 0
                while True:
                    data = os.read(fd, 65536)
                    if not data:
                        break
                    self.wfile.write(data)
                    self.wfile.flush()
                    total += len(data)
                    if total > burst_bytes:
                        now = _time.time()
                        expected = total / target_bps
                        if expected > (now - t0):
                            _time.sleep(expected - (now - t0))
            else:
                while True:
                    data = os.read(fd, 65536)
                    if not data:
                        break
                    self.wfile.write(data)
                    self.wfile.flush()
        except (BrokenPipeError, ConnectionResetError):
            pass  # Browser closed connection
        except Exception as e:
            try:
                self._json_response({"error": str(e)}, 502)
            except Exception:
                pass
        finally:
            if proc:
                # Capture any stderr before termination for debugging
                stderr_out = b""
                try:
                    stderr_out = proc.stderr.read(4096) if proc.stderr else b""
                except Exception:
                    pass
                if stderr_out:
                    print(f"[dvr_proxy] ffmpeg stderr: {stderr_out.decode(errors='replace').strip()}", flush=True)
                proc.terminate()
                try:
                    proc.wait(timeout=5)
                except Exception:
                    proc.kill()
                with _lock:
                    if _playback_state["proc"] is proc:
                        _playback_state["proc"] = None

    def _read_body(self):
        length = int(self.headers.get("Content-Length", 0))
        if length:
            return self.rfile.read(length)
        return b""

    def do_OPTIONS(self):
        self.send_response(204)
        self._cors()
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        qs = dict(urllib.parse.parse_qsl(parsed.query))

        if path == "/api/recordings":
            channel = qs.get("channel", "1")
            start = qs.get("start", "")
            end = qs.get("end", "")
            if not start or not end:
                self._json_response({"error": "start and end required"}, 400)
                return
            results = search_recordings(channel, start, end)
            self._json_response({"recordings": results})

        elif path == "/api/date-range":
            channel = qs.get("channel", "1")
            first, last = find_date_range(channel)
            self._json_response({"min_date": first, "max_date": last})

        elif path == "/api/timeline":
            channel = qs.get("channel", "1")
            date = qs.get("date", "")
            if not date:
                self._json_response({"error": "date required"}, 400)
                return
            results = search_recordings(channel, f"{date} 00:00:00", f"{date} 23:59:59")
            # Simplify to just time segments
            segments = [{"start": r["start"], "end": r["end"], "flags": r["flags"]} for r in results]
            self._json_response({"segments": segments, "channel": int(channel), "date": date})

        elif path == "/api/mse":
            src = qs.get("src", "")
            if not src or (src not in DVRIP_STREAMS and not src.startswith("camera.") and src != "playback"):
                self._json_response({"error": "unknown stream"}, 400)
                return
            self._proxy_mse_stream(src)

        elif path == "/api/health":
            self._json_response({"status": "ok"})

        elif path == "/api/cache/status":
            if _recording_cache:
                self._json_response(_recording_cache.get_stats())
            else:
                self._json_response({"state": "disabled"})

        elif path == "/api/cache/check":
            # Check if a time range is cached / being downloaded.
            # GET /api/cache/check?channel=N&start=YYYY-MM-DD+HH:MM:SS&end=YYYY-MM-DD+HH:MM:SS
            ch = int(qs.get("channel", "0"))
            start_str = qs.get("start", "")
            end_str = qs.get("end", "")
            if not ch or not start_str or not end_str:
                self._json_response({"error": "channel, start, end required"}, 400)
                return
            if _recording_cache:
                progress = _recording_cache.get_download_progress(ch, start_str, end_str)
                self._json_response(progress)
            else:
                self._json_response({"status": "none"})

        elif path == "/api/playback/stream":
            # Stream ffmpeg fMP4 directly — no go2rtc involved.
            # ffmpeg was pre-started by /api/playback/start via the RTSP Scale proxy
            # (port 8767) which injects Scale: N into the DVR's RTSP PLAY command.
            self._proxy_mp4_stream()

        elif path == "/api/clips":
            # List all saved clips (newest first)
            clips = _load_clips_meta()
            clips.sort(key=lambda c: c.get("created", 0), reverse=True)
            self._json_response({"clips": clips})

        elif path.startswith("/api/clips/") and path.endswith("/download"):
            # Download a clip MP4 file
            clip_id = path.split("/")[3]
            # Sanitize clip_id to prevent path traversal
            if "/" in clip_id or "\\" in clip_id or ".." in clip_id:
                self._json_response({"error": "invalid clip id"}, 400)
                return
            mp4_path = os.path.join(CLIPS_DIR, f"{clip_id}.mp4")
            if not os.path.exists(mp4_path):
                self._json_response({"error": "clip not found"}, 404)
                return
            # Find clip name for content-disposition
            clips = _load_clips_meta()
            clip_name = clip_id
            for c in clips:
                if c["id"] == clip_id and c.get("name"):
                    clip_name = c["name"].replace('"', '').replace('\n', '')
                    break
            file_size = os.path.getsize(mp4_path)
            self.send_response(200)
            self._cors()
            self.send_header("Content-Type", "video/mp4")
            self.send_header("Content-Length", str(file_size))
            self.send_header("Content-Disposition", f'attachment; filename="{clip_name}.mp4"')
            self.end_headers()
            with open(mp4_path, "rb") as f:
                while True:
                    chunk = f.read(65536)
                    if not chunk:
                        break
                    self.wfile.write(chunk)

        elif path.startswith("/api/clips/") and path.endswith("/thumb"):
            # Serve clip thumbnail
            clip_id = path.split("/")[3]
            if "/" in clip_id or "\\" in clip_id or ".." in clip_id:
                self._json_response({"error": "invalid clip id"}, 400)
                return
            thumb_path = os.path.join(CLIPS_DIR, f"{clip_id}.jpg")
            if not os.path.exists(thumb_path):
                self._json_response({"error": "thumbnail not found"}, 404)
                return
            file_size = os.path.getsize(thumb_path)
            self.send_response(200)
            self._cors()
            self.send_header("Content-Type", "image/jpeg")
            self.send_header("Content-Length", str(file_size))
            self.send_header("Cache-Control", "public, max-age=86400")
            self.end_headers()
            with open(thumb_path, "rb") as f:
                self.wfile.write(f.read())

        else:
            self._json_response({"error": "not found"}, 404)

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        body = self._read_body()

        if path == "/api/webrtc":
            # Live camera WebRTC signaling proxy.
            # Browser sends {stream: "channel_1", offer: "<SDP>"}.
            # We forward to go2rtc and return {answer: "<SDP>"}.
            try:
                data = json.loads(body)
            except Exception:
                self._json_response({"error": "invalid json"}, 400)
                return

            stream = data.get("stream", "")
            offer = data.get("offer", "")
            if not stream or not offer:
                self._json_response({"error": "stream and offer required"}, 400)
                return

            # Only allow known stream names
            if stream not in DVRIP_STREAMS and not stream.startswith("camera."):
                self._json_response({"error": "unknown stream"}, 400)
                return

            answer = go2rtc_webrtc(stream, offer)
            if answer:
                self._json_response({"answer": answer})
            else:
                self._json_response({"error": "WebRTC negotiation failed"}, 502)

        elif path == "/api/playback/start":
            try:
                data = json.loads(body)
            except:
                self._json_response({"error": "invalid json"}, 400)
                return

            channel = data.get("channel", 1)
            start_time = data.get("startTime", "")
            end_time = data.get("endTime", "")
            speed = data.get("speed", 1)
            if not start_time or not end_time:
                self._json_response({"error": "startTime and endTime required"}, 400)
                return

            # Kill any existing playback, then start ffmpeg for the new segment.
            # ffmpeg handles RTSP → fMP4 directly; no go2rtc involvement for playback.
            _kill_ffmpeg()

            rtsp_start = start_time.replace("-", "_").replace(" ", "_").replace(":", "_")
            rtsp_end   = end_time.replace("-", "_").replace(" ", "_").replace(":", "_")
            proc, source = _start_ffmpeg(channel, rtsp_start, rtsp_end, speed,
                                         start_time_str=start_time, end_time_str=end_time)

            with _lock:
                _playback_state.update({
                    "channel": channel,
                    "rtsp_start": rtsp_start,
                    "rtsp_end": rtsp_end,
                    "start_time_str": start_time,
                    "end_time_str": end_time,
                    "speed": speed,
                    "real_start": _time.time(),
                    "proc": proc,
                    "source": source,
                })

            # If playing from DVR (not cached), auto-trigger on-demand download
            # so the user can switch to cached playback with speed controls later.
            if source == "dvr" and _recording_cache:
                _recording_cache.request_download(channel, start_time, end_time)

            self._json_response({
                "ok": True,
                "channel": channel,
                "startTime": start_time,
                "endTime": end_time,
                "source": source,
            })

        elif path == "/api/playback/speed":
            # Change playback speed without restarting from the beginning.
            # Estimates current DVR position from elapsed time × old speed,
            # then re-registers go2rtc with the new position and Scale value.
            try:
                data = json.loads(body)
            except:
                self._json_response({"error": "invalid json"}, 400)
                return

            new_speed = data.get("speed", 1)
            with _lock:
                channel = _playback_state.get("channel")
                start_str = _playback_state.get("start_time_str")
                end_str = _playback_state.get("end_time_str")
                old_speed = _playback_state.get("speed", 1)
                real_start = _playback_state.get("real_start")

            if not channel or not start_str or not real_start:
                self._json_response({"error": "no active playback"}, 404)
                return

            # Estimate current DVR position
            elapsed_real = _time.time() - real_start
            dvr_elapsed = elapsed_real * old_speed
            start_dt = _dt.strptime(start_str, "%Y-%m-%d %H:%M:%S")
            end_dt = _dt.strptime(end_str, "%Y-%m-%d %H:%M:%S")
            current_dt = start_dt + _td(seconds=dvr_elapsed)
            # Clamp to before end time (position may overshoot short segments)
            if current_dt >= end_dt:
                current_dt = end_dt - _td(seconds=5)
            new_start_str = current_dt.strftime("%Y-%m-%d %H:%M:%S")

            # Kill existing ffmpeg and restart at the estimated position with new speed.
            _kill_ffmpeg()

            new_rtsp_start = new_start_str.replace("-", "_").replace(" ", "_").replace(":", "_")
            new_rtsp_end   = end_str.replace("-", "_").replace(" ", "_").replace(":", "_")
            proc, source = _start_ffmpeg(channel, new_rtsp_start, new_rtsp_end, new_speed,
                                         start_time_str=new_start_str, end_time_str=end_str)

            with _lock:
                _playback_state.update({
                    "rtsp_start": new_rtsp_start,
                    "rtsp_end": new_rtsp_end,
                    "start_time_str": new_start_str,
                    "speed": new_speed,
                    "real_start": _time.time(),
                    "proc": proc,
                    "source": source,
                })

            self._json_response({"ok": True, "speed": new_speed, "resumeTime": new_start_str, "source": source})

        elif path == "/api/playback/webrtc":
            try:
                data = json.loads(body)
            except:
                self._json_response({"error": "invalid json"}, 400)
                return

            stream_name = data.get("stream", "")
            offer = data.get("offer", "")
            if not stream_name or not offer:
                self._json_response({"error": "stream and offer required"}, 400)
                return

            answer = go2rtc_webrtc(stream_name, offer)
            if answer:
                self._json_response({"answer": answer})
            else:
                self._json_response({"error": "WebRTC negotiation failed"}, 502)

        elif path == "/api/playback/stop":
            _kill_ffmpeg()
            _playback_scale["value"] = 1.0
            with _lock:
                _playback_state.update({
                    "channel": None,
                    "rtsp_start": None,
                    "rtsp_end": None,
                    "start_time_str": None,
                    "end_time_str": None,
                    "speed": 1,
                    "real_start": None,
                    "proc": None,
                })
            self._json_response({"status": "stopped"})

        elif path == "/api/cache/request":
            # Request on-demand download of a specific time range.
            # POST {channel, startTime, endTime}
            try:
                data = json.loads(body)
            except Exception:
                self._json_response({"error": "invalid json"}, 400)
                return
            ch = data.get("channel", 0)
            start_str = data.get("startTime", "")
            end_str = data.get("endTime", "")
            if not ch or not start_str or not end_str:
                self._json_response({"error": "channel, startTime, endTime required"}, 400)
                return
            if _recording_cache:
                _recording_cache.request_download(ch, start_str, end_str)
                self._json_response({"ok": True, "status": "queued"})
            else:
                self._json_response({"error": "cache disabled"}, 503)

        elif path == "/api/clips":
            # Create a new clip export
            try:
                data = json.loads(body)
            except Exception:
                self._json_response({"error": "invalid json"}, 400)
                return

            channel = data.get("channel", 1)
            start_time = data.get("startTime", "")
            end_time = data.get("endTime", "")
            clip_name = data.get("name", "").strip()
            if not start_time or not end_time:
                self._json_response({"error": "startTime and endTime required"}, 400)
                return

            # Generate clip ID and default name
            clip_id = f"{int(_time.time())}_{channel}"
            if not clip_name:
                clip_name = f"Ch{channel} {start_time}"

            # Add metadata entry
            clip_meta = {
                "id": clip_id,
                "channel": channel,
                "name": clip_name,
                "start": start_time,
                "end": end_time,
                "created": _time.time(),
                "status": "exporting",
                "file_size": 0,
            }
            with _clips_lock:
                clips = _load_clips_meta()
                clips.append(clip_meta)
                _save_clips_meta(clips)

            # Start export in background thread
            t = threading.Thread(
                target=_export_clip,
                args=(clip_id, channel, start_time, end_time, clip_name),
                daemon=True,
            )
            t.start()

            self._json_response({"ok": True, "clip": clip_meta})

        else:
            self._json_response({"error": "not found"}, 404)

    def do_DELETE(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path.startswith("/api/clips/"):
            clip_id = path.split("/")[3]
            # Sanitize
            if "/" in clip_id or "\\" in clip_id or ".." in clip_id:
                self._json_response({"error": "invalid clip id"}, 400)
                return
            # Remove from metadata
            with _clips_lock:
                clips = _load_clips_meta()
                clips = [c for c in clips if c["id"] != clip_id]
                _save_clips_meta(clips)
            # Remove files
            for ext in (".mp4", ".jpg"):
                fpath = os.path.join(CLIPS_DIR, f"{clip_id}{ext}")
                try:
                    os.remove(fpath)
                except OSError:
                    pass
            # Kill active export if running
            with _clips_lock:
                proc = _active_exports.pop(clip_id, None)
            if proc and proc.poll() is None:
                proc.terminate()
            self._json_response({"ok": True})
        else:
            self._json_response({"error": "not found"}, 404)


def main():
    global _recording_cache

    # Start the RTSP Scale proxy (injects Scale header for playback speed)
    RTSPScaleProxy(RTSP_PROXY_PORT).start()

    # Register DVRIP streams in go2rtc (retry a few times if go2rtc isn't ready)
    for attempt in range(5):
        if ensure_dvrip_streams():
            break
        print(f"[dvr_proxy] Retrying stream registration ({attempt + 1}/5)...", flush=True)
        _time.sleep(3)

    # Start the recording cache daemon (downloads DVR recordings to local disk)
    _recording_cache = RecordingCache()
    _recording_cache.start()
    print("[dvr_proxy] recording cache daemon queued", flush=True)

    class ReusableHTTPServer(ThreadingHTTPServer):
        allow_reuse_address = True
        allow_reuse_port = True
        def server_bind(self):
            self.socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            try:
                self.socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEPORT, 1)
            except (AttributeError, OSError):
                pass
            super().server_bind()
    server = ReusableHTTPServer(("0.0.0.0", LISTEN_PORT), DVRHandler)
    print(f"DVR proxy listening on port {LISTEN_PORT}", flush=True)
    server.serve_forever()


if __name__ == "__main__":
    main()
