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
          if (edge - video.currentTime > 1.5) {
            video.currentTime = Math.max(0, edge - 1.0);
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

    // Live edge maintenance + stall watchdog (every 3s)
    //
    // Strategy: use playbackRate to *drift* toward live rather than hard-seeking.
    // A hard seek causes a visible frame jump; playbackRate=1.05 catches up at
    // ~0.15s per wall-second (lag 2s → live in ~13s) with no perceptible stutter.
    // Audio is muted so pitch shift is irrelevant.
    //
    // Only hard-seek when severely behind (>6s) — e.g. after a stall recovery.
    //
    // Hysteresis band (1–2.5s): no rate change to avoid flip-flopping.
    let lastTime = -1;
    let stallCount = 0;
    let stallStartTime = 0;
    const watchdog = setInterval(() => {
      if (cancelled || reconnecting) return;
      sendCurrentTimeToWorker();

      if (video.buffered.length > 0) {
        const edge = video.buffered.end(video.buffered.length - 1);
        const lag = edge - video.currentTime;

        if (lag > 6) {
          // Way behind — hard seek (stall recovery, very rare with 0 drops)
          video.currentTime = Math.max(0, edge - 1.5);
          video.playbackRate = 1.0;
        } else if (lag > 2.5) {
          // Behind — gradual catch-up at 1.05× (muted, no audio pitch issue)
          if (video.playbackRate !== 1.05) video.playbackRate = 1.05;
        } else if (lag < 1.0) {
          // At live edge — back to normal
          if (video.playbackRate !== 1.0) video.playbackRate = 1.0;
        }
        // 1–2.5s band: hold current rate (hysteresis)
      }

      // Stall detection — more patient when remote (4 checks = 12s vs 3 = 9s)
      const stallThreshold = IS_LOCAL ? 3 : 4;
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
    }, 3000);

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

async function dvrFetch(path: string, init?: RequestInit) {
  const url = `${dvrApiBase()}${path}`;
  const headers = { ...await dvrAuthHeaders(), ...(init?.headers as Record<string, string> || {}) };
  const r = await fetch(url, { ...init, headers });
  if (!r.ok) throw new Error(`DVR proxy error: ${r.status}`);
  return r.json();
}

// ─── Playback Feed (via go2rtc) ───

/**
 * Build the playback stream URL — dvr_proxy's ffmpeg pipe endpoint.
 * go2rtc is not involved; _proxy_mp4_stream() pipes ffmpeg stdout directly.
 * The RTSP Scale proxy (port 8767) handles server-side speed control.
 */
function getPlaybackStreamUrl(): string {
  if (IS_HTTPS) {
    const base = (window as unknown as Record<string, unknown>).__HA_BASE_URL__ as string || '';
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

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !MSEClass) return;

    let cancelled = false;
    let objectUrl: string | null = null;
    let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
    let trimInterval: ReturnType<typeof setInterval> | undefined;
    let stallWatchdog: ReturnType<typeof setInterval> | undefined;
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
        // Sequence mode handles timestamp discontinuities from DVR playback
        try { sb.mode = 'sequence'; } catch { /* some browsers don't allow changing mode */ }
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
          if (bufEnd - bufStart > 90) {
            try {
              sb.remove(bufStart, bufEnd - 30);
              trimPending = false;
            } catch { /* ignore */ }
          } else {
            trimPending = false;
          }
        }

        sb.addEventListener('updateend', drainQueue);

        // Trim periodically (every 15s) — less aggressive than before
        trimInterval = setInterval(() => {
          if (cancelled) return;
          if (sb.buffered.length > 0) {
            const range = sb.buffered.end(sb.buffered.length - 1) - sb.buffered.start(0);
            if (range > 90) {
              trimPending = true;
              drainQueue();
            }
          }
        }, 15000);

        // --- Stall watchdog ---
        let lastTime = 0;
        let stallCount = 0;

        stallWatchdog = setInterval(() => {
          if (cancelled || !video || video.paused) return;
          if (sb.buffered.length === 0) return;

          const ct = video.currentTime;

          // Stall detection: currentTime not advancing for 2 checks (~6s)
          if (Math.abs(ct - lastTime) < 0.1 && ct > 0) {
            stallCount++;
            if (stallCount >= 2) {
              const bufEnd = sb.buffered.end(sb.buffered.length - 1);
              if (bufEnd > ct + 0.5) {
                console.warn(`[playback] Stall at ${ct.toFixed(1)}s, seeking to ${(ct + 0.5).toFixed(1)}s (buf end: ${bufEnd.toFixed(1)}s)`);
                video.currentTime = ct + 0.5;
                video.play().catch(() => {});
              }
              stallCount = 0;
            }
          } else {
            stallCount = 0;
          }
          lastTime = ct;
        }, 3000);

        // Pump fetch stream → SourceBuffer (with initial buffering)
        let started = false;
        let initialBytes = 0;
        const INITIAL_BUFFER_BYTES = 100_000; // ~0.6s of video at 155 KB/s

        while (!cancelled) {
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

          // Buffer some data before starting playback to avoid immediate stall
          if (!started) {
            initialBytes += value.byteLength;
            if (initialBytes >= INITIAL_BUFFER_BYTES) {
              started = true;
              video.playbackRate = speed;
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
    const onVideoError = () => {
      if (!cancelled) {
        console.error('Playback video error:', video.error);
        setState('error');
        onErrorRef.current?.();
      }
    };

    video.addEventListener('playing', onPlaying);
    video.addEventListener('error', onVideoError);

    start();

    return () => {
      cancelled = true;
      abortCtrl.abort();
      clearInterval(trimInterval);
      clearInterval(stallWatchdog);
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
  const [showControls, setShowControls] = useState(true);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Track pending resume state for channel switches
  const pendingResumeRef = useRef<{ time: string; wasPlaying: boolean } | null>(null);

  // Auto-hide controls after 3s of inactivity (only when playing & not paused)
  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    clearTimeout(hideTimerRef.current);
    // Only auto-hide when actively playing
    if (playbackKey && !paused) {
      hideTimerRef.current = setTimeout(() => setShowControls(false), 3000);
    }
  }, [playbackKey, paused]);

  // Show controls when paused, stopped, or loading
  useEffect(() => {
    if (!playbackKey || paused || loading) {
      setShowControls(true);
      clearTimeout(hideTimerRef.current);
    } else {
      resetControlsTimer();
    }
  }, [playbackKey, paused, loading, resetControlsTimer]);

  // Cleanup timer on unmount
  useEffect(() => () => clearTimeout(hideTimerRef.current), []);

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
    setLoading(true);
    dvrFetch(`/timeline?channel=${channel}&date=${date}`).then(async (r) => {
      const segs: TimelineSegment[] = r.segments || [];
      setSegments(segs);
      if (segs.length) {
        // Use resumed time if available (channel switch), otherwise first segment
        const startTime = resume?.time ?? segs[0].start;
        setSelectedTime(startTime);

        // Auto-start if resuming from playing state, or on initial load
        if (!resume || resume.wasPlaying) {
          const selMs = new Date(startTime.replace(' ', 'T')).getTime();
          let endTime = '';
          for (const seg of segs) {
            const segStart = new Date(seg.start.replace(' ', 'T')).getTime();
            const segEnd = new Date(seg.end.replace(' ', 'T')).getTime();
            if (selMs >= segStart && selMs < segEnd) {
              endTime = seg.end;
              break;
            }
          }
          if (!endTime) {
            // Default to end of first segment or +30min
            if (segs[0].end) {
              endTime = segs[0].end;
            } else {
              const end = new Date(selMs + 30 * 60000);
              const pad = (n: number) => String(n).padStart(2, '0');
              endTime = `${date} ${pad(end.getHours())}:${pad(end.getMinutes())}:${pad(end.getSeconds())}`;
            }
          }
          try {
            await dvrFetch('/playback/start', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ channel, startTime, endTime, speed }),
            });
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
      await dvrFetch('/playback/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel, startTime: playTime, endTime, speed: playSpeed }),
      });
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
    dvrFetch('/playback/stop', { method: 'POST' }).catch(() => {});
  };

  // When timeline is clicked during playback, auto-restart at the new time
  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    if (playbackKey) {
      startPlayback(time);
    }
  };

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
    // If playing, restart at current position with new speed (DVR needs server-side speed)
    if (playbackKey && selectedTime) {
      startPlayback(selectedTime, newSpeed);
    }
  };

  const channelLabel = CAMERAS.find((c) => c.channel === channel)?.label ?? `Ch ${channel}`;

  return (
    <div
      className="relative aspect-video rounded-lg overflow-hidden border border-border bg-black"
      onMouseMove={resetControlsTimer}
      onTouchStart={resetControlsTimer}
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

      {/* Overlay controls — auto-hide when watching, always visible when paused/stopped */}
      <div
        className={`absolute inset-0 flex flex-col justify-between transition-opacity duration-500 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={(e) => {
          // Clicking the video area (not a control) toggles controls
          if (e.target === e.currentTarget) {
            if (showControls && playbackKey && !paused) {
              setShowControls(false);
              clearTimeout(hideTimerRef.current);
            } else {
              resetControlsTimer();
            }
          }
        }}
      >
        {/* Top bar: channel + date */}
        <div className="bg-gradient-to-b from-black/80 via-black/50 to-transparent px-3 py-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Channel selector */}
            <div className="flex gap-1">
              {CAMERAS.map((cam) => (
                <button
                  key={cam.channel}
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
                onClick={() => setPaused((p) => !p)}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
              >
                {paused ? <Play className="h-4 w-4 ml-0.5" /> : <Pause className="h-4 w-4" />}
              </button>
            ) : (
              <button
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
                onClick={stopPlayback}
                className="px-2 py-1 rounded text-xs font-medium text-red-400 bg-red-500/20 hover:bg-red-500/30 transition-colors"
              >
                Stop
              </button>
            )}

            {/* Time display */}
            {selectedTime && (
              <span className="text-xs text-white/70">
                {channelLabel} · {selectedTime.slice(11)}
              </span>
            )}

            {/* Speed selector */}
            <div className="flex items-center gap-0.5 ml-auto">
              {[1, 2, 4, 8].map((s) => (
                <button
                  key={s}
                  onClick={() => handleSpeedChange(s)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors ${
                    speed === s
                      ? 'bg-white/25 text-white'
                      : 'text-white/50 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {s}x
                </button>
              ))}
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

        {/* Grid = SD sub-stream (15fps), expanded single camera = HD main (30fps) — automatic */}
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
                paused={mode === 'playback' || (isHidden && !WORKER_MSE_SUPPORTED)}
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
