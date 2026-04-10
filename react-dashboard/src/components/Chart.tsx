import { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import type { HistoryPoint } from '@/hooks/useHistory';
import { cn } from '@/lib/utils';

// ─── Sparkline (tiny inline chart) ───

interface SparklineProps {
  data: HistoryPoint[];
  width?: number;
  height?: number;
  color?: string;
  className?: string;
  onClick?: () => void;
}

export function Sparkline({
  data,
  width = 80,
  height = 24,
  color = 'currentColor',
  className,
  onClick,
}: SparklineProps) {
  const path = useMemo(() => {
    if (data.length < 2) return '';
    const minT = data[0].t;
    const maxT = data[data.length - 1].t;
    const rangeT = maxT - minT || 1;
    let minV = Infinity;
    let maxV = -Infinity;
    for (const p of data) {
      if (p.v < minV) minV = p.v;
      if (p.v > maxV) maxV = p.v;
    }
    const rangeV = maxV - minV || 1;
    const pad = 1;
    const w = width - pad * 2;
    const h = height - pad * 2;

    return data
      .map((p, i) => {
        const x = pad + ((p.t - minT) / rangeT) * w;
        const y = pad + h - ((p.v - minV) / rangeV) * h;
        return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  }, [data, width, height]);

  if (data.length < 2) return null;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn('shrink-0', onClick && 'cursor-pointer hover:opacity-80', className)}
      onClick={onClick}
    >
      <path d={path} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" />
    </svg>
  );
}

// ─── Full chart (for the dialog) ───

interface ChartProps {
  data: HistoryPoint[];
  width?: number;
  height?: number;
  color?: string;
  unit?: string;
}

function formatTime(ms: number): string {
  const d = new Date(ms);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(ms: number): string {
  const d = new Date(ms);
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function niceStep(range: number, ticks: number): number {
  const rough = range / ticks;
  const mag = Math.pow(10, Math.floor(Math.log10(rough)));
  const residual = rough / mag;
  if (residual <= 1.5) return mag;
  if (residual <= 3) return 2 * mag;
  if (residual <= 7) return 5 * mag;
  return 10 * mag;
}

export function HistoryChart({ data, width = 600, height = 250, color = '#3b82f6', unit = '' }: ChartProps) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [viewRange, setViewRange] = useState<[number, number] | null>(null);
  const [showSmooth, setShowSmooth] = useState(false);

  // Drag-to-pan refs (mouse + touch)
  const isDragging = useRef(false);
  const hasDragged = useRef(false);
  const dragStartX = useRef(0);
  const dragStartRange = useRef<[number, number] | null>(null);

  // Touch pinch-to-zoom refs
  const pinchStartDist = useRef(0);
  const pinchStartRange = useRef<[number, number] | null>(null);
  const pinchStartMidFrac = useRef(0.5);
  const isTouchPanning = useRef(false);

  // Ref for stable native event handlers (avoids re-attaching on every state change)
  const stateRef = useRef({ data, viewRange, width });
  stateRef.current = { data, viewRange, width };

  // Reset zoom when data changes (e.g. time range button)
  const dataId = data.length > 0 ? `${data[0].t}-${data[data.length - 1].t}` : '';
  const prevDataId = useRef(dataId);
  if (dataId !== prevDataId.current) {
    prevDataId.current = dataId;
    if (viewRange) setViewRange(null);
  }

  // Filter data to view range
  const visibleData = useMemo(() => {
    if (!viewRange || data.length < 2) return data;
    const [lo, hi] = viewRange;
    return data.filter((p) => p.t >= lo && p.t <= hi);
  }, [data, viewRange]);

  // Smoothed data (moving average)
  const smoothedData = useMemo(() => {
    if (visibleData.length < 5) return visibleData;
    const windowSize = Math.max(3, Math.floor(visibleData.length / 40));
    const half = Math.floor(windowSize / 2);
    const result: HistoryPoint[] = [];
    for (let i = 0; i < visibleData.length; i++) {
      const lo = Math.max(0, i - half);
      const hi = Math.min(visibleData.length - 1, i + half);
      let sum = 0;
      for (let j = lo; j <= hi; j++) sum += visibleData[j].v;
      result.push({ t: visibleData[i].t, v: sum / (hi - lo + 1) });
    }
    return result;
  }, [visibleData]);

  // Native event handlers (passive: false) for wheel + touch
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const MARGIN = { left: 48, right: 12 };

    // Helper: get SVG-space x from client x
    const toSvgX = (clientX: number) => {
      const rect = svg.getBoundingClientRect();
      return (clientX - rect.left) * (stateRef.current.width / rect.width);
    };

    // Helper: px fraction within chart area
    const pxFrac = (svgX: number) => {
      const w = stateRef.current.width;
      return Math.max(0, Math.min(1, (svgX - MARGIN.left) / (w - MARGIN.left - MARGIN.right)));
    };

    // Helper: apply zoom centered on a fraction
    const applyZoom = (zoomFactor: number, frac: number) => {
      const { data, viewRange, width } = stateRef.current;
      if (data.length < 2) return;
      const fullMinT = data[0].t;
      const fullMaxT = data[data.length - 1].t;
      const curMin = viewRange ? viewRange[0] : fullMinT;
      const curMax = viewRange ? viewRange[1] : fullMaxT;
      const curRange = curMax - curMin;

      const newRange = curRange * zoomFactor;
      const minRange = (fullMaxT - fullMinT) * 0.005;
      if (newRange < minRange) return;
      if (newRange >= (fullMaxT - fullMinT)) { setViewRange(null); return; }

      const pivot = curMin + frac * curRange;
      let newMin = pivot - frac * newRange;
      let newMax = pivot + (1 - frac) * newRange;
      if (newMin < fullMinT) { newMax += fullMinT - newMin; newMin = fullMinT; }
      if (newMax > fullMaxT) { newMin -= newMax - fullMaxT; newMax = fullMaxT; }
      newMin = Math.max(newMin, fullMinT);
      newMax = Math.min(newMax, fullMaxT);
      setViewRange([newMin, newMax]);
    };

    // Helper: apply pan by delta in SVG px
    const applyPan = (startRange: [number, number], deltaSvgPx: number) => {
      const { data, width } = stateRef.current;
      if (data.length < 2) return;
      const chartW = width - MARGIN.left - MARGIN.right;
      const [startMin, startMax] = startRange;
      const timeRange = startMax - startMin;
      const deltaTime = -(deltaSvgPx / chartW) * timeRange;

      const fullMinT = data[0].t;
      const fullMaxT = data[data.length - 1].t;
      let newMin = startMin + deltaTime;
      let newMax = startMax + deltaTime;
      if (newMin < fullMinT) { newMax += fullMinT - newMin; newMin = fullMinT; }
      if (newMax > fullMaxT) { newMin -= newMax - fullMaxT; newMax = fullMaxT; }
      newMin = Math.max(newMin, fullMinT);
      newMax = Math.min(newMax, fullMaxT);
      setViewRange([newMin, newMax]);
    };

    // ─── Wheel zoom ───
    const wheelHandler = (e: WheelEvent) => {
      const { data } = stateRef.current;
      if (data.length < 2) return;
      e.preventDefault();
      const frac = pxFrac(toSvgX(e.clientX));
      const zoomFactor = e.deltaY > 0 ? 1.3 : 1 / 1.3;
      applyZoom(zoomFactor, frac);
    };

    // ─── Touch: pinch-to-zoom + single-finger pan ───
    const touchDist = (t: TouchList) => {
      if (t.length < 2) return 0;
      const dx = t[1].clientX - t[0].clientX;
      const dy = t[1].clientY - t[0].clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const touchStartHandler = (e: TouchEvent) => {
      const { data, viewRange } = stateRef.current;
      if (data.length < 2) return;
      const fullMinT = data[0].t;
      const fullMaxT = data[data.length - 1].t;

      if (e.touches.length === 2) {
        // Pinch start
        e.preventDefault();
        pinchStartDist.current = touchDist(e.touches);
        pinchStartRange.current = viewRange ?? [fullMinT, fullMaxT];
        const midClientX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        pinchStartMidFrac.current = pxFrac(toSvgX(midClientX));
        isTouchPanning.current = false;
      } else if (e.touches.length === 1) {
        // Single finger — start pan (only works when zoomed)
        e.preventDefault();
        isTouchPanning.current = true;
        isDragging.current = true;
        hasDragged.current = false;
        dragStartX.current = toSvgX(e.touches[0].clientX);
        dragStartRange.current = viewRange ?? [fullMinT, fullMaxT];
      }
    };

    const touchMoveHandler = (e: TouchEvent) => {
      const { data } = stateRef.current;
      if (data.length < 2) return;

      if (e.touches.length === 2 && pinchStartRange.current) {
        // Pinch zoom
        e.preventDefault();
        const newDist = touchDist(e.touches);
        if (pinchStartDist.current === 0) return;
        // dist increase → zoom in (smaller range), dist decrease → zoom out
        const scale = pinchStartDist.current / newDist;
        const [startMin, startMax] = pinchStartRange.current;
        const startRange = startMax - startMin;
        const fullMinT = data[0].t;
        const fullMaxT = data[data.length - 1].t;

        const newRange = startRange * scale;
        const minRange = (fullMaxT - fullMinT) * 0.005;
        if (newRange < minRange) return;
        if (newRange >= (fullMaxT - fullMinT)) { setViewRange(null); return; }

        const frac = pinchStartMidFrac.current;
        const pivot = startMin + frac * startRange;
        let newMin = pivot - frac * newRange;
        let newMax = pivot + (1 - frac) * newRange;
        if (newMin < fullMinT) { newMax += fullMinT - newMin; newMin = fullMinT; }
        if (newMax > fullMaxT) { newMin -= newMax - fullMaxT; newMax = fullMaxT; }
        newMin = Math.max(newMin, fullMinT);
        newMax = Math.min(newMax, fullMaxT);
        setViewRange([newMin, newMax]);
      } else if (e.touches.length === 1 && isDragging.current && dragStartRange.current) {
        // Single finger pan
        e.preventDefault();
        const svgX = toSvgX(e.touches[0].clientX);
        const deltaPx = svgX - dragStartX.current;
        if (Math.abs(deltaPx) > 3) hasDragged.current = true;
        if (hasDragged.current) {
          applyPan(dragStartRange.current, deltaPx);
        }
      }
    };

    const touchEndHandler = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        pinchStartRange.current = null;
      }
      if (e.touches.length === 0) {
        isDragging.current = false;
        isTouchPanning.current = false;
      }
    };

    svg.addEventListener('wheel', wheelHandler, { passive: false });
    svg.addEventListener('touchstart', touchStartHandler, { passive: false });
    svg.addEventListener('touchmove', touchMoveHandler, { passive: false });
    svg.addEventListener('touchend', touchEndHandler);
    return () => {
      svg.removeEventListener('wheel', wheelHandler);
      svg.removeEventListener('touchstart', touchStartHandler);
      svg.removeEventListener('touchmove', touchMoveHandler);
      svg.removeEventListener('touchend', touchEndHandler);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const layout = useMemo(() => {
    if (visibleData.length < 2) return null;
    const margin = { top: 12, right: 12, bottom: 32, left: 48 };
    const w = width - margin.left - margin.right;
    const h = height - margin.top - margin.bottom;

    const minT = visibleData[0].t;
    const maxT = visibleData[visibleData.length - 1].t;
    const rangeT = maxT - minT || 1;

    let minV = Infinity;
    let maxV = -Infinity;
    for (const p of visibleData) {
      if (p.v < minV) minV = p.v;
      if (p.v > maxV) maxV = p.v;
    }
    const padV = (maxV - minV) * 0.05 || 1;
    minV -= padV;
    maxV += padV;
    const rangeV = maxV - minV;

    const toX = (t: number) => margin.left + ((t - minT) / rangeT) * w;
    const toY = (v: number) => margin.top + h - ((v - minV) / rangeV) * h;
    const fromX = (px: number) => minT + ((px - margin.left) / w) * rangeT;

    const linePath = visibleData
      .map((p, i) => `${i === 0 ? 'M' : 'L'}${toX(p.t).toFixed(1)},${toY(p.v).toFixed(1)}`)
      .join(' ');

    const areaPath = linePath +
      ` L${toX(visibleData[visibleData.length - 1].t).toFixed(1)},${(margin.top + h).toFixed(1)}` +
      ` L${toX(visibleData[0].t).toFixed(1)},${(margin.top + h).toFixed(1)} Z`;

    // Smooth line path
    const smoothPath = smoothedData.length >= 2
      ? smoothedData
          .map((p, i) => `${i === 0 ? 'M' : 'L'}${toX(p.t).toFixed(1)},${toY(p.v).toFixed(1)}`)
          .join(' ')
      : '';
    const smoothArea = smoothPath
      ? smoothPath +
        ` L${toX(smoothedData[smoothedData.length - 1].t).toFixed(1)},${(margin.top + h).toFixed(1)}` +
        ` L${toX(smoothedData[0].t).toFixed(1)},${(margin.top + h).toFixed(1)} Z`
      : '';

    const yStep = niceStep(rangeV, 5);
    const yTicks: number[] = [];
    const yStart = Math.ceil(minV / yStep) * yStep;
    for (let v = yStart; v <= maxV; v += yStep) yTicks.push(v);

    const showDates = rangeT > 86400_000;
    const xTickCount = Math.min(6, Math.floor(w / 80));
    const xTicks: number[] = [];
    for (let i = 0; i <= xTickCount; i++) {
      xTicks.push(minT + (rangeT * i) / xTickCount);
    }

    let sum = 0;
    for (const p of visibleData) sum += p.v;
    const avg = sum / visibleData.length;
    const min = Math.min(...visibleData.map((p) => p.v));
    const max = Math.max(...visibleData.map((p) => p.v));
    const current = visibleData[visibleData.length - 1].v;

    return { margin, w, h, linePath, areaPath, smoothPath, smoothArea, toX, toY, fromX, yTicks, xTicks, showDates, minV, maxV, stats: { avg, min, max, current } };
  }, [visibleData, smoothedData, width, height]);

  // Mouse move: hover tooltip or drag-to-pan
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!layout || !svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const scaleX = width / rect.width;
      const px = (e.clientX - rect.left) * scaleX;

      // Drag-to-pan
      if (isDragging.current && dragStartRange.current && data.length >= 2) {
        const deltaPx = px - dragStartX.current;
        if (Math.abs(deltaPx) > 3 && !hasDragged.current) {
          hasDragged.current = true;
          setHoverIdx(null);
        }
        if (hasDragged.current) {
          const margin = { left: 48, right: 12 };
          const chartW = width - margin.left - margin.right;
          const [startMin, startMax] = dragStartRange.current;
          const timeRange = startMax - startMin;
          const deltaTime = -(deltaPx / chartW) * timeRange;

          const fullMinT = data[0].t;
          const fullMaxT = data[data.length - 1].t;
          let newMin = startMin + deltaTime;
          let newMax = startMax + deltaTime;
          if (newMin < fullMinT) { newMax += fullMinT - newMin; newMin = fullMinT; }
          if (newMax > fullMaxT) { newMin -= newMax - fullMaxT; newMax = fullMaxT; }
          newMin = Math.max(newMin, fullMinT);
          newMax = Math.min(newMax, fullMaxT);
          setViewRange([newMin, newMax]);
          return;
        }
      }

      // Hover tooltip
      const t = layout.fromX(px);
      let lo = 0;
      let hi = visibleData.length - 1;
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (visibleData[mid].t < t) lo = mid + 1;
        else hi = mid;
      }
      if (lo > 0 && Math.abs(visibleData[lo - 1].t - t) < Math.abs(visibleData[lo].t - t)) lo--;
      setHoverIdx(lo);
    },
    [layout, visibleData, width, data],
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!svgRef.current || data.length < 2) return;
      isDragging.current = true;
      hasDragged.current = false;
      const rect = svgRef.current.getBoundingClientRect();
      const scaleX = width / rect.width;
      dragStartX.current = (e.clientX - rect.left) * scaleX;
      const fullMinT = data[0].t;
      const fullMaxT = data[data.length - 1].t;
      dragStartRange.current = viewRange ?? [fullMinT, fullMaxT];
    },
    [data, viewRange, width],
  );

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoverIdx(null);
    isDragging.current = false;
  }, []);

  if (!layout) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
        No data
      </div>
    );
  }

  const { margin, h: chartH, linePath, areaPath, smoothPath, smoothArea, toX, toY, yTicks, xTicks, showDates, stats } = layout;
  const decimals = Math.abs(stats.max - stats.min) < 10 ? 1 : 0;
  const fmtV = (v: number) => v.toFixed(decimals);

  const hoverPoint = hoverIdx != null ? visibleData[hoverIdx] : null;
  const isZoomed = viewRange != null;

  return (
    <div>
      {/* Controls bar */}
      <div className="flex items-center justify-between mb-1 min-h-[1.5rem]">
        <button
          onClick={() => setShowSmooth((s) => !s)}
          className={cn(
            'text-[10px] px-2 py-0.5 rounded transition-colors',
            showSmooth
              ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
              : 'bg-muted text-muted-foreground hover:text-foreground',
          )}
        >
          {showSmooth ? '✦ Smooth' : '○ Smooth'}
        </button>
        {isZoomed && (
          <button
            onClick={() => setViewRange(null)}
            className="text-[10px] text-muted-foreground hover:text-foreground px-2 py-0.5 rounded bg-muted"
          >
            Reset Zoom
          </button>
        )}
      </div>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className={cn('w-full select-none', isZoomed ? 'cursor-grab active:cursor-grabbing' : '')}
        viewBox={`0 0 ${width} ${height}`}
        style={{ touchAction: 'none', cursor: isZoomed ? undefined : 'crosshair' }}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        {/* Grid lines */}
        {yTicks.map((v) => (
          <g key={v}>
            <line
              x1={margin.left}
              y1={toY(v)}
              x2={width - margin.right}
              y2={toY(v)}
              stroke="currentColor"
              className="text-border"
              strokeWidth={0.5}
            />
            <text
              x={margin.left - 6}
              y={toY(v) + 4}
              textAnchor="end"
              className="fill-muted-foreground"
              fontSize={10}
            >
              {fmtV(v)}
            </text>
          </g>
        ))}

        {/* X axis labels */}
        {xTicks.map((t) => (
          <text
            key={t}
            x={toX(t)}
            y={margin.top + chartH + 20}
            textAnchor="middle"
            className="fill-muted-foreground"
            fontSize={10}
          >
            {showDates ? formatDate(t) : formatTime(t)}
          </text>
        ))}

        {/* Raw area + line (faded when smooth is on) */}
        <path d={areaPath} fill={color} opacity={showSmooth ? 0.05 : 0.1} />
        <path d={linePath} fill="none" stroke={color} strokeWidth={showSmooth ? 1 : 2} strokeLinejoin="round" opacity={showSmooth ? 0.3 : 1} />

        {/* Smooth area + line */}
        {showSmooth && smoothPath && (
          <>
            <path d={smoothArea} fill={color} opacity={0.1} />
            <path d={smoothPath} fill="none" stroke={color} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
          </>
        )}

        {/* Hover crosshair + dot */}
        {hoverPoint && (
          <>
            <line
              x1={toX(hoverPoint.t)}
              y1={margin.top}
              x2={toX(hoverPoint.t)}
              y2={margin.top + chartH}
              stroke={color}
              strokeWidth={1}
              opacity={0.4}
              strokeDasharray="3,3"
            />
            <circle
              cx={toX(hoverPoint.t)}
              cy={toY(hoverPoint.v)}
              r={4}
              fill={color}
              stroke="hsl(var(--card))"
              strokeWidth={2}
            />
          </>
        )}

        {/* Invisible hover area */}
        <rect
          x={margin.left}
          y={margin.top}
          width={width - margin.left - margin.right}
          height={chartH}
          fill="transparent"
        />
      </svg>

      {/* Hover tooltip or stats row */}
      <div className="flex gap-4 mt-2 text-xs min-h-[1.25rem]">
        {hoverPoint ? (
          <>
            <span className="text-muted-foreground">
              {new Date(hoverPoint.t).toLocaleString([], {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </span>
            <span className="font-semibold" style={{ color }}>
              {fmtV(hoverPoint.v)}{unit}
            </span>
          </>
        ) : (
          <>
            <span className="text-muted-foreground">
              Current: <strong className="text-foreground">{fmtV(stats.current)}{unit}</strong>
            </span>
            <span className="text-muted-foreground">
              Min: <strong className="text-foreground">{fmtV(stats.min)}{unit}</strong>
            </span>
            <span className="text-muted-foreground">
              Max: <strong className="text-foreground">{fmtV(stats.max)}{unit}</strong>
            </span>
            <span className="text-muted-foreground">
              Avg: <strong className="text-foreground">{fmtV(stats.avg)}{unit}</strong>
            </span>
          </>
        )}
      </div>
    </div>
  );
}
