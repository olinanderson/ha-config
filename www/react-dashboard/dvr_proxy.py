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
import socket
import time as _time
import urllib.request
import urllib.parse
import urllib.error
import subprocess
import http.client as _httplib
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

# Dahua digest auth opener (reused across requests)
_pw_mgr = urllib.request.HTTPPasswordMgrWithDefaultRealm()
_pw_mgr.add_password(None, DVR_BASE, DVR_USER, DVR_PASS)
_dvr_opener = urllib.request.build_opener(urllib.request.HTTPDigestAuthHandler(_pw_mgr))

# Track active playback (ffmpeg subprocess + params)
_playback_state = {
    "channel": None,
    "rtsp_start": None,
    "rtsp_end": None,
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
    """Search DVR recordings for a channel and time range."""
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

    # Get results (up to 500 segments per query)
    resp = dvr_get(f"/cgi-bin/mediaFileFind.cgi?action=findNextFile&object={obj_id}&count=500")

    # Destroy session
    dvr_get(f"/cgi-bin/mediaFileFind.cgi?action=destroy&object={obj_id}")

    if not resp:
        return []

    items = parse_dahua_response(resp)
    results = []
    for item in items:
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
    from datetime import datetime
    today = datetime.now().strftime("%Y-%m-%d")
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
            t1.join(timeout=900)   # max 15 min playback session
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

def _start_ffmpeg(channel, rtsp_start, rtsp_end):
    """Start ffmpeg for DVR playback and return the subprocess.

    Uses subtype=1 (H.264 sub-stream) with -c:v copy — zero CPU cost,
    near-instant first frame.  Reduced probesize and nobuffer flags
    minimize startup latency.
    """
    rtsp_url = (
        f"rtsp://{DVR_USER}:{DVR_PASS}@127.0.0.1:{RTSP_PROXY_PORT}"
        f"/cam/playback?channel={channel}&subtype=0"
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
    return subprocess.Popen(
        cmd, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL,
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


class DVRHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        pass  # Suppress access logs

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
                conn = _httplib.HTTPConnection("localhost", 1984, timeout=10)
                encoded = urllib.parse.quote(stream_name, safe="")
                conn.request("GET", f"/api/stream.mp4?src={encoded}")
                resp = conn.getresponse()
                if resp.status != 200:
                    buf.put(None)  # signal: header error
                    return
                buf.put(("headers", resp.getheader("Content-Type", 'video/mp4; codecs="avc1.640028"')))
                while not stop_event.is_set():
                    chunk = resp.read(65536)
                    if not chunk:
                        break
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
        Otherwise start it now.  Uses subtype=1 (H.264 sub-stream) with
        -c:v copy for zero-latency passthrough — no transcoding needed.
        """
        with _lock:
            proc = _playback_state["proc"]
            channel = _playback_state["channel"]

            if proc and proc.poll() is not None:
                # Pre-started ffmpeg already exited (error) — clear it
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
            proc = _start_ffmpeg(channel, rtsp_start, rtsp_end)
            with _lock:
                _playback_state["proc"] = proc

        try:
            self.send_response(200)
            self._cors()
            self.send_header("Content-Type", 'video/mp4; codecs="avc1.640028"')
            self.send_header("Connection", "close")
            self.end_headers()
            self.wfile.flush()

            # Stream ffmpeg stdout → HTTP response using os.read for
            # non-buffered reads (returns as soon as data is available).
            fd = proc.stdout.fileno()
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

        elif path == "/api/playback/stream":
            # Stream ffmpeg fMP4 directly — no go2rtc involved.
            # ffmpeg was pre-started by /api/playback/start via the RTSP Scale proxy
            # (port 8767) which injects Scale: N into the DVR's RTSP PLAY command.
            self._proxy_mp4_stream()

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

            # Format times for RTSP: YYYY_MM_DD_HH_MM_SS
            rtsp_start = start_time.replace("-", "_").replace(" ", "_").replace(":", "_")
            rtsp_end = end_time.replace("-", "_").replace(" ", "_").replace(":", "_")

            # Set Scale value for the RTSP proxy (port 8767).
            # The proxy injects "Scale: N.000" into the DVR's RTSP PLAY command
            # so the DVR delivers frames N× faster (true server-side speed control).
            _playback_scale["value"] = float(speed) if speed else 1.0

            # Kill any existing ffmpeg, then pre-start a new one.
            # ffmpeg connects through the RTSP Scale proxy on 127.0.0.1:8767.
            # The frontend then fetches /api/playback/stream which pipes ffmpeg stdout.
            with _lock:
                _kill_ffmpeg()
                _playback_state["channel"] = channel
                _playback_state["rtsp_start"] = rtsp_start
                _playback_state["rtsp_end"] = rtsp_end
                _playback_state["proc"] = None

            try:
                proc = _start_ffmpeg(channel, rtsp_start, rtsp_end)
                with _lock:
                    _playback_state["proc"] = proc
                print(f"[dvr_proxy] Started playback (ch{channel} {start_time}\u2192{end_time} speed={speed}x)", flush=True)
            except Exception as e:
                print(f"[dvr_proxy] Failed to start ffmpeg: {e}", flush=True)
                self._json_response({"error": f"ffmpeg start failed: {e}"}, 502)
                return

            self._json_response({
                "ok": True,
                "channel": channel,
                "startTime": start_time,
                "endTime": end_time,
            })

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
            with _lock:
                _kill_ffmpeg()
                _playback_state["channel"] = None
            self._json_response({"status": "stopped"})

        else:
            self._json_response({"error": "not found"}, 404)


def main():
    # Start the RTSP Scale proxy (injects Scale header for playback speed)
    RTSPScaleProxy(RTSP_PROXY_PORT).start()

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
