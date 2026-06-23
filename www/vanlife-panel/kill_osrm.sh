#!/bin/sh
for pid in $(ls /proc | grep "^[0-9]"); do
  cmd=$(cat /proc/$pid/cmdline 2>/dev/null | tr "\0" " ")
  case "$cmd" in
    *osrm_proxy*) echo "killing $pid: $cmd"; kill -9 $pid 2>/dev/null ;;
  esac
done
echo "done"
