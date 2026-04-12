#!/usr/bin/env python3
"""Probe Lorex DVR for firmware/market/upgrade info via Dahua CGI API."""
import subprocess

BASE = "http://192.168.10.156/cgi-bin"
AUTH = "admin:***REDACTED***"

endpoints = {
    "getMarketArea": f"{BASE}/magicBox.cgi?action=getMarketArea",
    "getSoftwareVersion": f"{BASE}/magicBox.cgi?action=getSoftwareVersion",
    "getDeviceType": f"{BASE}/magicBox.cgi?action=getDeviceType",
    "upgraderGetState": f"{BASE}/upgrader.cgi?action=getState",
    "getSerialNo": f"{BASE}/magicBox.cgi?action=getSerialNo",
    "getMachineName": f"{BASE}/magicBox.cgi?action=getMachineName",
    "getVendor": f"{BASE}/magicBox.cgi?action=getVendor",
    "getSystemInfo": f"{BASE}/magicBox.cgi?action=getSystemInfo",
    "NetApp": f"{BASE}/configManager.cgi?action=getConfig&name=NetApp",
    "T2UServer": f"{BASE}/configManager.cgi?action=getConfig&name=T2UServer",
    "Network.Port": f"{BASE}/configManager.cgi?action=getConfig&name=Network",
}

for name, url in endpoints.items():
    try:
        r = subprocess.run(
            ["curl", "-s", "-g", "--digest", "-u", AUTH, url],
            capture_output=True, text=True, timeout=5
        )
        print(f"=== {name} ===")
        out = r.stdout.strip() or r.stderr.strip()
        # Truncate long outputs
        lines = out.split("\n")
        if len(lines) > 30:
            print("\n".join(lines[:30]))
            print(f"... ({len(lines) - 30} more lines)")
        else:
            print(out)
        print()
    except Exception as e:
        print(f"=== {name} === ERROR: {e}\n")
