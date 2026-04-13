import { useState, useEffect, useRef, useMemo } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { useEntity } from '@/hooks/useEntity';
import { useToggle } from '@/hooks/useService';
import {
  Maximize2,
  VideoOff,
  Grid2x2,
  Loader2,
  Lightbulb,
  History,
  Radio,
  ChevronLeft,
  ChevronRight,
  Play,
} from 'lucide-react';

const CAMERAS = [
  { entityId: 'camera.channel_1', label: 'Left', channel: 1, stream: 'channel_1', lightEntityId: 'switch.a32_pro_switch21_left_outdoor_lights' },
  { entityId: 'camera.channel_2', label: 'Right', channel: 2, stream: 'channel_2', lightEntityId: 'switch.a32_pro_switch22_right_outdoor_lights' },
  { entityId: 'camera.channel_3', label: 'Front', channel: 3, stream: 'channel_3', lightEntityId: 'switch.a32_pro_switch31_lightbar' },
  { entityId: 'camera.channel_4', label: 'Back', channel: 4, stream: 'channel_4', lightEntityId: 'switch.a32_pro_switch23_rear_outdoor_lights' },
];

const ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
];

type StreamState = 'connecting' | 'playing' | 'error';

/**
 * WebRTC camera feed using direct go2rtc signaling via dvr_proxy.
 * Bypasses HA entirely — sends SDP offer to dvr_proxy (:8766/api/webrtc),
 * which forwards to go2rtc's RTSP stream, and returns the SDP answer.
 *
 * Stall recovery strategy (avoids reconnect cascade across 4 channels):
 *  1. Grace period: ignore stalls for 15s after connection established
 *  2. Soft recovery first: try pause/play before tearing down the peer connection
 *  3. Require 2 consecutive stall checks (10s apart) before hard reconnect
 *  4. Stagger reconnects: add per-channel random delay to avoid thundering herd
 */
function WebRTCFeed({ stream }: { stream: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const [state, setState] = useState<StreamState>('connecting');
  const [retryKey, setRetryKey] = useState(0);
  const retryCountRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
    let stallTimer: ReturnType<typeof setInterval> | undefined;
    let lastVideoTime = 0;
    let stallCount = 0; // consecutive stall detections (need 2 to trigger reconnect)
    let isPlaying = false;
    let playingSince = 0; // timestamp when playback started (for grace period)

    function scheduleReconnect() {
      if (cancelled) return;
      // Per-channel stagger: hash the stream name to get 0-2s offset
      const stagger = (stream.charCodeAt(stream.length - 1) % 4) * 500;
      const base = Math.min(2000 * Math.pow(2, retryCountRef.current), 30000);
      const delay = base + stagger;
      retryCountRef.current++;
      reconnectTimer = setTimeout(() => {
        if (!cancelled) {
          setState('connecting');
          setRetryKey((k) => k + 1);
        }
      }, delay);
    }

    async function connect() {
      try {
        const pc = new RTCPeerConnection({
          iceServers: ICE_SERVERS,
          bundlePolicy: 'max-bundle',
        });
        pcRef.current = pc;

        pc.addTransceiver('video', { direction: 'recvonly' });
        pc.addTransceiver('audio', { direction: 'recvonly' });

        pc.ontrack = (event) => {
          if (!cancelled && videoRef.current && event.streams[0]) {
            videoRef.current.srcObject = event.streams[0];
          }
        };

        pc.onconnectionstatechange = () => {
          if (cancelled) return;
          const s = pc.connectionState;
          if (s === 'connected') {
            setState('playing');
            isPlaying = true;
            playingSince = Date.now();
            stallCount = 0;
            retryCountRef.current = 0;
          } else if (s === 'failed' || s === 'closed') {
            isPlaying = false;
            setState('connecting');
            scheduleReconnect();
          } else if (s === 'disconnected') {
            // Wait 8s before treating disconnected as dead — WebRTC ICE can recover
            isPlaying = false;
            setTimeout(() => {
              if (!cancelled && pc.connectionState === 'disconnected') {
                setState('connecting');
                scheduleReconnect();
              }
            }, 8000);
          }
        };

        // Create offer and wait for ICE gathering to complete
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        // Wait for ICE candidates to be gathered (needed for HTTP signaling)
        if (pc.iceGatheringState !== 'complete') {
          await new Promise<void>((resolve) => {
            const check = () => {
              if (pc.iceGatheringState === 'complete') resolve();
            };
            pc.addEventListener('icegatheringstatechange', check);
            // Safety timeout — don't wait forever
            setTimeout(resolve, 3000);
          });
        }

        if (cancelled) return;

        // Exchange SDP via dvr_proxy → go2rtc (no HA involved)
        const resp = await fetch(`${DVR_PROXY}/api/webrtc`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            stream,
            offer: pc.localDescription!.sdp,
          }),
        });

        if (!resp.ok) {
          throw new Error(`WebRTC proxy error: ${resp.status}`);
        }

        const data = await resp.json();
        if (!data.answer) {
          throw new Error('No answer in response');
        }

        await pc.setRemoteDescription(
          new RTCSessionDescription({ type: 'answer', sdp: data.answer }),
        );
      } catch (err) {
        if (!cancelled) {
          console.error(`WebRTC connect failed for ${stream}:`, err);
          setState('connecting');
          scheduleReconnect();
        }
      }
    }

    // Stall detection: check every 10s if video.currentTime is advancing.
    // - Skip checks during 15s grace period after connection
    // - First stall: try soft recovery (pause/play)
    // - Second consecutive stall: hard reconnect
    stallTimer = setInterval(() => {
      const video = videoRef.current;
      if (!video || !isPlaying || video.paused) return;
      // 15s grace period after connection — DVR needs time to start streaming
      if (Date.now() - playingSince < 15000) {
        lastVideoTime = video.currentTime;
        return;
      }
      if (video.currentTime > 0 && video.currentTime === lastVideoTime) {
        stallCount++;
        if (stallCount === 1) {
          // Soft recovery: try pause/play to unstick the video element
          console.warn(`[${stream}] Stall detected, attempting soft recovery`);
          video.pause();
          video.play().catch(() => {});
        } else if (stallCount >= 2) {
          // Hard reconnect after 2 consecutive stalls (20s frozen)
          console.warn(`[${stream}] Persistent stall (${stallCount}), reconnecting`);
          isPlaying = false;
          stallCount = 0;
          setState('connecting');
          setRetryKey((k) => k + 1);
        }
      } else {
        stallCount = 0;
      }
      lastVideoTime = video.currentTime;
    }, 10000);

    connect();

    return () => {
      cancelled = true;
      isPlaying = false;
      clearTimeout(reconnectTimer);
      clearInterval(stallTimer);
      pcRef.current?.close();
      pcRef.current = null;
    };
  }, [stream, retryKey]);

  return (
    <div className="relative w-full h-full bg-black">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`w-full h-full object-contain transition-opacity duration-300 ${
          state === 'playing' ? 'opacity-100' : 'opacity-0'
        }`}
      />
      {state === 'connecting' && (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}
      {state === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground gap-2">
          <VideoOff className="h-6 w-6" />
          <span className="text-xs">Reconnecting…</span>
        </div>
      )}
    </div>
  );
}

// ─── Single Camera Cell ───

function LightButton({ entityId }: { entityId: string }) {
  const entity = useEntity(entityId);
  const toggle = useToggle(entityId);
  const isOn = entity?.state === 'on';

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        toggle();
      }}
      className={`flex items-center justify-center w-9 h-9 rounded-full transition-all ${
        isOn
          ? 'bg-yellow-400/90 text-black shadow-[0_0_12px_rgba(250,204,21,0.5)]'
          : 'bg-white/15 text-white/70 hover:bg-white/25'
      }`}
    >
      <Lightbulb className="h-4.5 w-4.5" />
    </button>
  );
}

function CameraCell({
  stream,
  label,
  lightEntityId,
  hidden,
  expanded,
  onExpand,
  onCollapse,
}: {
  stream: string;
  label: string;
  lightEntityId: string;
  hidden: boolean;
  expanded: boolean;
  onExpand: () => void;
  onCollapse: () => void;
}) {

  return (
    <div
      className={`relative rounded-lg overflow-hidden bg-black border border-border cursor-pointer group ${
        hidden ? 'hidden' : ''
      }`}
      onClick={expanded ? undefined : onExpand}
    >
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-3 py-1.5 bg-gradient-to-b from-black/70 to-transparent">
        <div className="flex items-center gap-2">
          <span className={`text-white font-medium drop-shadow ${expanded ? '' : 'text-sm'}`}>
            {label}
          </span>
          <LightButton entityId={lightEntityId} />
        </div>
        {expanded ? (
          <button
            onClick={onCollapse}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 text-white text-sm transition-colors"
          >
            <Grid2x2 className="h-4 w-4" />
            Grid
          </button>
        ) : (
          <Maximize2 className="h-4 w-4 text-white/70 opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </div>

      <WebRTCFeed stream={stream} />
    </div>
  );
}

// ─── DVR Proxy ───

const DVR_PROXY = (() => {
  // Proxy runs on port 8766 on the HA host
  const loc = window.location;
  const host = loc.hostname;
  return `http://${host}:8766`;
})();

interface TimelineSegment {
  start: string;
  end: string;
  flags: string;
}

async function dvrFetch(path: string, init?: RequestInit) {
  const r = await fetch(`${DVR_PROXY}${path}`, init);
  if (!r.ok) throw new Error(`DVR proxy error: ${r.status}`);
  return r.json();
}

// ─── Playback MP4 Feed ───

/**
 * Plays DVR recordings via go2rtc's fMP4 stream proxied through dvr_proxy.
 * Uses MSE (Media Source Extensions) because go2rtc outputs fragmented MP4
 * which has duration=0 — Chrome can't play this via plain <video src>.
 * MSE lets us append fMP4 fragments as they arrive from the fetch stream.
 */
function PlaybackFeed({
  speed = 1,
  onError,
}: {
  speed?: number;
  onError?: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [state, setState] = useState<StreamState>('connecting');

  // Update playbackRate when speed changes (no remount needed)
  useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = speed;
  }, [speed]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let cancelled = false;
    let objectUrl: string | null = null;
    let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;

    async function start() {
      if (!video) return;
      try {
        // 1. Fetch the fMP4 stream
        const resp = await fetch(`${DVR_PROXY}/api/playback/stream`);
        if (cancelled) return;
        if (!resp.ok || !resp.body) {
          console.error('Playback stream:', resp.status);
          setState('error');
          onError?.();
          return;
        }

        // 2. Determine MSE codec
        const ct = resp.headers.get('Content-Type') || 'video/mp4; codecs="hvc1"';
        let mimeType = ct.split(';').map(s => s.trim()).join('; ');
        if (!MediaSource.isTypeSupported(mimeType)) {
          mimeType = 'video/mp4; codecs="hvc1"';
        }
        if (!MediaSource.isTypeSupported(mimeType)) {
          mimeType = 'video/mp4; codecs="avc1.640028"';
        }
        if (!MediaSource.isTypeSupported(mimeType)) {
          console.error('No supported MSE codec');
          setState('error');
          onError?.();
          return;
        }

        // 3. Create MediaSource
        const ms = new MediaSource();
        objectUrl = URL.createObjectURL(ms);
        video.src = objectUrl;

        await new Promise<void>((resolve) =>
          ms.addEventListener('sourceopen', () => resolve(), { once: true }),
        );
        if (cancelled) return;

        const sb = ms.addSourceBuffer(mimeType);
        reader = resp.body.getReader();

        // Queue: when SourceBuffer is busy, queue chunks for later
        const queue: Uint8Array[] = [];

        const drain = () => {
          if (queue.length > 0 && !sb.updating && ms.readyState === 'open') {
            sb.appendBuffer(queue.shift()!);
          }
        };
        sb.addEventListener('updateend', drain);

        // 4. Pump fetch stream → SourceBuffer
        let started = false;
        while (!cancelled) {
          const { done, value } = await reader.read();
          if (done || !value) break;

          if (sb.updating || queue.length > 0) {
            queue.push(value);
          } else {
            sb.appendBuffer(value);
          }

          // Start playback once we have some data buffered
          if (!started) {
            started = true;
            video.playbackRate = speed;
            video.play().catch(() => {});
          }
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Playback MSE error:', err);
          setState('error');
          onError?.();
        }
      }
    }

    const onPlaying = () => { if (!cancelled) setState('playing'); };
    const onVideoError = () => {
      if (!cancelled) {
        console.error('Playback video error:', video.error);
        setState('error');
        onError?.();
      }
    };

    video.addEventListener('playing', onPlaying);
    video.addEventListener('error', onVideoError);

    start();

    return () => {
      cancelled = true;
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('error', onVideoError);
      reader?.cancel().catch(() => {});
      video.pause();
      video.removeAttribute('src');
      video.load();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onError]);

  return (
    <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`w-full h-full object-contain transition-opacity duration-300 ${
          state === 'playing' ? 'opacity-100' : 'opacity-0'
        }`}
      />
      {state === 'connecting' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground gap-2">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="text-sm">Connecting to recording...</span>
        </div>
      )}
      {state === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground gap-2">
          <VideoOff className="h-8 w-8" />
          <span className="text-sm">Playback failed</span>
        </div>
      )}
    </div>
  );
}

// ─── Timeline Bar ───

function TimelineBar({
  segments,
  date,
  selectedTime,
  onSelectTime,
}: {
  segments: TimelineSegment[];
  date: string;
  selectedTime: string;
  onSelectTime: (time: string) => void;
}) {
  const barRef = useRef<HTMLDivElement>(null);
  const HOURS = 24;
  const dayStart = new Date(`${date}T00:00:00`).getTime();
  const dayEnd = dayStart + HOURS * 3600000;

  const toPercent = (time: string) => {
    const t = new Date(time.replace(' ', 'T')).getTime();
    return ((t - dayStart) / (dayEnd - dayStart)) * 100;
  };

  const selectedPercent = (() => {
    if (!selectedTime) return 0;
    const t = new Date(selectedTime.replace(' ', 'T')).getTime();
    return Math.max(0, Math.min(100, ((t - dayStart) / (dayEnd - dayStart)) * 100));
  })();

  const handleClick = (e: React.MouseEvent) => {
    if (!barRef.current) return;
    const rect = barRef.current.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    const ts = dayStart + pct * (dayEnd - dayStart);
    const d = new Date(ts);
    const pad = (n: number) => String(n).padStart(2, '0');
    const timeStr = `${date} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    onSelectTime(timeStr);
  };

  // Hour labels
  const hourLabels = useMemo(() => {
    const labels = [];
    for (let h = 0; h < 24; h += 3) {
      labels.push(
        <span
          key={h}
          className="absolute text-[9px] text-muted-foreground -bottom-4"
          style={{ left: `${(h / 24) * 100}%`, transform: 'translateX(-50%)' }}
        >
          {h === 0 ? '12a' : h < 12 ? `${h}a` : h === 12 ? '12p' : `${h - 12}p`}
        </span>,
      );
    }
    return labels;
  }, []);

  return (
    <div className="relative px-1 pt-1 pb-6">
      <div
        ref={barRef}
        className="relative w-full h-6 bg-muted/50 rounded cursor-pointer border border-border overflow-hidden"
        onClick={handleClick}
      >
        {/* Recording segments */}
        {segments.map((seg, i) => {
          const left = Math.max(0, toPercent(seg.start));
          const right = Math.min(100, toPercent(seg.end));
          return (
            <div
              key={i}
              className="absolute top-0 bottom-0 bg-blue-500/50"
              style={{ left: `${left}%`, width: `${right - left}%` }}
            />
          );
        })}
        {/* Selected time indicator */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
          style={{ left: `${selectedPercent}%` }}
        />
      </div>
      {hourLabels}
    </div>
  );
}

// ─── Playback Mode ───

function PlaybackMode() {
  const [channel, setChannel] = useState(1);
  const [date, setDate] = useState(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });
  const [segments, setSegments] = useState<TimelineSegment[]>([]);
  const [selectedTime, setSelectedTime] = useState('');
  const [playbackKey, setPlaybackKey] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [dateRange, setDateRange] = useState<{ min: string; max: string } | null>(null);

  // Fetch date range on mount
  useEffect(() => {
    dvrFetch(`/api/date-range?channel=${channel}`).then((r) => {
      if (r.min_date && r.max_date) {
        setDateRange({
          min: r.min_date.slice(0, 10),
          max: r.max_date.slice(0, 10),
        });
      }
    }).catch(() => {});
  }, [channel]);

  // Fetch timeline when date or channel changes
  useEffect(() => {
    setSegments([]);
    setPlaybackKey(null);
    dvrFetch(`/api/timeline?channel=${channel}&date=${date}`).then((r) => {
      setSegments(r.segments || []);
      // Default selected time to first segment start
      if (r.segments?.length && !selectedTime) {
        setSelectedTime(r.segments[0].start);
      }
    }).catch(() => {});
  }, [date, channel]);

  const prevDate = () => {
    const d = new Date(date);
    d.setDate(d.getDate() - 1);
    const s = d.toISOString().slice(0, 10);
    if (!dateRange || s >= dateRange.min) {
      setDate(s);
      setSelectedTime('');
    }
  };
  const nextDate = () => {
    const d = new Date(date);
    d.setDate(d.getDate() + 1);
    const s = d.toISOString().slice(0, 10);
    if (!dateRange || s <= dateRange.max) {
      setDate(s);
      setSelectedTime('');
    }
  };

  const startPlayback = async (overrideTime?: string, overrideSpeed?: number) => {
    const playTime = overrideTime ?? selectedTime;
    const playSpeed = overrideSpeed ?? speed;
    if (!playTime) return;
    setLoading(true);
    setPlaybackKey(null);

    // Find end time: end of the segment containing playTime, or +30min
    const selMs = new Date(playTime.replace(' ', 'T')).getTime();
    let endTime = '';
    for (const seg of segments) {
      const segStart = new Date(seg.start.replace(' ', 'T')).getTime();
      const segEnd = new Date(seg.end.replace(' ', 'T')).getTime();
      if (selMs >= segStart && selMs < segEnd) {
        endTime = seg.end;
        break;
      }
    }
    if (!endTime) {
      // Default to +30min
      const end = new Date(selMs + 30 * 60000);
      const pad = (n: number) => String(n).padStart(2, '0');
      endTime = `${date} ${pad(end.getHours())}:${pad(end.getMinutes())}:${pad(end.getSeconds())}`;
    }

    try {
      // Wait briefly for go2rtc to register the stream before loading video
      await dvrFetch('/api/playback/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel, startTime: playTime, endTime, speed: playSpeed }),
      });
      // Bump key to remount the PlaybackFeed video element
      setPlaybackKey(Date.now());
    } catch (err) {
      console.error('Playback start error:', err);
    } finally {
      setLoading(false);
    }
  };

  const stopPlayback = () => {
    setPlaybackKey(null);
    dvrFetch('/api/playback/stop', { method: 'POST' }).catch(() => {});
  };

  // When timeline is clicked during playback, auto-restart at the new time
  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    if (playbackKey) {
      startPlayback(time);
    }
  };

  // When speed changes during playback, restart at current selected time with new speed
  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
    // Browser handles speed change via video.playbackRate — no restart needed
  };

  const channelLabel = CAMERAS.find((c) => c.channel === channel)?.label ?? `Ch ${channel}`;

  return (
    <div className="space-y-3">
      {/* Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Channel selector */}
        <div className="flex gap-1">
          {CAMERAS.map((cam) => (
            <button
              key={cam.channel}
              onClick={() => {
                setChannel(cam.channel);
                setPlaybackKey(null);
              }}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                channel === cam.channel
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {cam.label}
            </button>
          ))}
        </div>

        {/* Date navigation */}
        <div className="flex items-center gap-1 ml-auto">
          <button onClick={prevDate} className="p-1.5 rounded-md hover:bg-muted transition-colors">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <input
            type="date"
            value={date}
            min={dateRange?.min}
            max={dateRange?.max}
            onChange={(e) => {
              setDate(e.target.value);
              setSelectedTime('');
            }}
            className="bg-muted border border-border rounded-md px-2 py-1 text-sm"
          />
          <button onClick={nextDate} className="p-1.5 rounded-md hover:bg-muted transition-colors">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Timeline */}
      {segments.length > 0 ? (
        <TimelineBar
          segments={segments}
          date={date}
          selectedTime={selectedTime}
          onSelectTime={handleTimeSelect}
        />
      ) : (
        <div className="text-center text-muted-foreground text-sm py-4">
          No recordings found for {date}
        </div>
      )}

      {/* Play controls & speed selector */}
      {selectedTime && (
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm text-muted-foreground">
            {channelLabel} · {selectedTime.slice(11)}
          </span>
          {playbackKey ? (
            <button
              onClick={stopPlayback}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/30 transition-colors"
            >
              Stop
            </button>
          ) : (
            <button
              onClick={() => startPlayback()}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              Play
            </button>
          )}

          {/* Speed selector */}
          <div className="flex items-center gap-0.5 ml-auto">
            {[1, 2, 4, 8].map((s) => (
              <button
                key={s}
                onClick={() => handleSpeedChange(s)}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                  speed === s
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted/60 text-muted-foreground hover:bg-muted'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Video player */}
      {playbackKey && (
        <div className="aspect-video rounded-lg overflow-hidden border border-border">
          <PlaybackFeed
            key={playbackKey}
            speed={speed}
            onError={stopPlayback}
          />
        </div>
      )}
    </div>
  );
}

// ─── Page ───

export default function Cameras() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [mode, setMode] = useState<'live' | 'playback'>('live');

  return (
    <PageContainer title="Cameras">
      {/* Mode toggle */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={() => setMode('live')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            mode === 'live'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          <Radio className="h-4 w-4" />
          Live
        </button>
        <button
          onClick={() => setMode('playback')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            mode === 'playback'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          <History className="h-4 w-4" />
          Playback
        </button>
      </div>

      {/* Live camera grid — always mounted, hidden when playback */}
      <div className={mode === 'live' ? '' : 'hidden'}>
        <div
          className="grid gap-3"
          style={{
            minHeight: 'calc(100vh - 180px)',
            gridTemplateColumns: expanded ? '1fr' : 'repeat(2, 1fr)',
            gridTemplateRows: expanded ? '1fr' : 'repeat(2, 1fr)',
          }}
        >
          {CAMERAS.map((cam) => {
            const isExpanded = expanded === cam.stream;
            const isHidden = expanded !== null && !isExpanded;
            return (
              <CameraCell
                key={cam.stream}
                stream={cam.stream}
                label={cam.label}
                lightEntityId={cam.lightEntityId}
                hidden={isHidden}
                expanded={isExpanded}
                onExpand={() => setExpanded(cam.stream)}
                onCollapse={() => setExpanded(null)}
              />
            );
          })}
        </div>
      </div>

      {/* Playback mode */}
      {mode === 'playback' && <PlaybackMode />}
    </PageContainer>
  );
}
