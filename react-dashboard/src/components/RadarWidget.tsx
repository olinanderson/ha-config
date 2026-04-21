/**
 * RadarWidget — animated RainViewer radar widget + full map overlay
 * Default: shows current time, paused. Play button animates through frames.
 */
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CloudRain, X, Play, Pause, ChevronLeft, ChevronRight, ChevronUp } from 'lucide-react';
import L from 'leaflet';

interface RadarFrame {
  time: number;
  path: string;
}

// Shared hook — fetches frames once, refreshes every 10 min
function useRadarFrames() {
  const [frames, setFrames] = useState<RadarFrame[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const r = await fetch('https://api.rainviewer.com/public/weather-maps.json');
        const j = await r.json();
        const past: RadarFrame[] = (j.radar?.past ?? []).map((f: any) => ({ time: f.time, path: f.path }));
        const nowcast: RadarFrame[] = (j.radar?.nowcast ?? []).map((f: any) => ({ time: f.time, path: f.path }));
        setFrames([...past, ...nowcast]);
      } catch (_) {}
      setLoading(false);
    };
    load();
    const id = setInterval(load, 10 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  return { frames, loading };
}

function formatFrameTime(ts: number): string {
  return new Date(ts * 1000).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
}

function latestPastIdx(frames: RadarFrame[]): number {
  const now = Date.now() / 1000;
  let best = 0;
  for (let i = 0; i < frames.length; i++) {
    if (frames[i].time <= now) best = i;
  }
  return best;
}

// ─── Leaflet-based radar map (widget version) ───
// Uses a small embedded Leaflet map instead of canvas for correct projection

function RadarLeafletMap({ frame, lat, lon }: { frame: RadarFrame | null; lat: number; lon: number }) {
  const divRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const radarRef = useRef<L.TileLayer | null>(null);

  // Init map once
  useEffect(() => {
    if (!divRef.current || mapRef.current) return;
    const map = L.map(divRef.current, {
      zoomControl: false,
      attributionControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      touchZoom: false,
      keyboard: false,
    }).setView([lat, lon], 6);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
      maxZoom: 10,
    }).addTo(map);

    // Current location dot
    const icon = L.divIcon({
      html: `<div style="width:8px;height:8px;border-radius:50%;background:#22d3ee;border:2px solid #fff;box-shadow:0 0 4px #22d3ee"></div>`,
      className: '',
      iconSize: [8, 8],
      iconAnchor: [4, 4],
    });
    L.marker([lat, lon], { icon }).addTo(map);

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []); // intentionally no deps — init once

  // Update radar layer when frame changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !frame) return;
    if (radarRef.current) {
      map.removeLayer(radarRef.current);
      radarRef.current = null;
    }
    const layer = L.tileLayer(
      `https://tilecache.rainviewer.com${frame.path}/256/{z}/{x}/{y}/2/1_1.png`,
      { opacity: 0.75, maxZoom: 10 }
    );
    layer.addTo(map);
    radarRef.current = layer;
  }, [frame]);

  return <div ref={divRef} className="h-full w-full" />;
}

// ─── Full Radar Overlay (for map tab) ───

export function RadarMapOverlay({
  onClose,
  leafletMap,
}: {
  lat: number;
  lon: number;
  onClose: () => void;
  leafletMap?: L.Map;
}) {
  const { frames, loading } = useRadarFrames();
  const [frameIdx, setFrameIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const radarLayerRef = useRef<L.TileLayer | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Start at latest past frame
  useEffect(() => {
    if (frames.length === 0) return;
    setFrameIdx(latestPastIdx(frames));
  }, [frames.length]);

  // Update Leaflet radar layer when frame changes
  useEffect(() => {
    if (!leafletMap || frames.length === 0) return;
    if (radarLayerRef.current) {
      leafletMap.removeLayer(radarLayerRef.current);
      radarLayerRef.current = null;
    }
    const frame = frames[frameIdx];
    const layer = L.tileLayer(
      `https://tilecache.rainviewer.com${frame.path}/256/{z}/{x}/{y}/2/1_1.png`,
      { opacity: 0.7, attribution: 'RainViewer' }
    );
    layer.addTo(leafletMap);
    radarLayerRef.current = layer;
    return () => {
      if (radarLayerRef.current && leafletMap) {
        leafletMap.removeLayer(radarLayerRef.current);
        radarLayerRef.current = null;
      }
    };
  }, [frameIdx, frames, leafletMap]);

  // Cleanup layer on unmount
  useEffect(() => {
    return () => {
      if (radarLayerRef.current && leafletMap) {
        leafletMap.removeLayer(radarLayerRef.current);
        radarLayerRef.current = null;
      }
    };
  }, [leafletMap]);

  // Auto-play
  useEffect(() => {
    if (!playing || frames.length === 0) return;
    intervalRef.current = setInterval(() => {
      setFrameIdx((i) => {
        const next = i + 1;
        if (next >= frames.length) { setPlaying(false); return i; }
        return next;
      });
    }, 600);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [playing, frames.length]);

  const now = Date.now() / 1000;
  const isNowcast = (frames[frameIdx]?.time ?? 0) > now;

  return (
    <div className="absolute bottom-16 left-0 right-0 z-40 px-3 pb-2">
      <div className="bg-card/95 backdrop-blur border border-border rounded-xl p-3 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <CloudRain className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-medium">Radar</span>
            {isNowcast && (
              <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded font-medium">NOWCAST</span>
            )}
          </div>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-white/10"><X className="h-4 w-4" /></button>
        </div>

        {loading && <div className="text-xs text-muted-foreground text-center py-2">Loading radar…</div>}

        {frames.length > 0 && (
          <>
            <div className="flex items-center gap-2 mb-2">
              <button onClick={() => { setPlaying(false); setFrameIdx(i => Math.max(0, i - 1)); }} className="p-1 rounded hover:bg-white/10">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="flex-1 flex gap-0.5">
                {frames.map((f, i) => {
                  const isPast = f.time <= now;
                  return (
                    <button key={i} onClick={() => { setPlaying(false); setFrameIdx(i); }}
                      className={`h-2 flex-1 rounded-sm transition-colors ${
                        i === frameIdx ? 'bg-blue-400'
                          : isPast ? 'bg-white/30 hover:bg-white/50'
                          : 'bg-blue-400/30 hover:bg-blue-400/50'
                      }`}
                    />
                  );
                })}
              </div>
              <button onClick={() => { setPlaying(false); setFrameIdx(i => Math.min(frames.length - 1, i + 1)); }} className="p-1 rounded hover:bg-white/10">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className={isNowcast ? 'text-blue-400 font-medium' : ''}>
                {frames[frameIdx] ? formatFrameTime(frames[frameIdx].time) : ''}
              </span>
              <button
                onClick={() => {
                  if (!playing && frameIdx >= frames.length - 1) setFrameIdx(latestPastIdx(frames));
                  setPlaying(p => !p);
                }}
                className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-white/10"
              >
                {playing ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                {playing ? 'Pause' : 'Play'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Compact Widget ───

export function RadarWidget({ lat, lon, onOpenMap }: { lat: number | undefined; lon: number | undefined; onOpenMap?: () => void }) {
  const { frames, loading } = useRadarFrames();
  const [frameIdx, setFrameIdx] = useState(0);
  const [playing, setPlaying] = useState(false); // start paused at current time
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Set to latest past frame when frames load
  useEffect(() => {
    if (frames.length === 0) return;
    setFrameIdx(latestPastIdx(frames));
  }, [frames.length]);

  // Auto-play: stop at end instead of looping (prevents the reset jank)
  useEffect(() => {
    if (!playing || frames.length === 0) return;
    intervalRef.current = setInterval(() => {
      setFrameIdx((i) => {
        const pastCount = frames.filter(f => f.time <= Date.now() / 1000).length;
        const next = i + 1;
        if (next >= pastCount) { setPlaying(false); return i; } // stop at end
        return next;
      });
    }, 700);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [playing, frames]);

  if (!lat || !lon) return null;
  const now = Date.now() / 1000;
  const currentFrame = frames[frameIdx] ?? null;
  const pastFrames = frames.filter(f => f.time <= now);

  return (
    <Card>
      <CardHeader className="pb-1 pt-3 px-4">
        <CardTitle className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1.5">
            <CloudRain className="h-3.5 w-3.5 text-blue-400" />
            Radar
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (!playing && frameIdx >= pastFrames.length - 1) setFrameIdx(0);
                setPlaying(p => !p);
              }}
              className="p-0.5 rounded hover:bg-white/10 text-muted-foreground"
            >
              {playing ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            </button>
            {onOpenMap && (
              <button onClick={onOpenMap} className="p-0.5 rounded hover:bg-white/10 text-muted-foreground" title="Open on map">
                <ChevronUp className="h-3 w-3" />
              </button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-3">
        {loading && <div className="text-xs text-muted-foreground">Loading…</div>}
        {!loading && (
          <div className="space-y-2">
            {/* Leaflet map instead of canvas — correct tile projection */}
            <div className="w-full h-52 rounded-lg overflow-hidden bg-black/30">
              <RadarLeafletMap frame={currentFrame} lat={lat} lon={lon} />
            </div>
            {currentFrame && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="w-16 shrink-0">{formatFrameTime(currentFrame.time)}</span>
                <div className="flex gap-0.5 flex-1">
                  {pastFrames.map((_, i) => (
                    <button key={i} onClick={() => { setPlaying(false); setFrameIdx(i); }}
                      className={`h-1.5 flex-1 rounded-sm ${i === frameIdx ? 'bg-blue-400' : 'bg-white/20 hover:bg-white/40'}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
