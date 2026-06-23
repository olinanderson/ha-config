#!/bin/sh
# Run inside HA context via shell_command - scan all procs for python/osrm
for pid in $(ls /proc | grep "^[0-9]"); do
  cmd=$(cat /proc/$pid/cmdline 2>/dev/null | tr "\0" " ")
  case "$cmd" in
    *python*) echo "PID $pid: $cmd" ;;
  esac
done
