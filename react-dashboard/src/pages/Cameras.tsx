import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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
  Pause,
  Undo2,
  Redo2,
  Scissors,
  Download,
  Trash2,
  Film,
  X,
  Check,
} from 'lucide-react';

const CAMERAS = [
  { entityId: 'camera.channel_1', label: 'Left', channel: 1, stream: 'channel_1', lightEntityId: 'switch.a32_pro_switch21_left_outdoor_lights' },
  { entityId: 'camera.channel_2', label: 'Right', channel: 2, stream: 'channel_2', lightEntityId: 'switch.a32_pro_switch22_right_outdoor_lights' },
  { entityId: 'camera.channel_3', label: 'Front', channel: 3, stream: 'channel_3', lightEntityId: 'switch.a32_pro_switch31_lightbar' },
  { entityId: 'camera.channel_4', label: 'Back', channel: 4, stream: 'channel_4', lightEntityId: 'switch.a32_pro_switch23_rear_outdoor_lights' },
];

type StreamState = 'connecting' | 'playing' | 'error' | 'unsupported';

/**
 * Resolve the best available MSE class.
 * Safari 17.1+ (including iOS WKWebView / HA companion app) provides
 * ManagedMediaSource instead of (or in addition to) MediaSource.
 */
const MSEClass: typeof MediaSource | undefined =
  (window as any).ManagedMediaSource ?? window.MediaSource;

/** Whether this browser supports MSE (desktop Chrome, etc.) or not (iOS WKWebView). */
const HAS_MSE = !!MSEClass;

/**
 * Build HLS stream URL through our go2rtc proxy.
 * go2rtc serves HLS at /api/stream.m3u8?src=X — we proxy it through HA's HTTP
 * server so it works over Nabu Casa HTTPS.
 */
function getHlsUrl(stream: string): string {
  if (IS_HTTPS) {
    const base = (window as unknown as Record<string, unknown>).__HA_BASE_URL__ || '';
    return `${base}/api/go2rtc/api/stream.m3u8?src=${encodeURIComponent(stream)}`;
  }
  return `http://${window.location.hostname}:1984/api/stream.m3u8?src=${encodeURIComponent(stream)}`;
}

// ─── Network Detection ───

/** True when page is served over HTTPS (e.g. Nabu Casa) */
const IS_HTTPS = window.location.protocol === 'https:';

/** True when accessing HA on the van's local network (not over Tailscale) */
const IS_LOCAL = /^192\.168\.10\./.test(window.location.hostname);

// ─── DVR Proxy ───

/** Direct proxy URL — only reachable on HTTP (local/Tailscale) */
const DVR_PROXY = `http://${window.location.hostname}:8766`;

/** DVR JSON API base — routes through HA proxy on HTTPS for Nabu Casa */
function dvrApiBase(): string {
  if (IS_HTTPS) {
    const base = (window as unknown as Record<string, unknown>).__HA_BASE_URL__ || '';
    return `${base}/api/dvr`;
  }
  return `${DVR_PROXY}/api`;
}

/** DVR streaming base — routes through HA proxy on HTTPS for Nabu Casa */
function dvrStreamBase(): string {
  if (IS_HTTPS) {
    const base = (window as unknown as Record<string, unknown>).__HA_BASE_URL__ || '';
    return `${base}/api/dvr-stream`;
  }
  return `${DVR_PROXY}/api`;
}

/** Get auth headers for DVR requests through HA */
async function dvrAuthHeaders(): Promise<Record<string, string>> {
  const hass = (window as unknown as Record<string, unknown>).__HASS__ as { auth?: { data?: { access_token?: string } } } | undefined;
  let token = hass?.auth?.data?.access_token;
  if (!token) {
    // Wait for hass to be available
    token = await new Promise<string | undefined>((resolve) => {
      const timeout = setTimeout(() => {
        window.removeEventListener('hass-updated', handler);
        const h = (window as unknown as Record<string, unknown>).__HASS__ as any;
        resolve(h?.auth?.data?.access_token);
      }, 5000);
      const handler = () => {
        const h = (window as unknown as Record<string, unknown>).__HASS__ as any;
        const t = h?.auth?.data?.access_token;
        if (t) {
          clearTimeout(timeout);
          window.removeEventListener('hass-updated', handler);
          resolve(t);
        }
      };
      window.addEventListener('hass-updated', handler);
    });
  }
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Build the MSE stream URL. On HTTPS (Nabu Casa), use our DVR stream proxy
 * which routes through HA's HTTP server. On HTTP, use dvr_proxy directly.
 */
function getMseUrl(stream: string): string {
  if (IS_HTTPS) {
    const base = (window as unknown as Record<string, unknown>).__HA_BASE_URL__ || '';
    return `${base}/api/dvr-stream/mse?src=${encodeURIComponent(stream)}`;
  }
  return `${DVR_PROXY}/api/mse?src=${encodeURIComponent(stream)}`;
}

/** Get fetch headers — HA go2rtc proxy requires Bearer auth */
async function getMseFetchInit(signal: AbortSignal): Promise<RequestInit> {
  const init: RequestInit = { signal };
  if (IS_HTTPS) {
    const headers = await dvrAuthHeaders();
    if (headers.Authorization) {
      init.headers = headers;
    }
  }
  return init;
}

// ─── MSE Worker (Chrome 107+) ───
//
// Chrome 107 added MediaSource-in-DedicatedWorker: SourceBuffer.appendBuffer()
// runs entirely off the main thread, eliminating the JS-overhead bottleneck that
// prevents 4×30fps simultaneous streams.
//
// Feature flag: MediaSource.canConstructInDedicatedWorker === true
// Falls back to the existing main-thread MSE path on older browsers.

/** True when this Chrome supports MediaSource in a dedicated worker (Chrome 107+). */
const WORKER_MSE_SUPPORTED =
  typeof MediaSource !== 'undefined' &&
  (MediaSource as any).canConstructInDedicatedWorker === true;

/**
 * Worker source — runs fetch + SourceBuffer entirely off the main thread.
 * Plain ES2020 JS (no imports, no TS) so it can be inlined as a Blob URL,
 * which works correctly in Vite library mode (unlike ?worker imports).
 *
 * Protocol:
 *   Main → Worker:  { type:'start', url, headers, staggerMs }
 *                   { type:'stop' }
 *   Worker → Main:  { type:'handle', handle: MediaSourceHandle }
 *                   { type:'ready' }   — first chunk appended, call video.play()
 *                   { type:'done'  }   — EOF, reconnect
 *                   { type:'error', message }
 */
const MSE_WORKER_CODE = `
'use strict';
var abortCtrl = null;
var cancelled  = false;
var lastKnownCurrentTime = 0;

self.onmessage = function(e) {
  if (e.data.type === 'start') {
    cancelled = false;
    runStream(e.data.url, e.data.headers || {}, e.data.staggerMs || 0);
  } else if (e.data.type === 'stop') {
    cancelled = true;
    if (abortCtrl) { try { abortCtrl.abort(); } catch(x) {} }
  } else if (e.data.type === 'currentTime') {
    // Main thread reports video.currentTime every 3s so trim never cuts past playhead
    lastKnownCurrentTime = e.data.time;
  }
};

async function runStream(url, headers, staggerMs) {
  try {
    if (staggerMs > 0) await new Promise(function(r) { setTimeout(r, staggerMs); });
    if (cancelled) return;

    var ms = new MediaSource();
    // Transfer the handle to the main thread so it can set video.srcObject
    self.postMessage({ type: 'handle', handle: ms.handle }, [ms.handle]);

    await new Promise(function(resolve) {
      ms.addEventListener('sourceopen', resolve, { once: true });
    });
    if (cancelled) return;

    abortCtrl = new AbortController();
    var resp = await fetch(url, { signal: abortCtrl.signal, headers: headers });
    if (cancelled) return;
    if (!resp.ok || !resp.body) {
      self.postMessage({ type: 'error', message: 'HTTP ' + resp.status });
      return;
    }

    // Detect codec from Content-Type; fall back to H.264 High 4.0
    var ct       = resp.headers.get('Content-Type') || 'video/mp4; codecs="avc1.640028"';
    var mimeType = ct.split(';').map(function(s) { return s.trim(); }).join('; ');
    var sb;
    try {
      sb = ms.addSourceBuffer(mimeType);
    } catch(e1) {
      mimeType = 'video/mp4; codecs="avc1.640028"';
      try { sb = ms.addSourceBuffer(mimeType); }
      catch(e2) { self.postMessage({ type: 'error', message: 'No supported codec' }); return; }
    }

    // Single unified updateend handler — same as main-thread MSEFeed
    var queue = [], queueBytes = 0, trimPending = false;

    function processQueue() {
      if (sb.updating || ms.readyState !== 'open') return;
      if (queue.length > 0) {
        var merged;
        if (queue.length === 1) {
          merged = queue[0];
        } else {
          merged = new Uint8Array(queueBytes);
          var off = 0;
          for (var i = 0; i < queue.length; i++) {
            merged.set(queue[i], off); off += queue[i].byteLength;
          }
        }
        queue.length = 0; queueBytes = 0;
        try {
          sb.appendBuffer(merged);
        } catch(e3) {
          queue.push(merged); queueBytes = merged.byteLength;
          trimPending = true;
          if (!sb.updating) processTrim();
        }
        return;
      }
      if (trimPending) processTrim();
    }

    function processTrim() {
      if (sb.updating || ms.readyState !== 'open' || sb.buffered.length === 0) return;
      var bs = sb.buffered.start(0);
      var be = sb.buffered.end(sb.buffered.length - 1);
      if (be - bs > 60) {
        // Never trim within 5s of the current playhead — main thread sends currentTime
        // every 3s via watchdog so this is at most 3s stale.
        var safeRemoveTo = Math.min(be - 20, lastKnownCurrentTime - 5);
        if (safeRemoveTo > bs) {
          try { sb.remove(bs, safeRemoveTo); trimPending = false; }
          catch(e4) { trimPending = false; }
        } else { trimPending = false; } // playhead too close to buffer start — skip for now
      } else { trimPending = false; }
    }

    sb.addEventListener('updateend', processQueue);
    var trimId = setInterval(function() {
      if (!cancelled) { trimPending = true; processQueue(); }
    }, 10000);

    var reader = resp.body.getReader();
    var sentReady = false;
    while (!cancelled) {
      var result = await reader.read();
      if (result.done || !result.value) break;
      var chunk = result.value;
      if (sb.updating || queue.length > 0) {
        queue.push(chunk); queueBytes += chunk.byteLength;
      } else {
        try { sb.appendBuffer(chunk); }
        catch(e5) { queue.push(chunk); queueBytes += chunk.byteLength; }
      }
      if (!sentReady) { sentReady = true; self.postMessage({ type: 'ready' }); }
    }

    clearInterval(trimId);
    if (!cancelled) self.postMessage({ type: 'done' });

  } catch(err) {
    if (!cancelled) {
      var msg = err && err.name ? (err.name + ': ' + (err.message || '')) : String(err);
      if (msg.indexOf('AbortError') >= 0 || msg.indexOf('aborted') >= 0) return;
      self.postMessage({ type: 'error', message: msg });
    }
  }
}
`.trim();

function createMseWorker(): Worker {
  const blob = new Blob([MSE_WORKER_CODE], { type: 'application/javascript' });
  const burl = URL.createObjectURL(blob);
  const w = new Worker(burl);
  URL.revokeObjectURL(burl);
  return w;
}

/**
 * Live camera feed using MSE (Media Source Extensions) over HTTP.
 * Fetches go2rtc's fMP4 stream via dvr_proxy (/api/mse?src=...) over TCP.
 *
 * Uses MediaSource-in-Worker (Chrome 107+) when available so SourceBuffer work
 * runs off the main thread — enabling 4×30fps HD grid without JS-thread overload.
 * Falls back to main-thread MSE on older browsers.
 *
 * Auto-reconnects with exponential backoff on stream errors.
 */
function MSEFeed({ stream, paused }: { stream: string; paused?: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [state, setState] = useState<StreamState>('connecting');
  const [retryKey, setRetryKey] = useState(0);
  const retryCountRef = useRef(0);

  useEffect(() => {
    if (paused) {
      setState('connecting');
      return;
    }
    if (!videoRef.current) return;
    const video = videoRef.current;

    let cancelled = false;
    let reconnecting = false;
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
    let startTimer: ReturnType<typeof setTimeout> | undefined;
    let objectUrl: string | null = null;
    let abortCtrl: AbortController | null = null;
    let workerRef: Worker | null = null;

    function scheduleReconnect() {
      if (cancelled || reconnecting) return;
      reconnecting = true;
      // Stop whichever path is active: abort fetch (main thread) or terminate worker
      if (workerRef) { workerRef.postMessage({ type: 'stop' }); workerRef.terminate(); workerRef = null; }
      if (abortCtrl) abortCtrl.abort();
      const stagger = (stream.charCodeAt(stream.length - 1) % 4) * 500;
      const base = Math.min(2000 * Math.pow(2, retryCountRef.current), 30000);
      retryCountRef.current++;
      console.log(`[${stream}] Reconnecting in ${((base + stagger) / 1000).toFixed(1)}s (attempt ${retryCountRef.current})`);
      reconnectTimer = setTimeout(() => {
        if (!cancelled) {
          setState('connecting');
          setRetryKey((k) => k + 1);
        }
      }, base + stagger);
    }

    async function startMainThread() {
      try {
        if (!MSEClass) {
          console.error(`[${stream}] MSE not supported in this browser`);
          setState('unsupported');
          return;
        }

        abortCtrl = new AbortController();
        const resp = await fetch(
          getMseUrl(stream),
          await getMseFetchInit(abortCtrl.signal),
        );
        if (cancelled) return;
        if (!resp.ok || !resp.body) {
          throw new Error(`MSE stream error: ${resp.status}`);
        }

        // Determine MSE codec from Content-Type
        const ct =
          resp.headers.get('Content-Type') || 'video/mp4; codecs="avc1.640028"';
        let mimeType = ct
          .split(';')
          .map((s) => s.trim())
          .join('; ');
        if (!MSEClass.isTypeSupported(mimeType)) {
          mimeType = 'video/mp4; codecs="avc1.640028"';
        }
        if (!MSEClass.isTypeSupported(mimeType)) {
          throw new Error('No supported MSE codec');
        }

        // Create MediaSource (or ManagedMediaSource on iOS Safari)
        const ms = new MSEClass();
        objectUrl = URL.createObjectURL(ms);
        video.src = objectUrl;

        await new Promise<void>((resolve) =>
          ms.addEventListener('sourceopen', () => resolve(), { once: true }),
        );
        if (cancelled) return;

        const sb = ms.addSourceBuffer(mimeType);
        const reader = resp.body.getReader();

        // --- Single unified updateend handler ---
        // Priority: 1) drain queued chunks (batched), 2) trim old buffer
        const queue: Uint8Array[] = [];
        let queueBytes = 0;
        let trimPending = false;

        function processQueue() {
          if (sb.updating || ms.readyState !== 'open') return;

          // Priority 1: batch-append all queued data in one appendBuffer call
          // (reduces updateend round-trips when chunks back up briefly)
          if (queue.length > 0) {
            let merged: Uint8Array;
            if (queue.length === 1) {
              merged = queue[0];
            } else {
              merged = new Uint8Array(queueBytes);
              let offset = 0;
              for (const chunk of queue) { merged.set(chunk, offset); offset += chunk.byteLength; }
            }
            queue.length = 0;
            queueBytes = 0;
            try {
              sb.appendBuffer(merged);
            } catch {
              // QuotaExceededError — put data back and force a trim
              queue.push(merged);
              queueBytes = merged.byteLength;
              trimPending = true;
              if (!sb.updating) processTrim();
            }
            return;
          }

          // Priority 2: trim old data (only when queue is empty)
          if (trimPending) {
            processTrim();
          }
        }

        function processTrim() {
          if (sb.updating || ms.readyState !== 'open' || sb.buffered.length === 0) return;
          const bufStart = sb.buffered.start(0);
          const bufEnd = sb.buffered.end(sb.buffered.length - 1);
          if (bufEnd - bufStart > 60) {
            try {
              sb.remove(bufStart, bufEnd - 20);
              trimPending = false;
            } catch { /* ignore */ }
          } else {
            trimPending = false;
          }
        }

        sb.addEventListener('updateend', processQueue);

        // Schedule trims periodically — stagger by channel to avoid all 4 cameras
        // trimming simultaneously (each trim briefly pauses appendBuffer).
        const trimStagger = (stream.charCodeAt(stream.length - 1) % 4) * 2500;
        let trimIntervalId: ReturnType<typeof setInterval> | undefined;
        const trimTimeoutId = setTimeout(() => {
          trimIntervalId = setInterval(() => {
            if (!cancelled) { trimPending = true; processQueue(); }
          }, 10000);
        }, trimStagger);

        // Pump fetch stream → SourceBuffer
        let started = false;
        while (!cancelled && !reconnecting) {
          const { done, value } = await reader.read();
          if (done || !value) break;

          if (sb.updating || queue.length > 0) {
            queue.push(value);
            queueBytes += value.byteLength;
          } else {
            try {
              sb.appendBuffer(value);
            } catch {
              queue.push(value);
              queueBytes += value.byteLength;
            }
          }

          if (!started) {
            started = true;
            video.play().catch(() => {});
          }
        }

        clearTimeout(trimTimeoutId);
        clearInterval(trimIntervalId);

        // Stream ended (server closed) — reconnect
        if (!cancelled) {
          setState('connecting');
          scheduleReconnect();
        }
      } catch (err) {
        if (!cancelled && !reconnecting) {
          // Don't log AbortError — that's us intentionally killing the fetch
          if (err instanceof DOMException && err.name === 'AbortError') return;
          console.error(`[${stream}] MSE error:`, err);
          setState('connecting');
          scheduleReconnect();
        }
      }
    }

    // Worker path — SourceBuffer runs entirely off the main thread.
    // Main thread only handles: video element events, stall watchdog, playbackRate.
    async function startWorker() {
      if (!MSEClass) { setState('unsupported'); return; }
      // Auth headers must be resolved on the main thread (worker has no __HASS__)
      const headers: Record<string, string> = IS_HTTPS ? await dvrAuthHeaders() : {};
      if (cancelled) return;
      const chNum = parseInt(stream.match(/\d/)?.[0] ?? '1', 10);
      const staggerMs = Math.max(0, chNum - 1) * 250;
      workerRef = createMseWorker();
      workerRef.onmessage = (e: MessageEvent) => {
        if (cancelled) return;
        const { type } = e.data;
        if (type === 'handle') {
          // Attach the worker's MediaSource to the video element
          try { (video as any).srcObject = e.data.handle; } catch { /* ignore */ }
        } else if (type === 'ready') {
          video.play().catch(() => {});
        } else if (type === 'done' || type === 'error') {
          if (!reconnecting) {
            if (type === 'error') console.error(`[${stream}] Worker:`, e.data.message);
            setState('connecting');
            scheduleReconnect();
          }
        }
      };
      workerRef.onerror = () => {
        if (!cancelled && !reconnecting) { setState('connecting'); scheduleReconnect(); }
      };
      workerRef.postMessage({ type: 'start', url: getMseUrl(stream), headers, staggerMs });
    }

    // One-time snap to live edge on first play — prevents the video from
    // starting at buffer position 0 (potentially seconds behind live).
    let didSnapToEdge = false;
    const onPlaying = () => {
      if (!cancelled) {
        setState('playing');
        retryCountRef.current = 0;
        if (!didSnapToEdge && video.buffered.length > 0) {
          didSnapToEdge = true;
          const edge = video.buffered.end(video.buffered.length - 1);
          if (edge - video.currentTime > 1.0) {
            video.currentTime = Math.max(0, edge - 0.5);
          }
        }
      }
    };
    const onError = () => {
      if (!cancelled) {
        console.error(`[${stream}] Video element error:`, video.error);
        setState('connecting');
        scheduleReconnect();
      }
    };

    video.addEventListener('playing', onPlaying);
    video.addEventListener('error', onError);

    // Live edge maintenance + stall watchdog (every 1s)
    //
    // Continuous proportional control: instead of discrete rate bands, compute
    // an exact playbackRate every second based on how far the playhead is from
    // the target lag.  This eliminates visible rate-change jumps entirely.
    //
    // TARGET_LAG (0.5s): we *want* to be 0.5s behind the buffer edge — a tiny
    // cushion that prevents decoder starvation when data arrives in bursts.
    //   - Drift behind target → rate > 1.0 (catch up)
    //   - Drift ahead of target → rate < 1.0 (slow down, rebuild buffer)
    //   - At target → rate = 1.0
    //
    // Gain (K = 0.04/s): rate = 1.0 + (lag − 0.5) × 0.04, clamped [0.95, 1.15]
    //   lag  0.0s → 0.98  (slightly slow — too close to edge, rebuild buffer)
    //   lag  0.5s → 1.00  (on target)
    //   lag  1.5s → 1.04  (gentle catch-up, imperceptible)
    //   lag  3.0s → 1.10  (faster catch-up)
    //   lag  5.0s → 1.15  (cap — max smooth catch-up)
    //   lag 15.0s → hard seek (only after major stall recovery)
    //
    // The 1s interval (vs previous 3s) means corrections are 3× smaller per
    // tick, giving much finer-grained tracking with no perceptible jumps.
    const TARGET_LAG = 0.5;
    const GAIN = 0.04;
    const MIN_RATE = 0.95;
    const MAX_RATE = 1.15;
    const HARD_SEEK_LAG = 15;
    let lastTime = -1;
    let stallCount = 0;
    let stallStartTime = 0;
    const watchdog = setInterval(() => {
      if (cancelled || reconnecting) return;
      sendCurrentTimeToWorker();

      if (video.buffered.length > 0) {
        const edge = video.buffered.end(video.buffered.length - 1);
        const lag = edge - video.currentTime;

        if (lag > HARD_SEEK_LAG) {
          // Way behind (stall recovery) — hard seek close to live
          video.currentTime = Math.max(0, edge - TARGET_LAG);
          video.playbackRate = 1.0;
        } else {
          // Continuous proportional rate adjustment
          const desired = 1.0 + (lag - TARGET_LAG) * GAIN;
          const clamped = Math.min(MAX_RATE, Math.max(MIN_RATE, desired));
          // Only update if meaningfully different (avoid excessive property sets)
          if (Math.abs(video.playbackRate - clamped) > 0.005) {
            video.playbackRate = Math.round(clamped * 1000) / 1000;
          }
        }
      }

      // Stall detection — currentTime stuck for 8s (local) / 12s (remote)
      const stallThreshold = IS_LOCAL ? 8 : 12;
      const t = video.currentTime;
      if (lastTime >= 0 && t === lastTime && t > 0) {
        if (stallCount === 0) stallStartTime = Date.now();
        stallCount++;
        if (stallCount >= stallThreshold) {
          const stuckFor = ((Date.now() - stallStartTime) / 1000).toFixed(0);
          console.warn(`[${stream}] Stall detected (stuck ${stuckFor}s at ${t.toFixed(1)}s), reconnecting`);
          stallCount = 0;
          setState('connecting');
          scheduleReconnect();
        }
      } else {
        stallCount = 0;
      }
      lastTime = t;
    }, 1000);

    // Tell worker the current playhead position so it can trim safely
    function sendCurrentTimeToWorker() {
      if (workerRef && !cancelled) {
        workerRef.postMessage({ type: 'currentTime', time: video.currentTime });
      }
    }

    // Dispatch to worker path (Chrome 107+) or main-thread fallback
    if (WORKER_MSE_SUPPORTED) {
      startWorker();
    } else {
      // Stagger starts so channels don't compete on initial mount
      const chNum = parseInt(stream.match(/\d/)?.[0] ?? '1', 10);
      const startDelayMs = Math.max(0, chNum - 1) * 250;
      startTimer = setTimeout(startMainThread, startDelayMs);
    }

    return () => {
      cancelled = true;
      if (workerRef) { workerRef.postMessage({ type: 'stop' }); workerRef.terminate(); workerRef = null; }
      if (abortCtrl) abortCtrl.abort();
      clearTimeout(startTimer);
      clearTimeout(reconnectTimer);
      clearInterval(watchdog);
      video.playbackRate = 1.0;
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('error', onError);
      video.pause();
      if (WORKER_MSE_SUPPORTED) {
        try { (video as any).srcObject = null; } catch { /* ignore */ }
      } else {
        video.removeAttribute('src');
        if (objectUrl) URL.revokeObjectURL(objectUrl);
      }
      video.load();
    };
  }, [stream, retryKey, paused]); // eslint-disable-line react-hooks/exhaustive-deps

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
      {state === 'unsupported' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground gap-2">
          <VideoOff className="h-6 w-6" />
          <span className="text-xs">MSE not supported</span>
        </div>
      )}
    </div>
  );
}

// ─── HLS Feed (iOS WKWebView fallback) ───

/**
 * Live camera feed using HLS — for iOS WKWebView (HA companion app) where
 * MediaSource is unavailable. WKWebView handles HLS natively via <video src>.
 * Higher latency (~3-6s) than MSE but universally supported.
 */
function HLSFeed({ stream, paused }: { stream: string; paused?: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [state, setState] = useState<StreamState>('connecting');
  const retryCountRef = useRef(0);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (paused) {
      setState('connecting');
      return;
    }
    const video = videoRef.current!;

    let cancelled = false;
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;

    function scheduleReconnect() {
      if (cancelled) return;
      const base = Math.min(2000 * Math.pow(2, retryCountRef.current), 30000);
      retryCountRef.current++;
      reconnectTimer = setTimeout(() => {
        if (!cancelled) {
          setState('connecting');
          setRetryKey((k) => k + 1);
        }
      }, base);
    }

    async function start() {
      try {
        const url = getHlsUrl(stream);
        video.src = url;
        video.load();
        video.play().catch(() => {});
      } catch (err) {
        if (!cancelled) {
          console.error(`[${stream}] HLS error:`, err);
          scheduleReconnect();
        }
      }
    }

    const onPlaying = () => {
      if (!cancelled) {
        setState('playing');
        retryCountRef.current = 0;
      }
    };
    const onError = () => {
      if (!cancelled) {
        console.error(`[${stream}] HLS video error:`, video.error);
        setState('connecting');
        scheduleReconnect();
      }
    };
    const onLoadedData = () => {
      if (!cancelled) setState('playing');
    };

    video.addEventListener('playing', onPlaying);
    video.addEventListener('error', onError);
    video.addEventListener('loadeddata', onLoadedData);

    start();

    return () => {
      cancelled = true;
      clearTimeout(reconnectTimer);
      video!.removeEventListener('playing', onPlaying);
      video!.removeEventListener('error', onError);
      video!.removeEventListener('loadeddata', onLoadedData);
      video!.pause();
      video!.removeAttribute('src');
      video!.load();
    };
  }, [stream, retryKey, paused]);

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
  paused,
  onExpand,
  onCollapse,
}: {
  stream: string;
  label: string;
  lightEntityId: string;
  hidden: boolean;
  expanded: boolean;
  paused?: boolean;
  onExpand: () => void;
  onCollapse: () => void;
}) {
  // With MediaSource-in-Worker (Chrome 107+), all SourceBuffer work runs off the
  // main thread — 4×30fps HD grid is viable. Falls back to sub-stream if worker
  // MSE is unavailable (JS main-thread overhead cannot sustain 4×30fps).
  const activeStream = (WORKER_MSE_SUPPORTED || expanded) ? stream : `${stream}_sub`;

  return (
    <div
      className={`relative rounded-lg overflow-hidden bg-black border border-border cursor-pointer group ${
        hidden ? 'hidden' : ''
      }`}
      onClick={expanded ? onCollapse : onExpand}
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

      {HAS_MSE ? (
        <MSEFeed stream={activeStream} paused={paused} />
      ) : (
        <HLSFeed stream={activeStream} paused={paused} />
      )}
    </div>
  );
}

// ─── DVR Helpers ───

interface TimelineSegment {
  start: string;
  end: string;
  flags: string;
}

interface SavedClip {
  id: string;
  channel: number;
  name: string;
  start: string;
  end: string;
  created: number;
  status: 'exporting' | 'ready' | 'failed';
  file_size: number;
}

async function dvrFetch(path: string, init?: RequestInit) {
  const url = `${dvrApiBase()}${path}`;
  const headers = { ...await dvrAuthHeaders(), ...(init?.headers as Record<string, string> || {}) };
  const r = await fetch(url, { ...init, headers });
  if (!r.ok) throw new Error(`DVR proxy error: ${r.status}`);
  return r.json();
}

// ─── Playback Feed (via go2rtc) ───

/**
 * Build the playback stream URL — /api/playback/stream goes directly to the
 * ffmpeg process started by /api/playback/start (no go2rtc involvement for
 * playback).  On HTTPS the HA dvr-stream proxy routes it correctly.
 */
function getPlaybackStreamUrl(): string {
  if (IS_HTTPS) {
    const base = (window as unknown as Record<string, unknown>).__HA_BASE_URL__ || '';
    return `${base}/api/dvr-stream/playback/stream`;
  }
  return `${DVR_PROXY}/api/playback/stream`;
}

/**
 * Plays DVR recordings via go2rtc's fMP4 stream.
 *
 * Streams through HA's native go2rtc proxy (not dvr_proxy) for maximum
 * throughput. Data arrives ~1.8× faster than real-time (DVR sends as fast as
 * possible). Key optimizations:
 * - Batch-concatenate queued chunks → single appendBuffer call (reduces async overhead)
 * - Buffer 500ms of data before starting playback
 * - Trim only on QuotaExceededError or every 15s (minimize trim-related stalls)
 */
function PlaybackFeed({
  speed = 1,
  paused = false,
  onError,
}: {
  speed?: number;
  paused?: boolean;
  onError?: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [state, setState] = useState<StreamState>('connecting');
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;
  const rateHintRef = useRef(speed);

  // Pause/resume
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (paused) {
      video.pause();
    } else if (video.readyState >= 2) {
      video.play().catch(() => {});
    }
  }, [paused]);

  // Set initial playbackRate. The buffer monitor (inside the MSE effect)
  // adaptively adjusts this to prevent buffer underrun at >1x speeds.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = rateHintRef.current;
  }, [speed]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !MSEClass) return;

    let cancelled = false;
    let objectUrl: string | null = null;
    let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
    let trimInterval: ReturnType<typeof setInterval> | undefined;
    let stallWatchdog: ReturnType<typeof setInterval> | undefined;
    let bufferMonitor: ReturnType<typeof setInterval> | undefined;
    const abortCtrl = new AbortController();

    async function start() {
      if (!video || !MSEClass) return;
      try {
        // Fetch the ffmpeg fMP4 pipe from dvr_proxy.
        // Auth only needed on HTTPS (getMseFetchInit is a no-op on HTTP).
        const resp = await fetch(
          getPlaybackStreamUrl(),
          await getMseFetchInit(abortCtrl.signal),
        );
        if (cancelled) return;
        if (!resp.ok || !resp.body) {
          console.error('Playback stream:', resp.status);
          setState('error');
          onErrorRef.current?.();
          return;
        }

        // Server tells us the effective playback rate via X-Rate-Hint header.
        // When FMP4Rewriter is active (go2rtc + Scale path), rate hint = 1
        // because the DVR Scale already provides fast-forward speed and the
        // rewriter adjusts fragment durations accordingly.  For the ffmpeg
        // cache path, rate hint = speed (browser must play at Nx to achieve
        // the desired speed).  Falls back to speed if header is absent.
        const rateHint = parseFloat(resp.headers.get('X-Rate-Hint') || '') || speed;
        rateHintRef.current = rateHint;

        // Determine MSE codec — HA go2rtc proxy may strip codecs from Content-Type
        let mimeType = '';
        const ct = resp.headers.get('Content-Type') || '';
        if (ct) {
          const normalized = ct.split(';').map(s => s.trim()).join('; ');
          if (MSEClass.isTypeSupported(normalized)) mimeType = normalized;
        }
        if (!mimeType && MSEClass.isTypeSupported('video/mp4; codecs="avc1.640028"')) {
          mimeType = 'video/mp4; codecs="avc1.640028"';
        }
        if (!mimeType && MSEClass.isTypeSupported('video/mp4; codecs="hvc1"')) {
          mimeType = 'video/mp4; codecs="hvc1"';
        }
        if (!mimeType) {
          console.error('No supported MSE codec for playback');
          setState('error');
          onErrorRef.current?.();
          return;
        }

        // Create MediaSource
        const ms = new MSEClass();
        objectUrl = URL.createObjectURL(ms);
        video.src = objectUrl;

        await new Promise<void>((resolve) =>
          ms.addEventListener('sourceopen', () => resolve(), { once: true }),
        );
        if (cancelled) return;

        const sb = ms.addSourceBuffer(mimeType);
        // Always use 'segments' mode — fMP4 timestamps are authoritative.
        // For speed > 1, dvr_proxy rewrites timestamps to be evenly spaced
        // (2s per I-frame), matching the DVR's trick-play interval.
        reader = resp.body.getReader();

        // --- Batched buffer management ---
        // Key optimization: concatenate ALL queued chunks into one appendBuffer
        // call instead of appending one-by-one. This dramatically reduces async
        // overhead when data arrives faster than real-time (~50 fragments/sec).
        const queue: Uint8Array[] = [];
        let queueBytes = 0;
        let trimPending = false;

        function drainQueue() {
          if (sb.updating || ms.readyState !== 'open') return;

          if (queue.length > 0) {
            // Merge all queued chunks into a single buffer
            let merged: Uint8Array;
            if (queue.length === 1) {
              merged = queue[0];
            } else {
              merged = new Uint8Array(queueBytes);
              let offset = 0;
              for (const chunk of queue) {
                merged.set(chunk, offset);
                offset += chunk.byteLength;
              }
            }
            queue.length = 0;
            queueBytes = 0;
            try {
              sb.appendBuffer(merged.buffer as ArrayBuffer);
            } catch {
              // QuotaExceededError — force trim
              trimPending = true;
              // Re-queue the merged data so it's not lost
              queue.push(merged);
              queueBytes = merged.byteLength;
              if (!sb.updating) doTrim();
            }
            return;
          }

          if (trimPending) doTrim();
        }

        function doTrim() {
          if (sb.updating || ms.readyState !== 'open' || sb.buffered.length === 0) return;
          const bufStart = sb.buffered.start(0);
          const bufEnd = sb.buffered.end(sb.buffered.length - 1);
          // Keep enough buffer for flow control headroom (scales with speed)
          const keepAhead = Math.max(30, FC_PAUSE_AHEAD + 10);
          const trimThreshold = keepAhead + 60;
          if (bufEnd - bufStart > trimThreshold) {
            // Never trim past currentTime — keep at least 2s behind playhead
            // so the stall watchdog doesn't seek forward over unplayed content.
            const ct = video!.currentTime;
            const trimTo = Math.min(ct - 2, bufEnd - keepAhead);
            if (trimTo > bufStart) {
              try {
                sb.remove(bufStart, trimTo);
                trimPending = false;
              } catch { /* ignore */ }
            } else {
              trimPending = false;
            }
          } else {
            trimPending = false;
          }
        }

        sb.addEventListener('updateend', drainQueue);

        // Trim periodically (every 15s) — less aggressive than before
        trimInterval = setInterval(() => {
          if (cancelled) return;
          if (sb.buffered.length > 0) {
            const keepAhead = Math.max(30, FC_PAUSE_AHEAD + 10);
            const range = sb.buffered.end(sb.buffered.length - 1) - sb.buffered.start(0);
            if (range > keepAhead + 60) {
              trimPending = true;
              drainQueue();
            }
          }
        }, 15000);

        // --- Stall watchdog (gentle — avoids aggressive seeking) ---
        let lastTime = -1;
        let stallCount = 0;
        let noGrowthCount = 0;
        let lastBufEnd = -1;

        stallWatchdog = setInterval(() => {
          if (cancelled || !video || video.paused) return;
          if (sb.buffered.length === 0) return;

          const ct = video.currentTime;
          const bufStart = sb.buffered.start(0);
          const bufEnd = sb.buffered.end(sb.buffered.length - 1);

          // DVR recordings have non-zero timestamps — if currentTime is before
          // the buffer, seek to buffer start immediately
          if (ct < bufStart - 0.5) {
            console.log(`[playback] ct ${ct.toFixed(1)}s < buf start ${bufStart.toFixed(1)}s, seeking to buffer start`);
            video.currentTime = bufStart + 0.5;
            video.play().catch(() => {});
            lastTime = bufStart + 0.5;
            stallCount = 0;
            return;
          }

          // Track buffer growth independently
          if (lastBufEnd >= 0 && Math.abs(bufEnd - lastBufEnd) < 0.1) {
            noGrowthCount++;
          } else {
            noGrowthCount = 0;
          }
          lastBufEnd = bufEnd;

          // Stall detection: currentTime not advancing
          if (lastTime >= 0 && Math.abs(ct - lastTime) < 0.1 && ct > 0) {
            stallCount++;
            const ahead = bufEnd - ct;

            if (stallCount <= 3) {
              // First 9s — just nudge play(), don't seek (avoids non-keyframe seeks)
              console.log(`[playback] Stall #${stallCount} at ${ct.toFixed(1)}s (${ahead.toFixed(1)}s ahead), nudging play`);
              video.play().catch(() => {});
            } else if (ahead > 1) {
              // After 9s with data ahead — try one bigger seek to find a keyframe
              const seekTo = Math.min(ct + 5.0, bufEnd - 0.5);
              console.warn(`[playback] Stall #${stallCount} at ${ct.toFixed(1)}s, seeking to ${seekTo.toFixed(1)}s (buf end: ${bufEnd.toFixed(1)}s)`);
              video.currentTime = seekTo;
              video.play().catch(() => {});
              stallCount = 0;
            }

            // If buffer stopped growing for 30s, stream is dead
            if (noGrowthCount >= 10) {
              console.warn(`[playback] No buffer growth for ${noGrowthCount * 3}s. Triggering error.`);
              noGrowthCount = 0;
              stallCount = 0;
              onErrorRef.current?.();
              return;
            }
          } else {
            stallCount = 0;
          }
          lastTime = ct;
        }, 3000);

        // --- Buffer monitor for accelerated playback ---
        // Proportional controller: smoothly adjusts playbackRate based on
        // buffer health.  Uses rateHint (1.0 for go2rtc Scale path, speed
        // for ffmpeg cache) as the center point.  With rate hint = 1.0, a
        // 2-second buffer gives 2 WALL-SECONDS of headroom (vs 0.13s when
        // rate was speed=16) — virtually eliminates stall-burst cycling.
        if (speed > 1) {
          const targetRate = rateHintRef.current;
          let smoothRate = targetRate;
          bufferMonitor = setInterval(() => {
            if (cancelled || !video || video.paused) return;
            if (sb.buffered.length === 0 || ms.readyState !== 'open') return;
            const ahead = sb.buffered.end(sb.buffered.length - 1) - video.currentTime;
            const TARGET_AHEAD = 2.0;  // media-seconds target buffer
            const error = ahead - TARGET_AHEAD;
            // Gain: gentle adjustments around the target rate
            const rawRate = targetRate + error * 0.15;
            // Clamp: floor at targetRate×0.5, cap at max(targetRate×2, speed/2)
            // to handle DVR delivery rates that outpace the base target rate.
            const maxRate = Math.max(targetRate * 2.0, speed / 2);
            const clampedRate = Math.max(targetRate * 0.5, Math.min(maxRate, rawRate));
            // EMA smoothing to avoid jitter
            smoothRate = smoothRate * 0.7 + clampedRate * 0.3;
            if (Math.abs(video.playbackRate - smoothRate) > 0.02) {
              video.playbackRate = Math.round(smoothRate * 100) / 100;
            }
          }, 500);
        }

        // Pump fetch stream → SourceBuffer (with initial buffering)
        let started = false;
        let initialBytes = 0;
        // DVR delivers main stream at ~2x real-time for all speeds (~80 KB/s).
        // Use 100KB initial buffer for smooth startup.
        const INITIAL_BUFFER_BYTES = 100_000;

        // Flow control: pause reading when buffer is far ahead of playhead.
        // This creates TCP backpressure back to the server, naturally throttling
        // data delivery regardless of content bitrate (VBR-safe).
        // Thresholds scale with speed so they represent ~constant wall-time:
        //   speed=1 → pause@8,  resume@4  (8/4 wall-seconds)
        //   speed=2 → pause@16, resume@8  (8/4 wall-seconds)
        //   speed=8 → pause@64, resume@32 (8/4 wall-seconds)
        const effectiveRate = rateHintRef.current;
        const FC_PAUSE_AHEAD = 8 * Math.max(1, effectiveRate);   // ~8 wall-seconds
        const FC_RESUME_AHEAD = 4 * Math.max(1, effectiveRate);  // ~4 wall-seconds

        while (!cancelled) {
          // Flow control check — wait if buffer is too far ahead
          if (started && sb.buffered.length > 0 && ms.readyState === 'open') {
            const ahead = sb.buffered.end(sb.buffered.length - 1) - video.currentTime;
            if (ahead > FC_PAUSE_AHEAD) {
              await new Promise<void>(resolve => {
                const check = setInterval(() => {
                  if (cancelled || sb.buffered.length === 0 || ms.readyState !== 'open') {
                    clearInterval(check); resolve(); return;
                  }
                  const a = sb.buffered.end(sb.buffered.length - 1) - video.currentTime;
                  if (a < FC_RESUME_AHEAD) { clearInterval(check); resolve(); }
                }, 200);
              });
              if (cancelled) break;
            }
          }

          const { done, value } = await reader.read();
          if (done || !value) break;
          if (ms.readyState !== 'open') break;

          if (sb.updating || queue.length > 0) {
            queue.push(value);
            queueBytes += value.byteLength;
          } else {
            try {
              sb.appendBuffer(value.buffer as ArrayBuffer);
            } catch {
              queue.push(value);
              queueBytes += value.byteLength;
            }
          }

          // Buffer some data before starting playback to avoid immediate stall.
          // Two triggers: (1) enough bytes + decoded buffer ready, or
          // (2) generous byte threshold (fallback — stall watchdog will seek later).
          if (!started) {
            initialBytes += value.byteLength;
            const bufReady = sb.buffered.length > 0;
            if ((initialBytes >= INITIAL_BUFFER_BYTES && bufReady) || initialBytes >= 50_000) {
              started = true;
              if (bufReady) {
                const bufStart = sb.buffered.start(0);
                // Seek slightly past bufStart to land within the first keyframe.
                const seekOffset = 0.1;
                console.log(`[playback] Starting: bufStart=${bufStart.toFixed(1)}s, ${initialBytes} bytes, speed=${speed}x`);
                video.currentTime = bufStart + seekOffset;
              } else {
                console.log(`[playback] Starting (no buffer yet): ${initialBytes} bytes, speed=${speed}x — watchdog will seek`);
              }
              video.playbackRate = rateHintRef.current;
              video.play().catch(() => {});
            }
          }
        }

        // End of stream
        if (!cancelled && ms.readyState === 'open') {
          // Drain remaining queue before ending
          if (queue.length > 0) {
            const merged = new Uint8Array(queueBytes);
            let offset = 0;
            for (const chunk of queue) {
              merged.set(chunk, offset);
              offset += chunk.byteLength;
            }
            queue.length = 0;
            queueBytes = 0;
            try {
              sb.appendBuffer(merged.buffer as ArrayBuffer);
              await new Promise<void>(r => sb.addEventListener('updateend', () => r(), { once: true }));
            } catch { /* ignore */ }
          }
          try { ms.endOfStream(); } catch { /* ignore */ }
        }
      } catch (err) {
        if (!cancelled) {
          // AbortError = component unmounted or speed changed — not an error.
          if (err instanceof DOMException && err.name === 'AbortError') return;
          console.error('Playback MSE error:', err);
          setState('error');
          onErrorRef.current?.();
        }
      }
    }

    const onPlaying = () => { if (!cancelled) setState('playing'); };
    let decodeErrorCount = 0;
    const onVideoError = () => {
      if (cancelled) return;
      const err = video.error;
      console.error(`[playback] Video error: code=${err?.code} msg="${err?.message}"`);

      // MEDIA_ERR_DECODE (3) — try to recover by seeking past the corrupt section.
      // After a decode error, the video element may still be usable if we can
      // find a good keyframe ahead.
      if (err?.code === 3 && decodeErrorCount < 5) {
        decodeErrorCount++;
        if (video.buffered.length > 0) {
          const bufEnd = video.buffered.end(video.buffered.length - 1);
          if (bufEnd > video.currentTime + 1) {
            const seekTo = Math.min(video.currentTime + 3, bufEnd - 0.5);
            console.log(`[playback] Recovering from decode error #${decodeErrorCount}: seeking to ${seekTo.toFixed(1)}s`);
            video.currentTime = seekTo;
            video.play().catch(() => {});
            return;
          }
        }
        console.log(`[playback] Decode error #${decodeErrorCount} but no buffer ahead — stopping`);
      }

      setState('error');
      onErrorRef.current?.();
    };

    video.addEventListener('playing', onPlaying);
    video.addEventListener('error', onVideoError);

    start();

    return () => {
      cancelled = true;
      abortCtrl.abort();
      clearInterval(trimInterval);
      clearInterval(stallWatchdog);
      clearInterval(bufferMonitor);
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('error', onVideoError);
      reader?.cancel().catch(() => {});
      video.pause();
      video.removeAttribute('src');
      video.load();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          className="absolute text-[9px] text-white/50 -bottom-4"
          style={{ left: `${(h / 24) * 100}%`, transform: 'translateX(-50%)' }}
        >
          {h === 0 ? '12a' : h < 12 ? `${h}a` : h === 12 ? '12p' : `${h - 12}p`}
        </span>,
      );
    }
    return labels;
  }, []);

  return (
    <div className="relative px-1 pt-1 pb-5">
      <div
        ref={barRef}
        className="relative w-full h-5 bg-white/15 rounded cursor-pointer border border-white/20 overflow-hidden"
        onClick={handleClick}
      >
        {/* Recording segments */}
        {segments.map((seg, i) => {
          const left = Math.max(0, toPercent(seg.start));
          const right = Math.min(100, toPercent(seg.end));
          return (
            <div
              key={i}
              className="absolute top-0 bottom-0 bg-blue-400/50"
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
  return <PlaybackModeInner />;
}

// ─── Saved Clips List ───

function ClipsList({ clips, onRefresh }: { clips: SavedClip[]; onRefresh: () => void }) {
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      const url = `${dvrApiBase()}/clips/${id}`;
      const headers = await dvrAuthHeaders();
      const r = await fetch(url, { method: 'DELETE', headers });
      if (!r.ok) throw new Error(`Delete failed: ${r.status}`);
      onRefresh();
    } catch (err) {
      console.error('Delete clip error:', err);
    } finally {
      setDeleting(null);
    }
  };

  const handleDownload = (id: string, name: string) => {
    const url = `${dvrApiBase()}/clips/${id}/download`;
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name}.mp4`;
    a.click();
  };

  const fmtSize = (bytes: number) => {
    if (!bytes) return '';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (clips.length === 0) {
    return (
      <div className="text-center text-muted-foreground text-sm py-6">
        No saved clips yet. Use the <Scissors className="inline h-3.5 w-3.5 mx-0.5" /> button during playback to save a clip.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {clips.map((clip) => (
        <div
          key={clip.id}
          className="flex items-center gap-3 p-2.5 rounded-lg bg-card border border-border"
        >
          {/* Thumbnail */}
          <div className="w-16 h-10 rounded bg-muted flex-shrink-0 overflow-hidden">
            {clip.status === 'ready' ? (
              <img
                src={`${dvrApiBase()}/clips/${clip.id}/thumb`}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                {clip.status === 'exporting' ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                ) : (
                  <X className="h-4 w-4 text-red-400" />
                )}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{clip.name}</div>
            <div className="text-xs text-muted-foreground">
              Ch {clip.channel} · {clip.start.slice(0, 10)} {clip.start.slice(11, 16)}–{clip.end.slice(11, 16)}
              {clip.file_size > 0 && ` · ${fmtSize(clip.file_size)}`}
            </div>
          </div>

          {/* Status / Actions */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {clip.status === 'exporting' && (
              <span className="text-[10px] text-yellow-400 font-medium">Exporting...</span>
            )}
            {clip.status === 'failed' && (
              <span className="text-[10px] text-red-400 font-medium">Failed</span>
            )}
            {clip.status === 'ready' && (
              <button
                onClick={() => handleDownload(clip.id, clip.name)}
                className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                title="Download"
              >
                <Download className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={() => handleDelete(clip.id)}
              disabled={deleting === clip.id}
              className="p-1.5 rounded-md hover:bg-red-500/20 text-muted-foreground hover:text-red-400 transition-colors disabled:opacity-50"
              title="Delete"
            >
              {deleting === clip.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function PlaybackModeInner() {
  const [channel, setChannel] = useState(1);
  const [date, setDate] = useState(() => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  });
  const [segments, setSegments] = useState<TimelineSegment[]>([]);
  const [selectedTime, setSelectedTime] = useState('');
  const [playbackKey, setPlaybackKey] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [paused, setPaused] = useState(false);
  const [dateRange, setDateRange] = useState<{ min: string; max: string } | null>(null);
  // Source type: "cache" (speed controls available) or "dvr" (1x only)
  const [source, setSource] = useState<'cache' | 'dvr' | null>(null);
  // Cache download progress when source is "dvr"
  const [cacheProgress, setCacheProgress] = useState<{ segs_done: number; segs_total: number } | null>(null);
  // Track pending resume state for channel switches
  const pendingResumeRef = useRef<{ time: string; wasPlaying: boolean } | null>(null);
  // Track the start/end times for cache polling
  const playbackRangeRef = useRef<{ channel: number; start: string; end: string } | null>(null);

  // Clips state
  const [clips, setClips] = useState<SavedClip[]>([]);
  const [showClips, setShowClips] = useState(false);
  const [savingClip, setSavingClip] = useState(false);
  const [clipSaved, setClipSaved] = useState(false);

  // Fetch clips
  const fetchClips = useCallback(async () => {
    try {
      const data = await dvrFetch('/clips');
      setClips(data.clips || []);
    } catch { /* ignore */ }
  }, []);

  // Load clips on mount, poll while any are exporting
  useEffect(() => {
    fetchClips();
  }, [fetchClips]);

  useEffect(() => {
    const hasExporting = clips.some((c) => c.status === 'exporting');
    if (!hasExporting) return;
    const iv = setInterval(fetchClips, 3000);
    return () => clearInterval(iv);
  }, [clips, fetchClips]);

  // Save current playback position as a 30s clip
  const saveClip = async () => {
    if (!selectedTime || !playbackKey) return;
    setSavingClip(true);
    try {
      const startDate = new Date(selectedTime.replace(' ', 'T'));
      const endDate = new Date(startDate.getTime() + 30_000);
      const pad = (n: number) => String(n).padStart(2, '0');
      const endStr = `${date} ${pad(endDate.getHours())}:${pad(endDate.getMinutes())}:${pad(endDate.getSeconds())}`;
      const chLabel = CAMERAS.find((c) => c.channel === channel)?.label ?? `Ch${channel}`;
      const name = `${chLabel} ${selectedTime.slice(11, 19)}`;
      await dvrFetch('/clips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel, startTime: selectedTime, endTime: endStr, name }),
      });
      setClipSaved(true);
      setTimeout(() => setClipSaved(false), 2000);
      fetchClips();
    } catch (err) {
      console.error('Save clip error:', err);
    } finally {
      setSavingClip(false);
    }
  };

  // Find extended end time by walking contiguous segments forward from the
  // segment containing the given time.  Falls back to +30min if no match.
  const findExtendedEndTime = (segs: TimelineSegment[], timeStr: string): string => {
    const ms = new Date(timeStr.replace(' ', 'T')).getTime();
    let endTime = '';
    let matchIdx = -1;
    for (let i = 0; i < segs.length; i++) {
      const segStart = new Date(segs[i].start.replace(' ', 'T')).getTime();
      const segEnd = new Date(segs[i].end.replace(' ', 'T')).getTime();
      if (ms >= segStart && ms < segEnd) {
        matchIdx = i;
        endTime = segs[i].end;
        break;
      }
    }
    if (matchIdx >= 0) {
      for (let i = matchIdx + 1; i < segs.length; i++) {
        const prevEnd = new Date(endTime.replace(' ', 'T')).getTime();
        const nextStart = new Date(segs[i].start.replace(' ', 'T')).getTime();
        if (nextStart - prevEnd <= 5000) {
          endTime = segs[i].end;
        } else {
          break;
        }
      }
    }
    if (!endTime) {
      const end = new Date(ms + 30 * 60000);
      const pad = (n: number) => String(n).padStart(2, '0');
      endTime = `${timeStr.slice(0, 10)} ${pad(end.getHours())}:${pad(end.getMinutes())}:${pad(end.getSeconds())}`;
    }
    return endTime;
  };

  // Fetch date range on mount
  useEffect(() => {
    dvrFetch(`/date-range?channel=${channel}`).then((r) => {
      if (r.min_date && r.max_date) {
        setDateRange({
          min: r.min_date.slice(0, 10),
          max: r.max_date.slice(0, 10),
        });
      }
    }).catch(() => {});
  }, [channel]);

  // Fetch timeline when date or channel changes — auto-play at resumed time or first segment
  useEffect(() => {
    const resume = pendingResumeRef.current;
    pendingResumeRef.current = null;

    setSegments([]);
    setPlaybackKey(null);
    setSource(null);
    setCacheProgress(null);
    playbackRangeRef.current = null;
    setLoading(true);
    dvrFetch(`/timeline?channel=${channel}&date=${date}`).then(async (r) => {
      const segs: TimelineSegment[] = r.segments || [];
      setSegments(segs);
      if (segs.length) {
        // Use resumed time if available (channel switch), otherwise first segment.
        // If the resumed time falls outside this channel's recording range, fall
        // back to the last available segment (e.g., switching from a camera
        // recording at 9am to one that stopped at 6:20am).
        let startTime = resume?.time ?? segs[0].start;
        if (resume?.time) {
          const resumeMs = new Date(resume.time.replace(' ', 'T')).getTime();
          const inRange = segs.some(seg => {
            const s = new Date(seg.start.replace(' ', 'T')).getTime();
            const e = new Date(seg.end.replace(' ', 'T')).getTime();
            return resumeMs >= s && resumeMs < e;
          });
          if (!inRange) {
            // Resumed time not available on this channel — use last segment
            startTime = segs[segs.length - 1].start;
          }
        }
        setSelectedTime(startTime);

        // Auto-start if resuming from playing state, or on initial load
        if (!resume || resume.wasPlaying) {
          const endTime = findExtendedEndTime(segs, startTime);
          try {
            const resp = await dvrFetch('/playback/start', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ channel, startTime, endTime, speed }),
            });
            const src = resp.source as 'cache' | 'dvr' | undefined;
            setSource(src ?? 'cache');
            if (src === 'dvr') {
              setSpeed(1);
            }
            playbackRangeRef.current = { channel, start: startTime, end: endTime };
            setPlaybackKey(Date.now());
          } catch (err) {
            console.error('Auto-playback start error:', err);
          }
        }
      }
      setLoading(false);
    }).catch(() => { setLoading(false); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    setSource(null);
    setCacheProgress(null);

    // Find end time: walk contiguous segments forward from the one containing
    // playTime.  This ensures playback doesn't stop after just a few seconds
    // when the selected time is near the end of a 30-minute DVR segment.
    let endTime = findExtendedEndTime(segments, playTime);

    try {
      const resp = await dvrFetch('/playback/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel, startTime: playTime, endTime, speed: playSpeed }),
      });
      const src = resp.source as 'cache' | 'dvr' | undefined;
      setSource(src ?? 'cache');
      // If DVR source, force speed to 1
      if (src === 'dvr') {
        setSpeed(1);
      }
      // Store range for cache polling
      playbackRangeRef.current = { channel, start: playTime, end: endTime };
      setPlaybackKey(Date.now());
    } catch (err) {
      console.error('Playback start error:', err);
    } finally {
      setLoading(false);
    }
  };

  const stopPlayback = () => {
    setPlaybackKey(null);
    setPaused(false);
    setSource(null);
    setCacheProgress(null);
    playbackRangeRef.current = null;
    dvrFetch('/playback/stop', { method: 'POST' }).catch(() => {});
  };

  // Poll cache download progress when playing from DVR.
  // Auto-restarts playback from cache when download completes.
  useEffect(() => {
    if (source !== 'dvr' || !playbackKey || !playbackRangeRef.current) return;
    const range = playbackRangeRef.current;
    let cancelled = false;

    const poll = async () => {
      while (!cancelled) {
        await new Promise(r => setTimeout(r, 2000));
        if (cancelled) break;
        try {
          const params = new URLSearchParams({
            channel: String(range.channel),
            start: range.start,
            end: range.end,
          });
          const data = await dvrFetch(`/cache/check?${params}`);
          if (cancelled) break;
          if (data.status === 'ready') {
            setCacheProgress({ segs_done: data.segs_total, segs_total: data.segs_total });
            // Cache is ready — restart from cache at current speed
            // Brief interruption but now with speed controls + HD quality.
            console.log('[playback] Cache ready, switching from DVR to cache');
            startPlayback(selectedTime || range.start);
            return;
          }
          if (data.status === 'downloading' || data.status === 'queued') {
            setCacheProgress({ segs_done: data.segs_done ?? 0, segs_total: data.segs_total ?? 0 });
          }
        } catch {
          // ignore poll errors
        }
      }
    };
    poll();
    return () => { cancelled = true; };
  }, [source, playbackKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // When timeline is clicked during playback, auto-restart at the new time
  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    if (playbackKey) {
      startPlayback(time);
    }
  };

  const handleSpeedChange = async (newSpeed: number) => {
    // DVR streams are always 1x — speed controls are disabled in the UI,
    // but guard here too.
    if (source === 'dvr') return;
    setSpeed(newSpeed);
    if (playbackKey) {
      // Update server-side ffmpeg for the new speed
      try {
        await dvrFetch('/playback/speed', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ speed: newSpeed }),
        });
      } catch (err) {
        console.error('Speed change error:', err);
      }
      // Restart feed to pick up new stream
      setPlaybackKey(Date.now());
    }
  };

  const channelLabel = CAMERAS.find((c) => c.channel === channel)?.label ?? `Ch ${channel}`;

  return (
    <>
    <div
      className="relative aspect-video rounded-lg overflow-hidden border border-border bg-black"
    >
      {/* Video layer — always present for stable layout */}
      {playbackKey ? (
        <PlaybackFeed
          key={playbackKey}
          speed={speed}
          paused={paused}
          onError={stopPlayback}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
          {loading ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="text-sm">Loading...</span>
            </>
          ) : segments.length === 0 ? (
            <span className="text-sm">No recordings for {date}</span>
          ) : (
            <>
              <Play className="h-8 w-8 opacity-40" />
              <span className="text-sm">Select a time on the timeline</span>
            </>
          )}
        </div>
      )}

      {/* Overlay controls — always visible */}
      <div className="absolute inset-0 flex flex-col justify-between">
        {/* Top bar: channel + date */}
        <div className="bg-gradient-to-b from-black/80 via-black/50 to-transparent px-3 py-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Channel selector */}
            <div className="flex gap-1">
              {CAMERAS.map((cam) => (
                <button
                  key={cam.channel}
                  data-testid={`camera-channel-${cam.label.toLowerCase()}`}
                  onClick={() => {
                    if (cam.channel === channel) return;
                    // Remember playback state for smart resume on new channel
                    if (playbackKey && selectedTime) {
                      pendingResumeRef.current = { time: selectedTime, wasPlaying: !paused };
                    }
                    setChannel(cam.channel);
                    setPlaybackKey(null);
                  }}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                    channel === cam.channel
                      ? 'bg-white/25 text-white'
                      : 'text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {cam.label}
                </button>
              ))}
            </div>

            {/* Date navigation */}
            <div className="flex items-center gap-1 ml-auto">
              <button onClick={prevDate} className="p-1 rounded-md hover:bg-white/10 text-white/80 transition-colors">
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
                className="bg-white/10 border border-white/20 rounded-md px-2 py-0.5 text-xs text-white [color-scheme:dark]"
              />
              <button onClick={nextDate} className="p-1 rounded-md hover:bg-white/10 text-white/80 transition-colors">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar: play controls + timeline */}
        <div className="bg-gradient-to-t from-black/80 via-black/50 to-transparent px-3 pb-2.5 pt-6">
          {/* Play controls row */}
          <div className="flex items-center gap-2 mb-2">
            {/* Play/Pause button */}
            {playbackKey ? (
              <button
                data-testid="playback-pause"
                onClick={() => setPaused((p) => !p)}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
              >
                {paused ? <Play className="h-4 w-4 ml-0.5" /> : <Pause className="h-4 w-4" />}
              </button>
            ) : (
              <button
                data-testid="playback-play"
                onClick={() => startPlayback()}
                disabled={loading || !selectedTime}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors disabled:opacity-30"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 ml-0.5" />}
              </button>
            )}

            {/* Skip back 10s */}
            {playbackKey && (
              <button
                data-testid="playback-back10"
                onClick={() => { if (selectedTime) { const d = new Date(selectedTime.replace(' ', 'T')); d.setSeconds(d.getSeconds() - 10); const pad = (n: number) => String(n).padStart(2, '0'); const t = `${date} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`; startPlayback(t); } }}
                className="flex items-center justify-center w-7 h-7 rounded-full bg-white/15 hover:bg-white/25 text-white/80 transition-colors"
                title="Back 10s"
              >
                <Undo2 className="h-3.5 w-3.5" />
              </button>
            )}

            {/* Skip forward 10s */}
            {playbackKey && (
              <button
                data-testid="playback-fwd10"
                onClick={() => { if (selectedTime) { const d = new Date(selectedTime.replace(' ', 'T')); d.setSeconds(d.getSeconds() + 10); const pad = (n: number) => String(n).padStart(2, '0'); const t = `${date} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`; startPlayback(t); } }}
                className="flex items-center justify-center w-7 h-7 rounded-full bg-white/15 hover:bg-white/25 text-white/80 transition-colors"
                title="Forward 10s"
              >
                <Redo2 className="h-3.5 w-3.5" />
              </button>
            )}

            {/* Stop button (when playing) */}
            {playbackKey && (
              <button
                data-testid="playback-stop"
                onClick={stopPlayback}
                className="px-2 py-1 rounded text-xs font-medium text-red-400 bg-red-500/20 hover:bg-red-500/30 transition-colors"
              >
                Stop
              </button>
            )}

            {/* Save clip button (when playing) */}
            {playbackKey && (
              <button
                onClick={saveClip}
                disabled={savingClip}
                className={`flex items-center justify-center w-7 h-7 rounded-full transition-colors ${
                  clipSaved
                    ? 'bg-green-500/30 text-green-400'
                    : 'bg-white/15 hover:bg-white/25 text-white/80'
                }`}
                title="Save 30s clip"
              >
                {savingClip ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : clipSaved ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Scissors className="h-3.5 w-3.5" />
                )}
              </button>
            )}

            {/* Time display */}
            {selectedTime && (
              <span className="text-xs text-white/70">
                {channelLabel} · {selectedTime.slice(11)}
              </span>
            )}

            {/* Speed selector — disabled for DVR streams (always 1x) */}
            <div className="flex items-center gap-0.5 ml-auto">
              {source === 'dvr' ? (
                <>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-white/25 text-white">
                    1x
                  </span>
                  {cacheProgress && cacheProgress.segs_total > 0 && (
                    <span className="text-[10px] text-amber-400/80 ml-1 flex items-center gap-1">
                      <Loader2 className="h-2.5 w-2.5 animate-spin" />
                      {cacheProgress.segs_done}/{cacheProgress.segs_total}
                    </span>
                  )}
                </>
              ) : (
                [1, 2, 4, 8, 16].map((s) => (
                  <button
                    key={s}
                    data-testid={`playback-speed-${s}x`}
                    onClick={() => handleSpeedChange(s)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors ${
                      speed === s
                        ? 'bg-white/25 text-white'
                        : 'text-white/50 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {s}x
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Timeline */}
          {segments.length > 0 && (
            <TimelineBar
              segments={segments}
              date={date}
              selectedTime={selectedTime}
              onSelectTime={handleTimeSelect}
            />
          )}
        </div>
      </div>
    </div>

    {/* Saved Clips section */}
    <div className="mt-3">
      <button
        onClick={() => setShowClips((v) => !v)}
        className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-2"
      >
        <Film className="h-4 w-4" />
        Saved Clips ({clips.length})
        <ChevronRight className={`h-3.5 w-3.5 transition-transform ${showClips ? 'rotate-90' : ''}`} />
      </button>
      {showClips && <ClipsList clips={clips} onRefresh={fetchClips} />}
    </div>
    </>
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
          data-testid="mode-live"
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
          data-testid="mode-playback"
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

        {mode === 'live' && (
          <div className="ml-auto text-xs text-muted-foreground">
            {expanded ? 'HD · 30fps' : WORKER_MSE_SUPPORTED ? 'HD · 30fps  |  4-up grid' : 'SD · 15fps  |  expand for HD'}
          </div>
        )}
      </div>

      {/* Live camera grid — always mounted, hidden when playback */}
      <div className={mode === 'live' ? '' : 'hidden'}>
        <div
          className={`grid gap-3 ${expanded ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}
          style={{
            minHeight: 'calc(100vh - 180px)',
            ...(expanded ? {} : {}),
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
                paused={mode === 'playback'}
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
