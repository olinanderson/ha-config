import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEntity } from '@/hooks/useEntity';
import {
  fetchFilteredGps,
  fetchNamedPlaces,
  fetchDataRange,
  createNamedPlace,
  deleteNamedPlace,
  mergeParkingSpots,
  placeForCoord,
  haversineM,
  polylineDistanceM,
  PLACE_CATEGORY_ICONS,
  PLACE_CATEGORIES,
  type Segment,
  type ParkingSpot,
  type NamedPlace,
} from '@/lib/vanlife-api';
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Plus,
  X,
  Loader2,
  Navigation,
  Wind,
} from 'lucide-react';
import { DatePicker } from '@/components/ui/date-picker';

/* ── Types ─────────────────────────────────────────────────────────── */

interface Travel {
  idx: number;
  depTs: number;
  arrTs: number;
  distanceM: number;
  geom: [number, number][];
  fromLabel: string;
  toLabel: string;
  parkDurationS: number; // destination parking duration
}

/* ── Helpers ────────────────────────────────────────────────────────── */

function fmtDuration(sec: number): string {
  if (sec <= 0) return '0m';
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h > 24) return `${Math.floor(h / 24)}d ${h % 24}h`;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function fmtDate(ts: number, tz?: string): string {
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  if (tz) opts.timeZone = tz;
  return new Date(ts).toLocaleDateString('en-US', opts);
}

function fmtTime(ts: number, tz?: string): string {
  const opts: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit', hour12: true };
  if (tz) opts.timeZone = tz;
  return new Date(ts).toLocaleTimeString('en-US', opts);
}

function dateToStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function strToDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function timeOpacity(t: number): number {
  return 0.2 + t * 0.8; // 20% → 100% linearly
}

function coordLabel(lat: number, lon: number, places: NamedPlace[]): string {
  const p = placeForCoord(lat, lon, places);
  return p ? p.name : `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
}

/* ── Component ─────────────────────────────────────────────────────── */

export default function VanlifeMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const routeLayer = useRef<L.LayerGroup | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // State
  const [dateMode, setDateMode] = useState<'daily' | 'weekly' | 'range'>('daily');
  const [startDate, setStartDate] = useState(dateToStr(new Date()));
  const [endDate, setEndDate] = useState(dateToStr(new Date()));
  const [minDate, setMinDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [travels, setTravels] = useState<Travel[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [windyView, setWindyView] = useState(false);

  // Close sidebar when opening Windy view for full-width map
  const toggleWindy = () => {
    if (!windyView) setSidebarOpen(false);
    setWindyView(v => !v);
  };
  const [places, setPlaces] = useState<NamedPlace[]>([]);
  const [routePlaceIds, setRoutePlaceIds] = useState<Set<string>>(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showPlaceForm, setShowPlaceForm] = useState(false);
  const [placeFormData, setPlaceFormData] = useState({
    name: '',
    category: 'other',
    radius_m: 200,
    lat: '',
    lon: '',
    notes: '',
  });

  // HA van location entities
  const vanTracker1 = useEntity('device_tracker.vanlife_tracker_van_location');
  const vanTracker2 = useEntity('device_tracker.starlink_device_location');
  const vanTracker3 = useEntity('device_tracker.filtered_starlink_location');

  const vanPos = useMemo((): [number, number] | null => {
    for (const e of [vanTracker1, vanTracker2, vanTracker3]) {
      const lat = e?.attributes?.latitude;
      const lon = e?.attributes?.longitude;
      if (lat != null && lon != null) return [Number(lat), Number(lon)];
    }
    return null;
  }, [vanTracker1, vanTracker2, vanTracker3]);

  // Refs for map objects that persist across renders
  const vanMarkerRef = useRef<L.Marker | null>(null);
  const placeMarkersRef = useRef<Map<string, L.Marker>>(new Map());
  const placeCirclesRef = useRef<Map<string, L.Circle>>(new Map());
  const highlightRef = useRef<L.LayerGroup | null>(null);
  const placesRef = useRef<NamedPlace[]>([]);
  placesRef.current = places;

  // Date range computation
  const dateRange = useMemo((): [Date, Date] => {
    const s = strToDate(startDate);
    const e = strToDate(endDate);
    // end is inclusive — add 1 day
    return [s, new Date(e.getTime() + 86400000)];
  }, [startDate, endDate]);

  /* ── Init map ────────────────────────────────────────────────────── */

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const startPos: [number, number] = vanPos ?? [39.5, -98.35];
    const startZoom = vanPos ? 13 : 4;

    const map = L.map(mapRef.current, { zoomControl: true }).setView(startPos, startZoom);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      maxZoom: 19,
    }).addTo(map);
    L.control.scale({ metric: true, imperial: true, maxWidth: 200 }).addTo(map);

    const rl = L.layerGroup().addTo(map);
    routeLayer.current = rl;
    mapInstance.current = map;

    // Recalc van/place grouping on zoom
    map.on('zoomend', () => updateVanPlaceGrouping(map));

    return () => {
      map.remove();
      mapInstance.current = null;
      routeLayer.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Invalidate map size when sidebar toggles so Leaflet fills the container
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;
    // Small delay so the DOM flex layout has finished reflowing
    const timer = setTimeout(() => map.invalidateSize(), 50);
    return () => clearTimeout(timer);
  }, [sidebarOpen]);

  // Invalidate map size when the browser tab/window regains visibility
  // (Leaflet loses its layout when the panel was hidden via display:none)
  useEffect(() => {
    const onVisible = () => {
      if (!document.hidden) {
        const map = mapInstance.current;
        if (map) setTimeout(() => map.invalidateSize(), 50);
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, []);

  /* ── Fetch data range ────────────────────────────────────────────── */

  useEffect(() => {
    fetchDataRange().then(d => {
      if (d) setMinDate(d.min_date);
    });
  }, []);

  /* ── Fetch places ────────────────────────────────────────────────── */

  const loadPlaces = useCallback(async () => {
    const p = await fetchNamedPlaces();
    setPlaces(p);
  }, []);

  useEffect(() => {
    loadPlaces();
  }, [loadPlaces]);

  /* ── Draw place markers (only route-relevant ones) ────────────────── */

  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    // Remove old markers
    placeMarkersRef.current.forEach(m => m.remove());
    placeMarkersRef.current.clear();
    placeCirclesRef.current.forEach(c => c.remove());
    placeCirclesRef.current.clear();

    // Only show places that are part of the current route
    const relevantPlaces = places.filter(p => routePlaceIds.has(p.id));

    relevantPlaces.forEach(place => {
      const icon = PLACE_CATEGORY_ICONS[place.category] || '📌';
      const divIcon = L.divIcon({
        html: `<div style="position:absolute;bottom:0;left:0;width:32px;transform:translateX(-50%);display:inline-flex;flex-direction:column;align-items:center;opacity:0.85;filter:drop-shadow(0 1px 3px rgba(0,0,0,0.25))">
          <div style="background:#7c3aed;color:white;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:16px;border:2px solid #6d28d9">${icon}</div>
          <div style="background:#7c3aed;color:white;border-radius:4px;padding:2px 6px;font-size:10px;font-weight:600;white-space:nowrap;margin-top:-1px">${place.name}</div>
        </div>`,
        className: '',
        iconSize: [0, 0],
        iconAnchor: [0, 0],
        popupAnchor: [0, -52],
      });

      const marker = L.marker([place.lat, place.lon], { icon: divIcon })
        .bindPopup(
          `<div style="font-size:13px;line-height:1.5">
            <b>${icon} ${place.name}</b><br>
            <span style="color:#777">${place.category} · ${place.radius_m}m radius</span>
            ${place.notes ? `<br><i style="color:#999">${place.notes}</i>` : ''}
          </div>`,
          { closeButton: false, maxWidth: 250 },
        )
        .addTo(map);

      // Show radius circle on popup open
      const circle = L.circle([place.lat, place.lon], {
        radius: place.radius_m,
        color: '#7c3aed',
        fillColor: '#7c3aed',
        fillOpacity: 0.08,
        weight: 2,
        dashArray: '6 4',
        interactive: false,
      });

      marker.on('popupopen', () => circle.addTo(map));
      marker.on('popupclose', () => circle.remove());

      placeMarkersRef.current.set(place.id, marker);
      placeCirclesRef.current.set(place.id, circle);
    });

    updateVanPlaceGrouping(map);
  }, [places, routePlaceIds]);

  /* ── Van marker ──────────────────────────────────────────────────── */

  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    if (vanMarkerRef.current) {
      vanMarkerRef.current.remove();
      vanMarkerRef.current = null;
    }

    if (!vanPos) return;

    const icon = L.divIcon({
      html: `<div style="position:absolute;bottom:0;left:0;width:36px;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;filter:drop-shadow(0 3px 6px rgba(0,0,0,0.4))">
        <div style="background:#e53935;color:white;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:20px;border:3px solid #b71c1c">🚐</div>
        <div style="background:#e53935;color:white;border-radius:4px;padding:2px 6px;font-size:10px;font-weight:700;white-space:nowrap;margin-top:1px">Van</div>
      </div>`,
      className: '',
      iconSize: [0, 0],
      iconAnchor: [0, 0],
      popupAnchor: [0, -54],
    });

    vanMarkerRef.current = L.marker(vanPos, { icon, zIndexOffset: 1000 })
      .bindPopup('<b>🚐 Van is here</b>')
      .addTo(map);

    updateVanPlaceGrouping(map);
  }, [vanPos]);

  /* ── Van/place grouping ──────────────────────────────────────────── */

  const vanGroupedRef = useRef<string | null>(null);

  function updateVanPlaceGrouping(map: L.Map) {
    const van = vanMarkerRef.current;
    if (!van) return;

    // Restore previously grouped place
    if (vanGroupedRef.current) {
      const prev = placesRef.current.find(p => p.id === vanGroupedRef.current);
      if (prev) rebuildPlaceIcon(prev, false);
      vanGroupedRef.current = null;
    }

    const vanPx = map.latLngToContainerPoint(van.getLatLng());
    let nearest: NamedPlace | null = null;
    let nearestDist = Infinity;

    for (const place of placesRef.current) {
      const m = placeMarkersRef.current.get(place.id);
      if (!m) continue;
      const px = map.latLngToContainerPoint([place.lat, place.lon]);
      const d = vanPx.distanceTo(px);
      if (d < nearestDist) {
        nearestDist = d;
        nearest = place;
      }
    }

    if (nearest && nearestDist < 60) {
      van.setOpacity(0);
      van.closePopup();
      const el = van.getElement();
      if (el) el.style.pointerEvents = 'none';
      vanGroupedRef.current = nearest.id;
      rebuildPlaceIcon(nearest, true);
    } else {
      van.setOpacity(1);
      const el = van.getElement();
      if (el) el.style.pointerEvents = '';
    }
  }

  function rebuildPlaceIcon(place: NamedPlace, showVanBadge: boolean) {
    const m = placeMarkersRef.current.get(place.id);
    if (!m) return;
    const icon = PLACE_CATEGORY_ICONS[place.category] || '📌';
    const badge = showVanBadge
      ? `<div style="position:absolute;top:-6px;right:-10px;background:#e53935;border-radius:50%;width:22px;height:22px;display:flex;align-items:center;justify-content:center;font-size:13px;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3);z-index:1">🚐</div>`
      : '';
    m.setIcon(
      L.divIcon({
        html: `<div style="position:absolute;bottom:0;left:0;width:32px;transform:translateX(-50%);display:inline-flex;flex-direction:column;align-items:center;opacity:0.85;filter:drop-shadow(0 1px 3px rgba(0,0,0,0.25))">
          ${badge}
          <div style="background:#7c3aed;color:white;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:16px;border:2px solid #6d28d9">${icon}</div>
          <div style="background:#7c3aed;color:white;border-radius:4px;padding:2px 6px;font-size:10px;font-weight:600;white-space:nowrap;margin-top:-1px">${place.name}</div>
        </div>`,
        className: '',
        iconSize: [0, 0],
        iconAnchor: [0, 0],
        popupAnchor: [0, -52],
      }),
    );
  }

  /* ── Load trips ──────────────────────────────────────────────────── */

  const loadTrips = useCallback(async () => {
    const map = mapInstance.current;
    const rl = routeLayer.current;
    if (!map || !rl) return;

    // Abort previous
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    rl.clearLayers();
    if (highlightRef.current) {
      highlightRef.current.remove();
      highlightRef.current = null;
    }
    setTravels([]);
    setSelectedIdx(null);
    setLoading(true);
    setStatus('Loading trips…');

    try {
      const [start, end] = dateRange;
      const data = await fetchFilteredGps(start, end, ac.signal);
      if (!data) {
        setStatus('No trips found');
        setRoutePlaceIds(new Set());
        setLoading(false);
        return;
      }

      const currentPlaces = placesRef.current;

      // Filter out tiny trips (< 300m displacement)
      const validSegs = data.segments.filter(s => {
        if (s.points.length < 2) return false;
        const first = s.points[0];
        const last = s.points[s.points.length - 1];
        return haversineM(first.lat, first.lon, last.lat, last.lon) > 300;
      });

      // Compute time gradient across all segments
      const allCoords: [number, number][] = [];
      const newTravels: Travel[] = [];

      // Merge parking spots
      const mergedParking = mergeParkingSpots(data.parking_spots);

      // Compute total distance across all segments for smooth opacity gradient
      const segGeoms: { si: number; geom: [number, number][] }[] = [];
      let totalDist = 0;

      validSegs.forEach((seg, si) => {
        const geom = seg.routed_geometry && seg.routed_geometry.length >= 2
          ? seg.routed_geometry
          : seg.points.map(p => [p.lat, p.lon] as [number, number]);

        const distM = seg.distance_m > 0 ? seg.distance_m : polylineDistanceM(geom);
        const depTs = seg.points[0].ts;
        const arrTs = seg.points[seg.points.length - 1].ts;

        // Find parking at destination
        const destPark = mergedParking.find(pk => pk.start_ts >= arrTs - 60000);
        const fromPark = mergedParking.filter(pk => pk.start_ts + pk.duration_s * 1000 <= depTs + 60000).pop();

        const fromLat = fromPark?.lat ?? seg.points[0].lat;
        const fromLon = fromPark?.lon ?? seg.points[0].lon;
        const toLat = destPark?.lat ?? seg.points[seg.points.length - 1].lat;
        const toLon = destPark?.lon ?? seg.points[seg.points.length - 1].lon;

        const travel: Travel = {
          idx: si,
          depTs,
          arrTs,
          distanceM: distM,
          geom,
          fromLabel: coordLabel(fromLat, fromLon, currentPlaces),
          toLabel: coordLabel(toLat, toLon, currentPlaces),
          parkDurationS: destPark?.duration_s ?? 0,
        };
        newTravels.push(travel);

        segGeoms.push({ si, geom });
        totalDist += distM;
        allCoords.push(...geom);
      });

      // Draw segments with smooth cumulative-distance opacity gradient
      // Each segment is split into overlapping chunks for gradual opacity transition
      let cumDist = 0;
      const STRIDE = 8;
      for (const { si, geom } of segGeoms) {
        const segDist = polylineDistanceM(geom);
        const segStartDist = cumDist;

        for (let i = 0; i < geom.length - 1; i += STRIDE) {
          // Overlap by 1 point to eliminate gaps between chunks
          const end = Math.min(i + STRIDE + 1, geom.length);
          const chunk = geom.slice(i, end);
          if (chunk.length < 2) continue;

          const midIdx = i + (end - i) / 2;
          const segFrac = midIdx / Math.max(1, geom.length - 1);
          const globalDist = segStartDist + segDist * segFrac;
          const t = totalDist > 0 ? globalDist / totalDist : 1;

          const pl = L.polyline(chunk, {
            color: '#3b82f6',
            weight: 5,
            opacity: timeOpacity(t),
            lineCap: 'butt',
            lineJoin: 'round',
          }).addTo(rl);

          pl.on('click', () => setSelectedIdx(prev => prev === si ? null : si));
        }

        cumDist += segDist;
      }

      // Draw parking dots
      mergedParking.forEach(pk => {
        allCoords.push([pk.lat, pk.lon]);
        const matchedPlace = placeForCoord(pk.lat, pk.lon, currentPlaces);
        if (matchedPlace) return; // skip dots inside named places
        const dur = pk.duration_s;
        const hh = Math.floor(dur / 3600);
        const mm = Math.floor((dur % 3600) / 60);
        const durStr = hh > 0 ? `${hh}h ${mm}m` : `${mm}m`;
        const timeStr = new Date(pk.start_ts * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        L.circleMarker([pk.lat, pk.lon], {
          radius: 5, color: '#6366f1', fillColor: '#6366f1',
          fillOpacity: 0.7, weight: 1,
        }).bindPopup(`<b>Parked ${durStr}</b><br/>${timeStr}<br/><small>${pk.lat.toFixed(5)}, ${pk.lon.toFixed(5)}</small>`)
          .addTo(rl);
      });

      setTravels(newTravels);

      // Determine which named places are relevant to this route
      const relevantIds = new Set<string>();
      const allRouteCoords = [
        ...mergedParking.map(pk => ({ lat: pk.lat, lon: pk.lon })),
        ...validSegs.flatMap(s => [
          { lat: s.points[0].lat, lon: s.points[0].lon },
          { lat: s.points[s.points.length - 1].lat, lon: s.points[s.points.length - 1].lon },
        ]),
      ];
      for (const place of currentPlaces) {
        for (const coord of allRouteCoords) {
          if (haversineM(coord.lat, coord.lon, place.lat, place.lon) <= place.radius_m) {
            relevantIds.add(place.id);
            break;
          }
        }
      }
      // Also include the place the van is currently at
      if (vanPos) {
        for (const place of currentPlaces) {
          if (haversineM(vanPos[0], vanPos[1], place.lat, place.lon) <= place.radius_m) {
            relevantIds.add(place.id);
          }
        }
      }
      setRoutePlaceIds(relevantIds);

      // Fit bounds
      if (allCoords.length > 1) {
        map.flyToBounds(L.latLngBounds(allCoords), {
          paddingTopLeft: [40, 40],
          paddingBottomRight: [sidebarOpen ? 320 : 40, 40],
          duration: 0.8,
        });
      }

      const totalDistKm = newTravels.reduce((s, t) => s + t.distanceM, 0) / 1000;
      setStatus(
        `${newTravels.length} trip${newTravels.length !== 1 ? 's' : ''} · ${totalDistKm.toFixed(1)} km · ${mergedParking.length} stop${mergedParking.length !== 1 ? 's' : ''}`,
      );
    } catch (e: any) {
      if (e.name === 'AbortError') return;
      console.error('[VanlifeMap] Load error:', e);
      setStatus('Failed to load trips');
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    loadTrips();
  }, [loadTrips]);

  /* ── Trip highlight ──────────────────────────────────────────────── */

  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    if (highlightRef.current) {
      highlightRef.current.remove();
      highlightRef.current = null;
    }

    if (selectedIdx == null) return;
    const travel = travels[selectedIdx];
    if (!travel?.geom) return;

    const hl = L.layerGroup().addTo(map);
    L.polyline(travel.geom, { color: '#000', weight: 10, opacity: 0.5, interactive: false }).addTo(hl);
    L.polyline(travel.geom, { color: '#00e5ff', weight: 6, opacity: 0.95, interactive: false }).addTo(hl);
    highlightRef.current = hl;

    map.flyToBounds(L.latLngBounds(travel.geom), {
      paddingTopLeft: [50, 50],
      paddingBottomRight: [sidebarOpen ? 320 : 50, 50],
      duration: 0.6,
    });
  }, [selectedIdx, travels]);

  /* ── Date navigation ─────────────────────────────────────────────── */

  const nudgeDate = (which: 'start' | 'end', delta: number) => {
    if (which === 'start') {
      const d = strToDate(startDate);
      d.setDate(d.getDate() + delta);
      const v = dateToStr(d);
      setStartDate(v);
      if (dateMode === 'daily') setEndDate(v);
      else if (v > endDate) setEndDate(v);
    } else {
      const d = strToDate(endDate);
      d.setDate(d.getDate() + delta);
      const v = dateToStr(d);
      setEndDate(v);
      if (v < startDate) setStartDate(v);
    }
  };

  const shiftWeek = (delta: number) => {
    const s = strToDate(startDate);
    const e = strToDate(endDate);
    s.setDate(s.getDate() + delta * 7);
    e.setDate(e.getDate() + delta * 7);
    setStartDate(dateToStr(s));
    setEndDate(dateToStr(e));
  };

  const selectMode = (mode: 'daily' | 'weekly' | 'range') => {
    setDateMode(mode);
    if (mode === 'daily') {
      setEndDate(startDate);
    } else if (mode === 'weekly') {
      const s = strToDate(startDate);
      s.setDate(s.getDate() + 6);
      setEndDate(dateToStr(s));
    }
    // range: keep current start/end
  };

  /* ── Place form ──────────────────────────────────────────────────── */

  const handleCreatePlace = async () => {
    const { name, category, radius_m, lat, lon, notes } = placeFormData;
    if (!name || !lat || !lon) return;
    await createNamedPlace(
      { name, category, radius_m, lat: Number(lat), lon: Number(lon), notes },
    );
    setShowPlaceForm(false);
    setPlaceFormData({ name: '', category: 'other', radius_m: 200, lat: '', lon: '', notes: '' });
    loadPlaces();
  };

  /* ── Center on van ───────────────────────────────────────────────── */

  const centerOnVan = () => {
    if (vanPos && mapInstance.current) {
      mapInstance.current.setView(vanPos, 15);
    }
  };

  /* ── Render ──────────────────────────────────────────────────────── */

  return (
    <div className="h-full flex flex-col relative" style={{ minHeight: 0 }}>
      {/* Top bar */}
      <div className="flex-none flex items-center gap-2 px-2 sm:px-3 py-2 border-b border-border bg-card/80 backdrop-blur-sm text-xs sm:text-sm z-[1002] relative overflow-x-auto">
        {/* Mode buttons */}
        {(['daily', 'weekly', 'range'] as const).map(mode => (
          <button
            key={mode}
            onClick={() => selectMode(mode)}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors capitalize ${
              dateMode === mode
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {mode}
          </button>
        ))}

        <div className="w-px h-5 bg-border" />

        {/* Daily: single date with arrows */}
        {dateMode === 'daily' && (
          <div className="flex items-center gap-1">
            <button onClick={() => nudgeDate('start', -1)} className="p-1 rounded hover:bg-muted">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <DatePicker
              value={startDate}
              onChange={v => { setStartDate(v); setEndDate(v); }}
              min={minDate ?? undefined}
              max={dateToStr(new Date())}
            />
            <button onClick={() => nudgeDate('start', 1)} className="p-1 rounded hover:bg-muted">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Weekly: two dates with single outer arrows to shift whole week */}
        {dateMode === 'weekly' && (
          <div className="flex items-center gap-1">
            <button onClick={() => shiftWeek(-1)} className="p-1 rounded hover:bg-muted" title="Previous week">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <DatePicker
              value={startDate}
              onChange={v => {
                setStartDate(v);
                const s = strToDate(v);
                s.setDate(s.getDate() + 6);
                setEndDate(dateToStr(s));
              }}
              min={minDate ?? undefined}
              max={dateToStr(new Date())}
            />
            <span className="text-muted-foreground px-0.5">–</span>
            <DatePicker
              value={endDate}
              onChange={v => {
                setEndDate(v);
                const e2 = strToDate(v);
                e2.setDate(e2.getDate() - 6);
                setStartDate(dateToStr(e2));
              }}
              min={startDate}
              max={dateToStr(new Date())}
            />
            <button onClick={() => shiftWeek(1)} className="p-1 rounded hover:bg-muted" title="Next week">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Range: two dates each with own arrows */}
        {dateMode === 'range' && (
          <div className="flex items-center gap-1">
            <button onClick={() => nudgeDate('start', -1)} className="p-1 rounded hover:bg-muted">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <DatePicker
              value={startDate}
              onChange={v => setStartDate(v)}
              min={minDate ?? undefined}
              max={endDate}
            />
            <button onClick={() => nudgeDate('start', 1)} className="p-1 rounded hover:bg-muted">
              <ChevronRight className="h-4 w-4" />
            </button>
            <span className="text-muted-foreground px-0.5">–</span>
            <button onClick={() => nudgeDate('end', -1)} className="p-1 rounded hover:bg-muted">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <DatePicker
              value={endDate}
              onChange={v => setEndDate(v)}
              min={startDate}
              max={dateToStr(new Date())}
            />
            <button onClick={() => nudgeDate('end', 1)} className="p-1 rounded hover:bg-muted">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="ml-auto flex items-center gap-2">
          {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          <span className="text-muted-foreground text-xs whitespace-nowrap">{status}</span>
          <div className="w-px h-5 bg-border" />
          {/* Windy toggle */}
          <button
            onClick={() => toggleWindy()}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              windyView ? 'bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-500/40' : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            <Wind className="h-3.5 w-3.5" />
            {windyView ? 'Map' : 'Windy'}
          </button>
        </div>
      </div>

      {/* Map + sidebar */}
      <div className="flex-1 flex relative" style={{ minHeight: 0 }}>
        {/* Windy overlay — full area when active */}
        {windyView && vanPos && (() => {
          // Build the windy-route.html URL with route data params
          const hass = (window as any).__HASS__;
          const hassUrl = hass?.auth?.data?.hassUrl || `${window.location.protocol}//${window.location.hostname}:8123`;
          const windyUrl = `${hassUrl}/local/react-dashboard/windy-route.html`
            + `?lat=${vanPos[0].toFixed(4)}&lon=${vanPos[1].toFixed(4)}`
            + `&zoom=8`;
          return (
            <div className="absolute inset-0 z-[600] flex flex-col bg-background">
              <iframe
                src={windyUrl}
                className="flex-1 border-0"
                title="Windy"
                allow="fullscreen"
              />
            </div>
          );
        })()}
        {/* Map container */}
        <div className="flex-1 relative" style={{ minHeight: 0 }}>
          <div ref={mapRef} className="absolute inset-0" />

          {/* Sidebar toggle (when closed) */}
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="absolute top-3 right-3 z-[500] bg-card border border-border rounded-md p-2 shadow-md hover:bg-muted"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}

          {/* Center on van FAB */}
          {vanPos && (
            <button
              onClick={centerOnVan}
              className="absolute bottom-14 left-4 z-[500] bg-card border border-border rounded-full p-2.5 shadow-md hover:bg-muted"
              title="Center on van"
            >
              <Navigation className="h-5 w-5 text-red-500" />
            </button>
          )}

          {/* Place creation form overlay */}
          {showPlaceForm && (
            <div className="absolute top-3 left-3 z-[9500] w-[300px] bg-card border-2 border-purple-500 rounded-lg shadow-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-purple-500" />
                  Add Named Place
                </span>
                <button onClick={() => setShowPlaceForm(false)} className="p-1 rounded hover:bg-muted">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <input
                placeholder="Name"
                value={placeFormData.name}
                onChange={e => setPlaceFormData(d => ({ ...d, name: e.target.value }))}
                className="w-full bg-muted rounded px-2.5 py-1.5 text-sm border-0"
              />
              <select
                value={placeFormData.category}
                onChange={e => setPlaceFormData(d => ({ ...d, category: e.target.value }))}
                className="w-full bg-muted rounded px-2.5 py-1.5 text-sm border-0"
              >
                {PLACE_CATEGORIES.map(c => (
                  <option key={c} value={c}>
                    {PLACE_CATEGORY_ICONS[c]} {c.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-2">
                <input
                  placeholder="Latitude"
                  type="number"
                  step="any"
                  value={placeFormData.lat}
                  onChange={e => setPlaceFormData(d => ({ ...d, lat: e.target.value }))}
                  className="bg-muted rounded px-2.5 py-1.5 text-sm border-0"
                />
                <input
                  placeholder="Longitude"
                  type="number"
                  step="any"
                  value={placeFormData.lon}
                  onChange={e => setPlaceFormData(d => ({ ...d, lon: e.target.value }))}
                  className="bg-muted rounded px-2.5 py-1.5 text-sm border-0"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">
                  Radius: {placeFormData.radius_m}m
                </label>
                <input
                  type="range"
                  min={50}
                  max={2000}
                  step={50}
                  value={placeFormData.radius_m}
                  onChange={e => setPlaceFormData(d => ({ ...d, radius_m: Number(e.target.value) }))}
                  className="w-full"
                />
              </div>
              <textarea
                placeholder="Notes (optional)"
                value={placeFormData.notes}
                onChange={e => setPlaceFormData(d => ({ ...d, notes: e.target.value }))}
                className="w-full bg-muted rounded px-2.5 py-1.5 text-sm border-0 resize-none"
                rows={2}
              />
              <button
                onClick={handleCreatePlace}
                disabled={!placeFormData.name || !placeFormData.lat || !placeFormData.lon}
                className="w-full bg-purple-600 text-white rounded py-1.5 text-sm font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Place
              </button>
            </div>
          )}
        </div>

        {/* Sidebar (always absolute overlay so map never resizes) */}
        {sidebarOpen && (
          <div className="absolute right-0 top-0 bottom-0 w-[280px] sm:w-[300px] border-l border-border bg-card flex flex-col z-[1001] shadow-xl">
            <div className="flex-none flex items-center justify-between px-3 py-2 border-b border-border overflow-visible">
              <span className="font-semibold text-sm">
                {travels.length} Trip{travels.length !== 1 ? 's' : ''}
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => setShowPlaceForm(true)}
                  className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-purple-600 text-white hover:bg-purple-700"
                >
                  <Plus className="h-3 w-3" /> Place
                </button>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1 rounded hover:bg-muted"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto" style={{ minHeight: 0 }}>
            {travels.length === 0 && !loading && (
              <div className="p-4 text-center text-muted-foreground text-sm">No trips in range</div>
            )}

            {travels.map((travel, ti) => {
              const isSelected = selectedIdx === travel.idx;
              const driveSec = (travel.arrTs - travel.depTs) / 1000;
              const distKm = travel.distanceM / 1000;
              // Show date header when day changes (multi-day ranges)
              const dayKey = new Date(travel.depTs).toDateString();
              const prevDayKey = ti > 0 ? new Date(travels[ti - 1].depTs).toDateString() : null;
              const showDayHeader = dayKey !== prevDayKey;

              return (
                <div key={travel.idx}>
                  {showDayHeader && (
                    <div className="px-3 py-1.5 bg-muted/50 border-b border-border text-xs font-semibold text-muted-foreground">
                      {new Date(travel.depTs).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </div>
                  )}
                  <div
                    onClick={() => setSelectedIdx(prev => (prev === travel.idx ? null : travel.idx))}
                    className={`px-3 py-2.5 cursor-pointer border-b border-border transition-colors ${isSelected ? 'bg-cyan-500/10' : 'hover:bg-muted/50'}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm truncate">
                        🚐 {travel.fromLabel} → {travel.toLabel}
                      </span>
                      <ChevronRight
                        className={`h-3.5 w-3.5 flex-none text-muted-foreground transition-transform ${isSelected ? 'rotate-90' : ''}`}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5 flex flex-wrap gap-x-2">
                      <span>{fmtTime(travel.depTs)}</span>
                      <span>🚗 {fmtDuration(driveSec)}</span>
                      <span>📏 {distKm.toFixed(1)} km</span>
                      {travel.parkDurationS > 0 && <span>🅿️ {fmtDuration(travel.parkDurationS)}</span>}
                    </div>

                  {isSelected && (
                    <div className="mt-2 space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Distance</span>
                        <span>{distKm.toFixed(1)} km</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Drive time</span>
                        <span>{fmtDuration(driveSec)}</span>
                      </div>
                      {distKm > 0 && driveSec > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Avg speed</span>
                          <span>{((distKm / driveSec) * 3600).toFixed(0)} km/h</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Departed</span>
                        <span>{fmtTime(travel.depTs)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Arrived</span>
                        <span>{fmtTime(travel.arrTs)}</span>
                      </div>
                    </div>
                  )}
                  </div>
                </div>
              );
            })}

            {travels.length > 0 && (
              <div className="px-3 py-2 text-center text-xs text-muted-foreground border-t border-border">
                📏 {(travels.reduce((s, t) => s + t.distanceM, 0) / 1000).toFixed(1)} km · 🚗{' '}
                {fmtDuration(travels.reduce((s, t) => s + (t.arrTs - t.depTs) / 1000, 0))} driving
              </div>
            )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
