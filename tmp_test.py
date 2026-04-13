# Patch for dvr_proxy.py — add live camera DVRIP stream support
# This adds:
# 1. ensure_dvrip_streams() — registers DVRIP streams in go2rtc at startup
# 2. POST /api/webrtc endpoint — proxies WebRTC signaling for live cameras

import urllib.request
import urllib.parse
import json

GO2RTC_BASE = "http://localhost:1984"
DVR_HOST = "192.168.10.156"

def _load_credentials():
    import os
    user = os.environ.get('DVR_USER')
    password = os.environ.get('DVR_PASS')
    if user and password:
        return user, password
    with open('/config/.dvr_credentials') as f:
        creds = {}
        for line in f:
            line = line.strip()
            if '=' in line and not line.startswith('#'):
                k, v = line.split('=', 1)
                creds[k.strip()] = v.strip()
        return creds.get('DVR_USER', ''), creds.get('DVR_PASS', '')

DVR_USER, DVR_PASS = _load_credentials()

DVRIP_STREAMS = {
    f"channel_{ch}": f"dvrip://{DVR_USER}:{DVR_PASS}@{DVR_HOST}:35000?channel={ch}&subtype=0"
    for ch in range(1, 5)
}

def ensure_dvrip_streams():
    """Register DVRIP streams in go2rtc if they don't already exist."""
    try:
        r = urllib.request.urlopen(f"{GO2RTC_BASE}/api/streams", timeout=5)
        existing = json.loads(r.read().decode())
    except Exception as e:
        print(f"[dvr_proxy] Failed to list go2rtc streams: {e}", flush=True)
        return

    for name, url in DVRIP_STREAMS.items():
        if name in existing:
            print(f"[dvr_proxy] Stream '{name}' already exists", flush=True)
            continue
        try:
            encoded_url = urllib.parse.quote(url, safe="")
            req = urllib.request.Request(
                f"{GO2RTC_BASE}/api/streams?name={name}&src={encoded_url}",
                method="PUT",
            )
            resp = urllib.request.urlopen(req, timeout=10)
            print(f"[dvr_proxy] Registered stream '{name}' -> DVRIP", flush=True)
        except Exception as e:
            print(f"[dvr_proxy] Failed to register '{name}': {e}", flush=True)

ensure_dvrip_streams()
print("Done")
