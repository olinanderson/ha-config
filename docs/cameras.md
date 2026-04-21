# Security Cameras — Lorex DVR + go2rtc + MSE

## DVR Details

| Setting | Value |
|---|---|
| **Model** | Lorex D231A41B (Dahua XVR5104C-X1, 4ch, 1TB HDD) |
| **IP** | `192.168.10.156` |
| **RTSP port** | 554 |
| **Credentials** | `admin` / *(in go2rtc.yaml on HA host)* |
| **Main stream** | H.264 High, 960×480, 30fps, 768kbps VBR |
| **Sub stream** | H.264, 704×480, 15fps, 512kbps CBR |

## Streaming Architecture

```
Browser (MSEFeed) ──HTTP/TCP──► dvr_proxy:8766 ──HTTP──► go2rtc:1984 ──RTSP──► DVR:554
```

MSE over HTTP (TCP) instead of WebRTC (UDP) — eliminates WiFi packet loss, ~1s latency.

## go2rtc

- Config: `/config/go2rtc.yaml` (8 streams: `channel_1-4` main + `channel_1-4_sub`)
- API: `http://localhost:1984/api/streams` (on HA host)
- MSE: `http://localhost:1984/api/stream.mp4?src=channel_N`

## dvr_proxy.py (ports 8766/8767)

| Endpoint | Purpose |
|---|---|
| `GET /api/mse?src=channel_N` | Proxy go2rtc MSE stream |
| `POST /api/playback/start` | Start DVR playback |
| `POST /api/playback/speed` | Change playback speed |
| `POST /api/playback/stop` | Stop playback |
| `GET /api/timeline?channel=N&date=YYYY-MM-DD` | DVR recording segments |

Auto-started by `dvr_proxy_start_on_boot` automation (40s delay).

## MSEFeed — Live Streaming

- Fetches fMP4 via `fetch()` → `ReadableStream` → `MediaSource` → `SourceBuffer`
- Buffer: keeps last 20s, trims at 60s
- Live edge: proportional controller targets 0.5s lag
- Stall: 8s stuck → force reconnect
- Worker MSE (Chrome 107+): 4×30fps HD grid via dedicated workers
- Fallback: main-thread MSE uses sub-streams (15fps SD) for grid stability

## DVR Playback

Supports 1×–16× speed via RTSP Scale header. At >1×, DVR sends I-frames only.
`FMP4Rewriter` respaces timestamps at 2s intervals for smooth browser playback.

### Playback Feed

- Main-thread MSE only (single stream)
- Adaptive playback rate prevents buffer underrun/overflow
- `findExtendedEndTime()` walks contiguous DVR segments (gap ≤ 5s)

## Critical Notes

- Both streams are H.264 (main was changed from H.265 for MSE compatibility)
- Always hard-refresh after deploy
- Producer-consumer queue in dvr_proxy prevents TCP backpressure → packet drops
