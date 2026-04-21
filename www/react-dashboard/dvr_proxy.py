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
  POST /api/playback/start                           — Start ffmpeg playback (1x RTSP)
  POST /api/playback/stop                            — Kill ffmpeg playback process
  GET  /api/playback/stream                          — Stream fMP4 from ffmpeg
  POST /api/clips                                    — Export a clip
  GET  /api/clips                                    — List saved clips
  DELETE /api/clips/:id                              — Delete a clip

On startup, registers DVRIP streams (channel_1–channel_4) in go2rtc so the
React dashboard can get WebRTC video without going through Home Assistant.
  python3 dvr_proxy.py &
"""

import json
import os
import queue as _queue
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

# Named streams to register in go2rtc at startup (bypasses HA entirely)
# Main stream (subtype=0): 960x480 30fps — used when a single camera is expanded
# Sub stream  (subtype=1): 704x480 15fps — used for the 2x2 grid (lighter decoder load)
DVRIP_STREAMS = {}
for _ch in range(1, 5):
    DVRIP_STREAMS[f"channel_{_ch}"] = f"rtsp://{DVR_USER}:{DVR_PASS}@{DVR_HOST}:554/cam/realmonitor?channel={_ch}&subtype=0"
    DVRIP_STREAMS[f"channel_{_ch}_sub"] = f"rtsp://{DVR_USER}:{DVR_PASS}@{DVR_HOST}:554/cam/realmonitor?channel={_ch}&subtype=1"

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
    "start_time_str": None,
    "end_time_str": None,
    "real_start": None,
    "proc": None,
}
_lock = threading.Lock()


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
    """Search DVR recordings for a channel and time range."""
    resp = dvr_get("/cgi-bin/mediaFileFind.cgi?action=factory.create")
    if not resp:
        return []
    obj_id = resp.strip().replace("result=", "")

    params = (
        f"action=findFile&object={obj_id}"
        f"&condition.Channel={channel}"
        f"&condition.StartTime={urllib.parse.quote(start_time)}"
        f"&condition.EndTime={urllib.parse.quote(end_time)}"
    )
    dvr_get(f"/cgi-bin/mediaFileFind.cgi?{params}")

    all_items = []
    for _ in range(50):
        resp = dvr_get(f"/cgi-bin/mediaFileFind.cgi?action=findNextFile&object={obj_id}&count=100")
        if not resp or "found=0" in resp:
            break
        items = parse_dahua_response(resp)
        if not items:
            break
        all_items.extend(items)

    dvr_get(f"/cgi-bin/mediaFileFind.cgi?action=destroy&object={obj_id}")

    results = []
    for item in all_items:
        # Filter to main stream only (path contains /000/, sub stream is /512/)
        fpath = item.get("FilePath", "")
        if "/512/" in fpath:
            continue
        results.append({
            "channel": int(item.get("Channel", channel)),
            "start": item.get("StartTime", ""),
            "end": item.get("EndTime", ""),
            "path": fpath,
            "type": item.get("Type", ""),
            "length": int(item.get("Length", 0)),
            "flags": item.get("Flags[0]", ""),
        })
    return results


def find_date_range(channel):
    """Find the oldest and newest recording timestamps for a channel."""
    oldest = search_recordings(channel, "2020-01-01 00:00:00", "2030-12-31 23:59:59")
    if not oldest:
        return None, None
    first = oldest[0]["start"] if oldest else None
    today = _dt.now().strftime("%Y-%m-%d")
    today_recs = search_recordings(channel, f"{today} 00:00:00", f"{today} 23:59:59")
    last = today_recs[-1]["end"] if today_recs else None
    return first, last


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


# ─── Playback ───

def _start_ffmpeg(channel, rtsp_start, rtsp_end, start_time_str=None, end_time_str=None):
    """Start ffmpeg for DVR playback at 1x via RTSP.

    Returns subprocess.Popen piping fMP4 to stdout.
    """
    rtsp_url = (
        f"rtsp://{DVR_USER}:{DVR_PASS}@{DVR_HOST}:554"
        f"/cam/playback?channel={channel}&subtype=0"
        f"&starttime={rtsp_start}&endtime={rtsp_end}"
    )
    cmd = [
        "ffmpeg", "-hide_banner", "-loglevel", "error",
        "-rtsp_transport", "tcp",
        "-fflags", "+nobuffer+discardcorrupt+genpts",
        "-flags", "+low_delay",
        "-probesize", "1000000",
        "-analyzeduration", "2000000",
        "-i", rtsp_url,
        "-c:v", "copy",
        "-an",
        "-f", "mp4",
        "-movflags", "frag_keyframe+empty_moov+default_base_moof",
        "pipe:1",
    ]
    print(f"[dvr_proxy] ffmpeg: ch{channel} RTSP {rtsp_start}\u2192{rtsp_end} 1x", flush=True)
    return subprocess.Popen(
        cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
    )


def _kill_ffmpeg():
    """Kill any active ffmpeg playback process."""
    proc = _playback_state["proc"]
    if proc and proc.poll() is None:
        proc.terminate()
        try:
            proc.wait(timeout=5)
        except Exception:
            proc.kill()
    _playback_state["proc"] = None


# ─── Clip Export System ───

_clips_lock = threading.Lock()
_active_exports: dict[str, subprocess.Popen] = {}


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
    """Background thread: export a clip via RTSP from DVR → MP4."""
    try:
        os.makedirs(CLIPS_DIR, exist_ok=True)
        out_path = os.path.join(CLIPS_DIR, f"{clip_id}.mp4")
        thumb_path = os.path.join(CLIPS_DIR, f"{clip_id}.jpg")

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

        print(f"[clips] exporting {clip_id}: ch{channel} {start_str} \u2192 {end_str}", flush=True)
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
            pass

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


# ─── HTTP Handler ───

class DVRHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        pass

    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, DELETE")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")

    def _json_response(self, data, status=200):
        body = json.dumps(data).encode()
        self.send_response(status)
        self._cors()
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _proxy_mse_stream(self, stream_name):
        """Proxy go2rtc's fMP4 live stream to the browser."""
        stop_event = threading.Event()
        buf = _queue.Queue(maxsize=128)
        conn = None

        def reader():
            nonlocal conn
            try:
                encoded = urllib.parse.quote(stream_name, safe="")
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
                    buf.put(None)
                    return
                buf.put(("headers", resp.getheader("Content-Type", 'video/mp4; codecs="avc1.640028"')))
                while not stop_event.is_set():
                    chunk = resp.read(65536)
                    if not chunk:
                        break
                    try:
                        buf.put(chunk, timeout=2.0)
                    except _queue.Full:
                        pass
            except Exception:
                pass
            finally:
                buf.put(None)
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
            pass
        except Exception as e:
            try:
                self._json_response({"error": str(e)}, 502)
            except Exception:
                pass
        finally:
            stop_event.set()
            t.join(timeout=2)

    def _proxy_mp4_stream(self):
        """Stream DVR playback as fMP4 directly to the HTTP response."""
        with _lock:
            proc = _playback_state["proc"]
            channel = _playback_state["channel"]

            if proc and proc.poll() is not None:
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
            with _lock:
                channel = _playback_state["channel"]
                rtsp_start = _playback_state["rtsp_start"]
                rtsp_end = _playback_state["rtsp_end"]
            if not channel or not rtsp_start:
                self._json_response({"error": "no active playback"}, 404)
                return
            start_str = _playback_state.get("start_time_str")
            end_str = _playback_state.get("end_time_str")
            proc = _start_ffmpeg(channel, rtsp_start, rtsp_end,
                                 start_time_str=start_str, end_time_str=end_str)
            with _lock:
                _playback_state["proc"] = proc

        try:
            self.send_response(200)
            self._cors()
            self.send_header("Content-Type", 'video/mp4; codecs="avc1.640028"')
            self.send_header("Connection", "close")
            self.end_headers()
            self.wfile.flush()

            fd = proc.stdout.fileno()
            while True:
                data = os.read(fd, 65536)
                if not data:
                    break
                self.wfile.write(data)
                self.wfile.flush()
        except (BrokenPipeError, ConnectionResetError):
            pass
        except Exception as e:
            try:
                self._json_response({"error": str(e)}, 502)
            except Exception:
                pass
        finally:
            if proc:
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
            # Clip segments to the requested day boundaries
            day_start_str = f"{date} 00:00:00"
            segments = []
            for r in results:
                # Skip segments that end before midnight of the requested day
                if r["end"] <= day_start_str:
                    continue
                seg_start = r["start"] if r["start"] >= day_start_str else day_start_str
                segments.append({"start": seg_start, "end": r["end"], "flags": r["flags"]})
            self._json_response({"segments": segments, "channel": int(channel), "date": date})

        elif path == "/api/mse":
            src = qs.get("src", "")
            if not src or (src not in DVRIP_STREAMS and not src.startswith("camera.")):
                self._json_response({"error": "unknown stream"}, 400)
                return
            self._proxy_mse_stream(src)

        elif path == "/api/health":
            self._json_response({"status": "ok"})

        elif path == "/api/playback/stream":
            self._proxy_mp4_stream()

        elif path == "/api/clips":
            clips = _load_clips_meta()
            clips.sort(key=lambda c: c.get("created", 0), reverse=True)
            self._json_response({"clips": clips})

        elif path.startswith("/api/clips/") and path.endswith("/download"):
            clip_id = path.split("/")[3]
            if "/" in clip_id or "\\" in clip_id or ".." in clip_id:
                self._json_response({"error": "invalid clip id"}, 400)
                return
            mp4_path = os.path.join(CLIPS_DIR, f"{clip_id}.mp4")
            if not os.path.exists(mp4_path):
                self._json_response({"error": "clip not found"}, 404)
                return
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
            if not start_time or not end_time:
                self._json_response({"error": "startTime and endTime required"}, 400)
                return

            _kill_ffmpeg()

            rtsp_start = start_time.replace("-", "_").replace(" ", "_").replace(":", "_")
            rtsp_end   = end_time.replace("-", "_").replace(" ", "_").replace(":", "_")
            proc = _start_ffmpeg(channel, rtsp_start, rtsp_end,
                                 start_time_str=start_time, end_time_str=end_time)

            with _lock:
                _playback_state.update({
                    "channel": channel,
                    "rtsp_start": rtsp_start,
                    "rtsp_end": rtsp_end,
                    "start_time_str": start_time,
                    "end_time_str": end_time,
                    "real_start": _time.time(),
                    "proc": proc,
                })

            self._json_response({
                "ok": True,
                "channel": channel,
                "startTime": start_time,
                "endTime": end_time,
            })

        elif path == "/api/playback/stop":
            _kill_ffmpeg()
            with _lock:
                _playback_state.update({
                    "channel": None,
                    "rtsp_start": None,
                    "rtsp_end": None,
                    "start_time_str": None,
                    "end_time_str": None,
                    "real_start": None,
                    "proc": None,
                })
            self._json_response({"status": "stopped"})

        elif path == "/api/clips":
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
            clip_id = f"{int(_time.time())}_{channel}"
            if not clip_name:
                clip_name = f"Ch{channel} {start_time}"
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
            if "/" in clip_id or "\\" in clip_id or ".." in clip_id:
                self._json_response({"error": "invalid clip id"}, 400)
                return
            with _clips_lock:
                clips = _load_clips_meta()
                clips = [c for c in clips if c["id"] != clip_id]
                _save_clips_meta(clips)
            for ext in (".mp4", ".jpg"):
                fpath = os.path.join(CLIPS_DIR, f"{clip_id}{ext}")
                try:
                    os.remove(fpath)
                except OSError:
                    pass
            with _clips_lock:
                proc = _active_exports.pop(clip_id, None)
            if proc and proc.poll() is None:
                proc.terminate()
            self._json_response({"ok": True})
        else:
            self._json_response({"error": "not found"}, 404)


def main():
    # Register DVRIP streams in go2rtc (retry a few times if go2rtc isn't ready)
    for attempt in range(5):
        if ensure_dvrip_streams():
            break
        print(f"[dvr_proxy] Retrying stream registration ({attempt + 1}/5)...", flush=True)
        _time.sleep(3)

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
