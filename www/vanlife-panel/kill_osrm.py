#!/usr/bin/env python3
"""Kill the running osrm_proxy.py daemon by scanning /proc cmdlines.

Only the actual Python process running ``osrm_proxy.py`` is targeted. Earlier
this matched ANY cmdline containing the substring ``osrm_proxy`` — which also
matched the ``/bin/sh -c '...osrm_proxy.py...'`` wrapper that runs the
start_osrm_proxy/restart_osrm_proxy shell command. kill_osrm.py runs as a child
of that wrapper, so it SIGKILLed its own parent shell before the launch line
ran, leaving osrm dead (the daemon never restarted until a full HA reboot).

Fix: require the executable (argv[0]) to be a python interpreter AND some later
argument to name osrm_proxy.py. That matches ``python3 osrm_proxy.py`` and skips
shell wrappers (argv[0] = /bin/sh) whose command text merely contains the string.
"""
import os
import signal

killed = []
skip_pids = {os.getpid(), os.getppid()}  # never kill ourselves or our wrapper shell

for entry in os.listdir('/proc'):
    if not entry.isdigit():
        continue
    pid = int(entry)
    if pid in skip_pids:
        continue
    try:
        with open(f'/proc/{pid}/cmdline', 'rb') as f:
            argv = [p.decode('utf-8', errors='replace')
                    for p in f.read().split(b'\x00') if p]
        if not argv:
            continue
        is_python = 'python' in os.path.basename(argv[0]).lower()
        runs_osrm = any('osrm_proxy.py' in a for a in argv[1:])
        if is_python and runs_osrm:
            print(f'killing pid {pid}: {" ".join(argv)[:80]}')
            os.kill(pid, signal.SIGKILL)
            killed.append(pid)
    except (PermissionError, FileNotFoundError, ProcessLookupError):
        pass

print(f'killed: {killed}' if killed else 'no osrm_proxy.py process found')
