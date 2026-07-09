# PC → Van Speakers Audio (VBAN)

How the PC streams its audio to the van speakers, and how to switch between
**headphones** and the **van speakers**. Set up & confirmed working 2026-06-27;
re-confirmed 2026-06-28 after fixing two regressions (see Troubleshooting).

## The chain

```
PC audio  →  "Voicemeeter Input" (default device)  →  VoiceMeeter (BUS A)
          →  VBAN stream "Stream1"  →  UDP 192.168.10.173:6980  (LAN)
          →  HA box: vban_receptor  →  PulseAudio  →  USB→SPDIF adapter  →  van speakers
```

Replaced the old **Scream** setup (its driver needed Secure Boot OFF, which broke
anti-cheat games). VoiceMeeter's audio driver is properly signed, so Secure Boot
stays **ON** and games keep working.

---

## ▶ Switching: headphones  ↔  van speakers

Where your audio goes is just the **Windows default playback device**. Click the
**speaker icon** in the taskbar (bottom-right) → click the **`>`** by the volume
slider → pick:

| To listen on… | Choose this output device |
|---|---|
| **Headphones** (INZONE H9 II) | **Speakers (INZONE H9 II - Game)** |
| **Van speakers** | **Voicemeeter Input** |

That's the whole switch. Your **Sony INZONE Hub** still controls the headset
itself (EQ, spatial, etc.) exactly as before — it's independent of this.

> Tip: For one-click switching, install **EarTrumpet** (free, Microsoft Store) —
> it puts a better volume icon in the tray with an output-device picker.

---

## 🔊 Volume

Your **Windows volume** — the tray slider, the volume keys, and mute — controls the
van speakers directly. Just have **Voicemeeter Input** selected as the output and use
the volume like any normal device. 100% = full (mute mutes the van too).

Behind the scenes a tiny background helper, **VanVolumeBridge**, makes this work:
VoiceMeeter normally *ignores* the Windows slider for its virtual input, so the bridge
watches the Windows volume of "Voicemeeter Input" and mirrors it onto VoiceMeeter's
fader in real time.

- Starts automatically at login (no window, ~7 KB). Lives in
  `%LOCALAPPDATA%\VanVolumeBridge\` (`VanVolumeBridge.exe` + its `.cs` source).
- If the van ever stops responding to the slider: check it's running
  (`Get-Process VanVolumeBridge`); if not, run `VanVolumeBridge.exe` from that folder,
  or just log out and back in.

---

## The pieces

### PC side — VoiceMeeter (standard)
- **Default playback device** = `Voicemeeter Input` (sends PC audio into VoiceMeeter).
- **A1 (hardware out)** = **Realtek (Speakers)**. ⚠️ Keep this on Realtek — it's the
  engine's clock. Do **not** set A1 to the monitor (HDMI) or the wireless headset:
  those disappear when the screen/headset idles and **VoiceMeeter goes silent**.
  (That was the main bug while setting this up.)
- **VBAN** (top-right button → panel): outgoing **Stream1** → `192.168.10.173` port
  `6980`, BUS A, PCM 16-bit, 2ch, Optimal. Master toggle top-left must say **"VBAN is ON"**.
- The engine indicator should read **`48kHz | 512`** when healthy.

### HA box — receiver
- Binary: `/config/vban/vban_receptor` (built for Alpine; runs in the `hassio_audio` container).
- Command: `vban_receptor -i 172.30.32.1 -p 6980 -s Stream1 -b pulseaudio -q 1`
  (no `-d` — it must use the **default** PulseAudio sink, which is the SPDIF adapter;
  passing the sink name by `-d` fails with "No such entity").
- Host forwards UDP `6980` → the audio container (iptables DNAT + MASQUERADE, like Scream's 4010).

### Network
- A `/32` route on the PC pins `192.168.10.173` to the **Ethernet** LAN, so audio
  doesn't detour through the **Tailscale** tunnel (Tailscale advertises the whole
  `192.168.10.0/24`, which otherwise hijacks it). If van audio ever dies, check this
  route still exists: `Find-NetRoute -RemoteIPAddress 192.168.10.173` should say
  `Ethernet`, not `Tailscale`.

---

## 🔧 Troubleshooting: no sound on the van

Audio is playing on the PC but the van speakers are silent. Work down this list —
it's almost always one of the two regressions we hit on 2026-06-28.

**Step 1 — Are VoiceMeeter's input meters moving?**
Open VoiceMeeter and play something (YouTube). Watch the **Voicemeeter Input**
(virtual) strip meter.

- **Meters are FLAT (not moving)** → VoiceMeeter's **audio engine is wedged**.
  This happens when the Windows audio service gets disturbed (e.g. plugging/unplugging
  devices, a driver/endpoint change). Windows is handing audio to the device but
  VoiceMeeter isn't pulling it in.
  **Fix:** VoiceMeeter → **Menu** (top-right) → **Restart Audio Engine**. The meters
  should jump to life. (Restarting the *engine* fixes it — restarting the whole *app*
  often does **not**.)

- **Meters ARE moving** (audio reaches VoiceMeeter) but still no van sound → go to Step 2.

**Step 2 — Did the route slip back onto the VPN?**
In PowerShell:
```powershell
Find-NetRoute -RemoteIPAddress 192.168.10.173
```
- Source `192.168.10.185` / **Ethernet** = good (skip to Step 3).
- Source `100.x.x.x` / **Tailscale** = **hijacked.** Traffic is diving into the VPN
  tunnel instead of the LAN. The `/32` pin route got dropped or re-created wrong.
  **Fix — run in an *admin* PowerShell** (Ethernet is `InterfaceIndex 12`; verify with
  `Get-NetIPInterface -AddressFamily IPv4` if it ever changes):
  ```powershell
  Remove-NetRoute -DestinationPrefix '192.168.10.173/32' -Confirm:$false -ErrorAction SilentlyContinue
  New-NetRoute -DestinationPrefix '192.168.10.173/32' -InterfaceIndex 12 -NextHop '0.0.0.0' -RouteMetric 1
  ```
  ⚠️ NextHop **must** be `0.0.0.0` (on-link). A `/32` with the PC's own IP as the
  gateway looks right in the table but Windows treats it as invalid and falls back to
  the VPN — that's exactly what broke it on 06-28.

**Step 3 — After fixing the engine and/or route, kick VBAN.**
Restarting the engine can leave VBAN silently not transmitting even though it still
says "VBAN is ON". Click the **VBAN** button → toggle the **"VBAN is ON"** master off
then on. Van audio should resume within a second.

**Sanity check from the HA side** (audio actually arriving):
```bash
ssh -p 22222 root@192.168.10.173 \
  "c1=$(iptables -nvxL DOCKER-USER|awk '/6980/{print $1}'); sleep 3; \
   c2=$(iptables -nvxL DOCKER-USER|awk '/6980/{print $1}'); echo delta=$((c2-c1))"
```
A climbing delta (~1300 per 3 s) = packets flowing. Flat = nothing arriving.

---

## Notes / not-yet-done
- **Local echo while streaming to the van:** with the current routing, van audio also
  goes out the PC's Realtek output (usually nothing plugged in there, so silent). Can
  be made van-only on request (route VoiceMeeter virtual input to BUS B + VBAN source B).
- **Survive a reboot — DONE.** Everything comes back on its own now:
  - ✅ HA receiver auto-starts on HA boot (`/config/vban/start-receiver.sh` via
    `shell_command.start_vban_receptor`, run by the "VBAN audio receiver" automation).
  - ✅ VoiceMeeter + the volume bridge auto-launch at login via **Startup-folder
    shortcuts** (`shell:startup` → VoiceMeeter.lnk, VanVolumeBridge.lnk). The Windows
    Run keys turned out to be unreliable here, so these are the primary mechanism.
  - ✅ The `/32` route self-heals at login **and every 3 minutes** via the
    **`VanAudio-RouteFix`** scheduled task, which runs a tiny native helper
    `C:\ProgramData\VanAudio\VanRouteFixer.exe`. (It can't be a PowerShell task —
    Windows Defender blocks PowerShell *and* unsigned exes in your user folder when
    the scheduler launches them; a native exe in `ProgramData` is the workaround.)
  - 🆘 Manual backup: a Desktop shortcut **"Fix Van Audio"** re-pins the route on
    demand (one click → approve the admin prompt) if the van is ever silent after a boot.
