import { useState, useEffect, useRef, useCallback } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { useEntity } from '@/hooks/useEntity';
import { useHassStore } from '@/context/HomeAssistantContext';
import { Maximize2, VideoOff, Grid2x2, Loader2 } from 'lucide-react';

const CAMERAS = [
  { entityId: 'camera.channel_1', label: 'Channel 1' },
  { entityId: 'camera.channel_2', label: 'Channel 2' },
  { entityId: 'camera.channel_3', label: 'Channel 3' },
  { entityId: 'camera.channel_4', label: 'Channel 4' },
];

const ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
];

type StreamState = 'connecting' | 'playing' | 'error';

/**
 * WebRTC camera feed using HA's camera/webrtc/offer WebSocket API.
 * This triggers go2rtc's lazy stream registration — no manual setup needed.
 * go2rtc converts the DVR's RTSP stream to WebRTC for the browser.
 */
function WebRTCFeed({ entityId }: { entityId: string }) {
  const store = useHassStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const unsubRef = useRef<(() => void) | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const [state, setState] = useState<StreamState>('connecting');
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function connect() {
      const hass = store.hass;
      if (!hass) {
        setState('error');
        return;
      }

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
          if (s === 'connected') setState('playing');
          else if (s === 'failed' || s === 'closed') setState('error');
        };

        // Send browser ICE candidates to HA/go2rtc
        pc.onicecandidate = (event) => {
          if (event.candidate && sessionIdRef.current) {
            hass.connection
              .sendMessagePromise({
                type: 'camera/webrtc/candidate',
                entity_id: entityId,
                session_id: sessionIdRef.current,
                candidate: event.candidate.toJSON(),
              })
              .catch(() => {});
          }
        };

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        // Subscribe to WebRTC signaling via HA WebSocket
        const unsub = await hass.connection.subscribeMessage<any>(
          (msg) => {
            if (cancelled) return;
            if (msg.type === 'session') {
              sessionIdRef.current = msg.session_id;
            } else if (msg.type === 'answer') {
              pc.setRemoteDescription(
                new RTCSessionDescription({ type: 'answer', sdp: msg.answer }),
              );
            } else if (msg.type === 'candidate') {
              const c =
                typeof msg.candidate === 'string'
                  ? new RTCIceCandidate({ candidate: msg.candidate, sdpMid: '0' })
                  : new RTCIceCandidate(msg.candidate);
              pc.addIceCandidate(c).catch(() => {});
            } else if (msg.type === 'error') {
              console.error(`WebRTC error for ${entityId}:`, msg.message);
              setState('error');
            }
          },
          {
            type: 'camera/webrtc/offer',
            entity_id: entityId,
            offer: pc.localDescription!.sdp,
          },
        );
        unsubRef.current = unsub;
      } catch (err) {
        if (!cancelled) {
          console.error(`WebRTC connect failed for ${entityId}:`, err);
          setState('error');
        }
      }
    }

    connect();

    return () => {
      cancelled = true;
      unsubRef.current?.();
      unsubRef.current = null;
      pcRef.current?.close();
      pcRef.current = null;
      sessionIdRef.current = null;
    };
  }, [entityId, store, retryKey]);

  const retry = useCallback(() => {
    setState('connecting');
    setRetryKey((k) => k + 1);
  }, []);

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
          <button
            onClick={(e) => {
              e.stopPropagation();
              retry();
            }}
            className="text-xs px-3 py-1 rounded bg-white/10 hover:bg-white/20 transition-colors"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Single Camera Cell ───

function CameraCell({
  entityId,
  label,
  hidden,
  expanded,
  onExpand,
  onCollapse,
}: {
  entityId: string;
  label: string;
  hidden: boolean;
  expanded: boolean;
  onExpand: () => void;
  onCollapse: () => void;
}) {
  const entity = useEntity(entityId);
  const isUnavailable = !entity || entity.state === 'unavailable';

  return (
    <div
      className={`relative rounded-lg overflow-hidden bg-black border border-border cursor-pointer group ${
        hidden ? 'hidden' : ''
      }`}
      onClick={expanded ? undefined : onExpand}
    >
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-3 py-1.5 bg-gradient-to-b from-black/70 to-transparent">
        <span className={`text-white font-medium drop-shadow ${expanded ? '' : 'text-sm'}`}>
          {label}
        </span>
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

      {isUnavailable ? (
        <div className={`flex flex-col items-center justify-center h-full text-muted-foreground gap-2 ${
          expanded ? 'min-h-[400px]' : 'min-h-[180px]'
        }`}>
          <VideoOff className={expanded ? 'h-10 w-10' : 'h-8 w-8'} />
          <span className={expanded ? '' : 'text-sm'}>Camera unavailable</span>
        </div>
      ) : (
        <WebRTCFeed entityId={entityId} />
      )}
    </div>
  );
}

// ─── Page ───

export default function Cameras() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <PageContainer title="Cameras">
      <div
        className="grid gap-3"
        style={{
          minHeight: 'calc(100vh - 140px)',
          gridTemplateColumns: expanded ? '1fr' : 'repeat(2, 1fr)',
          gridTemplateRows: expanded ? '1fr' : 'repeat(2, 1fr)',
        }}
      >
        {CAMERAS.map((cam) => {
          const isExpanded = expanded === cam.entityId;
          const isHidden = expanded !== null && !isExpanded;

          return (
            <CameraCell
              key={cam.entityId}
              entityId={cam.entityId}
              label={cam.label}
              hidden={isHidden}
              expanded={isExpanded}
              onExpand={() => setExpanded(cam.entityId)}
              onCollapse={() => setExpanded(null)}
            />
          );
        })}
      </div>
    </PageContainer>
  );
}
