#!/usr/bin/env python3
"""Double-fork launcher to fully detach Syncthing from HA's shell_command
subprocess.

Background: the old start_syncthing ran `nohup syncthing serve ... &`. Under
HA's shell_command executor (asyncio create_subprocess_shell + communicate),
the launched process kept a std fd tied to HA's stdout pipe, so HA blocked
until its 60 s timeout — logging "Timed out running command" every ~3 min from
the daemons liveness watchdog (thousands of errors). This launcher forks twice
+ setsid and redirects all std fds to the log / /dev/null, so the parent exits
immediately and the shell_command returns at once. Mirrors start_proxy_daemon.py.
"""
import os
import sys

BIN = "/config/.ha-sync/syncthing"
HOME = "/config/.ha-sync/st-config"
LOG = "/config/.ha-sync/syncthing.log"

# First fork: parent returns to the shell_command immediately.
if os.fork() > 0:
    sys.exit(0)

# Become a new session leader (detach from HA's process group / controlling tty).
os.setsid()

# Second fork so we can't reacquire a controlling terminal.
if os.fork() > 0:
    sys.exit(0)

# Redirect stdin from /dev/null and stdout/stderr to the syncthing log so no fd
# stays tied to HA's pipe.
devnull = os.open("/dev/null", os.O_RDONLY)
os.dup2(devnull, 0)
log = open(LOG, "a")
os.dup2(log.fileno(), 1)
os.dup2(log.fileno(), 2)

# Replace this process with syncthing.
os.execv(BIN, ["syncthing", "serve", "--home=" + HOME, "--no-browser", "--no-upgrade"])
