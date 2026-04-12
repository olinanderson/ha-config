#!/usr/bin/env python3
"""Diagnostic: check go2rtc stream health for all 4 cameras."""
import urllib.request, json, glob, re, base64, socket, http.client, subprocess

# 1. go2rtc process
result = subprocess.run(['sh', '-c', 'ps aux | grep go2rtc | grep -v grep'], capture_output=True, text=True)
print('=== go2rtc process ===')
print(result.stdout.strip())

# 2. ffmpeg processes
result2 = subprocess.run(['sh', '-c', 'ps aux | grep ffmpeg | grep -v grep'], capture_output=True, text=True)
ffmpeg_lines = [l for l in result2.stdout.strip().split('\n') if l.strip()]
print(f'\n=== ffmpeg processes: {len(ffmpeg_lines)} ===')
for l in ffmpeg_lines:
    if '-i ' in l:
        parts = l.split('-i ')[1]
        url_part = parts.split(' -c')[0] if '-c' in parts else parts[:80]
        print(f'  {url_part.strip()[:100]}')

# 3. go2rtc streams via Unix socket
class UnixHTTPConnection(http.client.HTTPConnection):
    def __init__(self, path):
        super().__init__('localhost')
        self.unix_path = path
    def connect(self):
        self.sock = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
        self.sock.connect(self.unix_path)

socks = glob.glob('/tmp/go2rtc-*/go2rtc.sock')
if socks:
    with open(glob.glob('/tmp/go2rtc-*/go2rtc_*.yaml')[0]) as f:
        content = f.read()
    username = re.search(r'username: (\S+)', content).group(1)
    password = re.search(r'password: (\S+)', content).group(1)
    auth = base64.b64encode(f'{username}:{password}'.encode()).decode()
    conn = UnixHTTPConnection(socks[0])
    conn.request('GET', '/api/streams', headers={'Authorization': f'Basic {auth}'})
    resp = conn.getresponse()
    data = json.loads(resp.read().decode())
    print(f'\n=== go2rtc streams (Unix socket): {len(data)} ===')
    for name in sorted(data.keys()):
        info = data[name]
        producers = info.get('producers', [])
        consumers = info.get('consumers')
        for p in producers:
            url = p.get('url', '?')[:90]
            recv = p.get('recv', 0)
            print(f'  {name} | producer: {url}')
            print(f'    recv={recv}')
        nc = len(consumers) if consumers else 0
        if consumers:
            for c in consumers:
                ra = c.get('remote_addr', '?')
                send = c.get('send', 0)
                print(f'  {name} | consumer: remote={ra} send={send}')
        else:
            print(f'  {name} | 0 consumers')
else:
    print('No Unix socket found')

# 4. Check DVR max connections
print('\n=== DVR connection caps ===')
from urllib.request import HTTPDigestAuthHandler, build_opener
ah = HTTPDigestAuthHandler()
ah.add_password('Login to ND012009304928', 'http://192.168.10.156/', 'admin', '***REDACTED***')
opener = build_opener(ah)
try:
    r = opener.open('http://192.168.10.156/cgi-bin/magicBox.cgi?action=getProductDefinition', timeout=10)
    data = r.read().decode()
    for l in data.split('\n'):
        l = l.strip()
        if any(k in l.lower() for k in ['max', 'connect', 'stream', 'rtsp', 'channel', 'remote']):
            print(f'  {l}')
except Exception as e:
    print(f'  Error: {e}')

# 5. Test RTSP connectivity to all 4 channels simultaneously
print('\n=== RTSP probe (all 4 channels) ===')
import concurrent.futures, time
def probe_channel(ch):
    t0 = time.time()
    try:
        result = subprocess.run([
            'ffprobe', '-v', 'error', '-select_streams', 'v:0',
            '-show_entries', 'stream=codec_name,width,height,r_frame_rate',
            '-of', 'csv=p=0',
            f'rtsp://admin:***REDACTED***@192.168.10.156:554/cam/realmonitor?channel={ch}&subtype=0'
        ], capture_output=True, text=True, timeout=15)
        elapsed = time.time() - t0
        return f'ch{ch}: {result.stdout.strip()} ({elapsed:.1f}s)'
    except Exception as e:
        elapsed = time.time() - t0
        return f'ch{ch}: ERROR {e} ({elapsed:.1f}s)'

with concurrent.futures.ThreadPoolExecutor(max_workers=4) as ex:
    futures = {ex.submit(probe_channel, ch): ch for ch in range(1, 5)}
    for f in concurrent.futures.as_completed(futures):
        print(f'  {f.result()}')
