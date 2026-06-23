#!/usr/bin/env python3
"""
u-blox USB GPS bridge — reads NMEA from the USB GPS receiver and publishes an
MQTT device_tracker into Home Assistant.

Replaces the (now retired) Starlink device_tracker as the van's raw GPS source.
Runs alongside osrm_proxy.py / gps_filter.py on the HA host, started by the
`start_gps_ublox` shell_command on HA boot.

Design constraints (HAOS Core container):
  • stdlib only — no pyserial, no paho-mqtt (neither persists across HAOS
    updates). NMEA is read directly via termios; MQTT is published through HA's
    REST `mqtt.publish` service using the existing long-lived token.
  • Publishes to the same topic shape the MQTT device_tracker in
    mqtt/device_tracker.yaml subscribes to:
        homeassistant/device_tracker/ublox_gps/attributes   (retained JSON)
        homeassistant/device_tracker/ublox_gps/state        (retained "home")

Token is read from /config/.gps_filter_token (one line, long-lived HA token),
the same file gps_filter.py uses.

Env overrides:
  GPS_DEVICE   serial device path        (default /dev/ttyACM0)
  GPS_BAUD     baud rate, 0 = auto-try   (default 0 — u-blox 7 USB is CDC-ACM,
                                          baud is nominal but we set it anyway)
  HA_URL       Home Assistant base URL   (default http://localhost:8123)
  GPS_TOPIC    MQTT topic prefix         (default homeassistant/device_tracker/ublox_gps)
  GPS_RATE     min seconds between fixes  (default 1.0)
"""

import json
import os
import select
import sys
import termios
import time
import urllib.request

# ── Config ──────────────────────────────────────────────────────────────────
DEVICE       = os.environ.get("GPS_DEVICE", "/dev/ttyACM0")
HA_URL       = os.environ.get("HA_URL", "http://localhost:8123")
TOKEN_FILE   = "/config/.gps_filter_token"
TOPIC_PREFIX = os.environ.get("GPS_TOPIC", "homeassistant/device_tracker/ublox_gps")
PUBLISH_RATE = float(os.environ.get("GPS_RATE", "1.0"))   # min seconds between attribute publishes
STATE_KEEPALIVE_S = 60      # re-assert retained "home" state at least this often
REOPEN_DELAY_S = 5          # wait before re-opening device after an error
FIX_TIMEOUT_S  = 30         # log "waiting for fix" no more than this often

# Baud candidates when GPS_BAUD is 0/auto. u-blox 7 over USB ignores baud
# (CDC-ACM), but a real UART adapter may need it; try the common ones.
_BAUD_ENV = int(os.environ.get("GPS_BAUD", "0"))
BAUD_TABLE = {
    4800: termios.B4800, 9600: termios.B9600,
    38400: termios.B38400, 57600: termios.B57600, 115200: termios.B115200,
}
BAUD_CANDIDATES = ([_BAUD_ENV] if _BAUD_ENV in BAUD_TABLE
                   else [9600, 115200, 38400, 4800])


def log(msg):
    ts = time.strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{ts}] gps_ublox: {msg}", flush=True)


def read_token():
    try:
        with open(TOKEN_FILE) as f:
            return f.read().strip()
    except OSError:
        return None


# ── NMEA parsing ────────────────────────────────────────────────────────────

def nmea_checksum_ok(sentence):
    """sentence is the raw line without trailing CR/LF. Validate the *NN checksum."""
    if "*" not in sentence or not sentence.startswith("$"):
        return False
    body, _, cs = sentence[1:].partition("*")
    try:
        want = int(cs[:2], 16)
    except ValueError:
        return False
    got = 0
    for ch in body:
        got ^= ord(ch)
    return got == want


def _dm_to_deg(value, hemi):
    """NMEA ddmm.mmmm / dddmm.mmmm + hemisphere → signed decimal degrees."""
    if not value:
        return None
    try:
        v = float(value)
    except ValueError:
        return None
    deg = int(v // 100)
    minutes = v - deg * 100
    dec = deg + minutes / 60.0
    if hemi in ("S", "W"):
        dec = -dec
    return round(dec, 7)


def parse_gga(parts):
    """$--GGA: time,lat,N/S,lon,E/W,fixqual,numsat,hdop,alt,M,...  → dict or None."""
    if len(parts) < 10:
        return None
    try:
        fix_qual = int(parts[6]) if parts[6] else 0
    except ValueError:
        fix_qual = 0
    if fix_qual == 0:
        return {"fix": 0}
    lat = _dm_to_deg(parts[2], parts[3])
    lon = _dm_to_deg(parts[4], parts[5])
    if lat is None or lon is None:
        return {"fix": 0}
    try:
        sats = int(parts[7]) if parts[7] else None
    except ValueError:
        sats = None
    try:
        hdop = float(parts[8]) if parts[8] else None
    except ValueError:
        hdop = None
    try:
        alt = float(parts[9]) if parts[9] else None
    except ValueError:
        alt = None
    # Horizontal accuracy estimate (m): HDOP × nominal UERE (~5 m for consumer GPS).
    accuracy = round(hdop * 5.0, 1) if hdop is not None else None
    return {
        "fix": fix_qual, "latitude": lat, "longitude": lon,
        "altitude": alt, "satellites": sats, "hdop": hdop,
        "gps_accuracy": accuracy,
    }


def parse_rmc(parts):
    """$--RMC: time,status,lat,N/S,lon,E/W,speed(kn),course,date,... → dict or None."""
    if len(parts) < 9:
        return None
    if parts[2] != "A":   # V = void / no fix
        return None
    out = {}
    try:
        if parts[7]:
            out["speed"] = round(float(parts[7]) * 1.852, 2)   # knots → km/h
    except ValueError:
        pass
    try:
        if parts[8]:
            out["course"] = round(float(parts[8]), 1)
    except ValueError:
        pass
    return out


# ── Serial open (termios, no pyserial) ──────────────────────────────────────

def open_serial(baud_code):
    fd = os.open(DEVICE, os.O_RDONLY | os.O_NOCTTY | os.O_NONBLOCK)
    try:
        a = termios.tcgetattr(fd)
        a[0] = 0                                       # iflag
        a[1] = 0                                       # oflag
        a[3] = 0                                       # lflag (raw, no echo)
        a[2] = termios.CREAD | termios.CLOCAL | termios.CS8
        a[4] = baud_code                               # ispeed
        a[5] = baud_code                               # ospeed
        a[6][termios.VMIN] = 0
        a[6][termios.VTIME] = 0
        termios.tcsetattr(fd, termios.TCSANOW, a)
    except termios.error:
        pass   # USB CDC-ACM may not honour termios; reading still works
    return fd


# ── MQTT publish via HA REST service ────────────────────────────────────────

def mqtt_publish(token, topic, payload, retain=True, qos=1):
    body = json.dumps({
        "topic": topic, "payload": payload, "qos": qos, "retain": retain,
    }).encode()
    req = urllib.request.Request(
        f"{HA_URL}/api/services/mqtt/publish",
        data=body,
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=10) as resp:
        resp.read()


def publish_fix(token, fix, last_state_ts):
    attrs = {
        "latitude": fix["latitude"],
        "longitude": fix["longitude"],
        "gps_accuracy": fix.get("gps_accuracy") or 0,
        "altitude": fix.get("altitude") if fix.get("altitude") is not None else 0,
        "elevation": fix.get("altitude") if fix.get("altitude") is not None else 0,
        "source_type": "gps",
    }
    if fix.get("speed") is not None:
        attrs["speed"] = fix["speed"]
    if fix.get("course") is not None:
        attrs["course"] = fix["course"]
    if fix.get("satellites") is not None:
        attrs["satellites"] = fix["satellites"]
    mqtt_publish(token, f"{TOPIC_PREFIX}/attributes", json.dumps(attrs))
    now = time.time()
    if now - last_state_ts >= STATE_KEEPALIVE_S:
        mqtt_publish(token, f"{TOPIC_PREFIX}/state", "home")
        return now
    return last_state_ts


# ── Read loop ───────────────────────────────────────────────────────────────

def run_once(token):
    """Open the device, stream NMEA, publish fixes. Returns on any read error."""
    fd = None
    for baud in BAUD_CANDIDATES:
        try:
            fd = open_serial(BAUD_TABLE[baud])
        except OSError as e:
            log(f"open {DEVICE} @ {baud} failed: {e} (errno {e.errno})")
            return
        # Probe up to 3 s for any bytes at this baud.
        got = b""
        deadline = time.time() + 3
        while time.time() < deadline and not got:
            r, _, _ = select.select([fd], [], [], 1.0)
            if r:
                try:
                    got = os.read(fd, 256)
                except OSError:
                    got = b""
        if got:
            log(f"streaming NMEA from {DEVICE} @ {baud} baud")
            break
        os.close(fd)
        fd = None
    if fd is None:
        log(f"no NMEA from {DEVICE} at any baud {BAUD_CANDIDATES} — check wiring/permissions")
        return

    buf = b""
    last_pub = 0.0
    last_state = 0.0
    last_nofix_log = 0.0
    cur = {}   # accumulates GGA + RMC into one fix
    try:
        while True:
            r, _, _ = select.select([fd], [], [], 5.0)
            if not r:
                continue
            chunk = os.read(fd, 512)
            if not chunk:
                continue
            buf += chunk
            while b"\n" in buf:
                line, _, buf = buf.partition(b"\n")
                s = line.decode("ascii", "replace").strip("\r\x00 ")
                if not s.startswith("$") or not nmea_checksum_ok(s):
                    continue
                parts = s[1:].split("*")[0].split(",")
                stype = parts[0][2:] if len(parts[0]) >= 5 else parts[0]
                if stype == "GGA":
                    g = parse_gga(parts)
                    if not g:
                        continue
                    if g.get("fix", 0) == 0:
                        now = time.time()
                        if now - last_nofix_log >= FIX_TIMEOUT_S:
                            log("valid sentences but no satellite fix yet")
                            last_nofix_log = now
                        cur = {}
                        continue
                    cur.update(g)
                elif stype == "RMC":
                    rmc = parse_rmc(parts)
                    if rmc:
                        cur.update(rmc)

                # Publish when we have a fresh fix and the rate window elapsed.
                if cur.get("latitude") is not None:
                    now = time.time()
                    if now - last_pub >= PUBLISH_RATE:
                        try:
                            last_state = publish_fix(token, cur, last_state)
                            last_pub = now
                        except Exception as e:
                            log(f"publish error: {e}")
    except OSError as e:
        log(f"read error on {DEVICE}: {e} — will reopen")
    finally:
        try:
            os.close(fd)
        except OSError:
            pass


def main():
    token = read_token()
    if not token:
        log(f"no token at {TOKEN_FILE} — cannot publish to HA")
        sys.exit(1)
    log(f"starting; device={DEVICE} topic={TOPIC_PREFIX} rate={PUBLISH_RATE}s")
    while True:
        try:
            run_once(token)
        except Exception as e:
            log(f"unexpected error: {e}")
        time.sleep(REOPEN_DELAY_S)


if __name__ == "__main__":
    main()
