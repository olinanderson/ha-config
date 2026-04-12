#!/usr/bin/env python3
"""Patch go2rtc streams from ffmpeg-wrapped RTSP to native RTSP."""
import http.client, json, socket, glob, re, base64, urllib.parse

class UnixHTTPConnection(http.client.HTTPConnection):
    def __init__(self, path):
        super().__init__('localhost')
        self.unix_path = path
    def connect(self):
        self.sock = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
        self.sock.connect(self.unix_path)

socks = glob.glob('/tmp/go2rtc-*/go2rtc.sock')
with open(glob.glob('/tmp/go2rtc-*/go2rtc_*.yaml')[0]) as f:
    content = f.read()
username = re.search(r'username: (\S+)', content).group(1)
password = re.search(r'password: (\S+)', content).group(1)
auth_header = 'Basic ' + base64.b64encode(f'{username}:{password}'.encode()).decode()

def api(method, path):
    conn = UnixHTTPConnection(socks[0])
    conn.request(method, path, headers={'Authorization': auth_header})
    resp = conn.getresponse()
    body = resp.read().decode()
    return resp.status, body

DVR_USER = "admin"
DVR_PASS = "***REDACTED***"
DVR_HOST = "192.168.10.156"

# Show current state
status, body = api('GET', '/api/streams')
data = json.loads(body)
print("=== BEFORE ===")
for name in sorted(data.keys()):
    producers = data[name].get('producers', [])
    urls = [p.get('url', '?')[:80] for p in producers]
    print(f'  {name}: {urls}')

# Patch ALL 4 channels: replace ffmpeg source with native RTSP
for ch in range(1, 5):
    stream_name = f'camera.channel_{ch}'
    rtsp_url = f'rtsp://{DVR_USER}:{DVR_PASS}@{DVR_HOST}:554/cam/realmonitor?channel={ch}&subtype=0'
    ffmpeg_url = f'ffmpeg:{rtsp_url}'
    audio_url = f'ffmpeg:{stream_name}#audio=opus#query=log_level=debug'

    enc_name = urllib.parse.quote(stream_name, safe='')

    # Delete ffmpeg RTSP source
    enc_src = urllib.parse.quote(ffmpeg_url, safe='')
    s, _ = api('DELETE', f'/api/streams?dst={enc_name}&src={enc_src}')
    print(f'  ch{ch} del ffmpeg: {s}')

    # Delete audio opus source
    enc_audio = urllib.parse.quote(audio_url, safe='')
    s, _ = api('DELETE', f'/api/streams?dst={enc_name}&src={enc_audio}')
    print(f'  ch{ch} del audio: {s}')

    # Add native RTSP source (no ffmpeg wrapper)
    enc_native = urllib.parse.quote(rtsp_url, safe='')
    s, _ = api('PUT', f'/api/streams?dst={enc_name}&src={enc_native}')
    print(f'  ch{ch} add native: {s}')

# Verify
status, body = api('GET', '/api/streams')
data2 = json.loads(body)
print("\n=== AFTER ===")
for name in sorted(data2.keys()):
    producers = data2[name].get('producers', [])
    urls = [p.get('url', '?')[:80] for p in producers]
    consumers = data2[name].get('consumers')
    nc = len(consumers) if consumers else 0
    print(f'  {name}: producers={urls} consumers={nc}')
