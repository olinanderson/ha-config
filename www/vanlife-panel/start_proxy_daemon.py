#!/usr/bin/env python3
"""Double-fork launcher to fully detach osrm_proxy from HA's process group/cgroup."""
import os, sys

# Find the python3 executable
python3 = sys.executable or '/usr/bin/python3'

# Double fork to escape any parent process reaping
pid = os.fork()
if pid > 0:
    # Parent: exit immediately so HA's shell_command completes
    sys.exit(0)

# Child: become a new session leader
os.setsid()

# Second fork so we're not a session leader (can't acquire a controlling terminal)
pid2 = os.fork()
if pid2 > 0:
    sys.exit(0)

# Grandchild: now fully detached
os.chdir('/config/www/vanlife-panel')

# Redirect stdout/stderr to log file
log = open('/config/www/vanlife-panel/osrm_proxy.log', 'a')
os.dup2(log.fileno(), sys.stdout.fileno())
os.dup2(log.fileno(), sys.stderr.fileno())
log.close()

# Replace this process with osrm_proxy
os.execv(python3, [python3, '/config/www/vanlife-panel/osrm_proxy.py'])
