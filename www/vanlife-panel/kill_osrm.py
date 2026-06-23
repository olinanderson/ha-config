#!/usr/bin/env python3
"""Kill any running osrm_proxy.py process by scanning /proc cmdlines."""
import os
import signal
import sys

killed = []
my_pid = os.getpid()

for entry in os.listdir('/proc'):
    if not entry.isdigit():
        continue
    pid = int(entry)
    if pid == my_pid:
        continue
    try:
        with open(f'/proc/{pid}/cmdline', 'rb') as f:
            cmdline = f.read().replace(b'\x00', b' ').decode('utf-8', errors='replace')
        if 'osrm_proxy' in cmdline:
            print(f'killing pid {pid}: {cmdline[:80]}')
            os.kill(pid, signal.SIGKILL)
            killed.append(pid)
    except (PermissionError, FileNotFoundError, ProcessLookupError):
        pass

if killed:
    print(f'killed: {killed}')
else:
    print('no osrm_proxy process found')
