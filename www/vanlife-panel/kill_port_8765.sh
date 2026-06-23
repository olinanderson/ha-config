#!/bin/sh
# Port 8765 = 0x223D in little-endian hex as used in /proc/net/tcp
inode=$(grep ":223D " /proc/net/tcp /proc/net/tcp6 2>/dev/null | awk "{print \$10}" | head -1)
if [ -z "$inode" ]; then echo "port 8765 not in use"; exit 0; fi
echo "killing socket inode $inode"
for pid in $(ls /proc | grep "^[0-9]"); do
  ls /proc/$pid/fd 2>/dev/null | xargs -I{} readlink /proc/$pid/fd/{} 2>/dev/null | grep -q "socket:\[$inode\]" && kill -9 $pid 2>/dev/null && echo "killed $pid"
done
