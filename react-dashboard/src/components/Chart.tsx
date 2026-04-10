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
  // Live ref for viewRange — updated immediately so rapid touch events don't read stale state
  const viewRangeRef = useRef<[number, number] | null>(null);
  const setViewRangeLive = useCallback((range: [number, number] | null) => {
    viewRangeRef.current = range;
    setViewRange(range);
  }, []);

  // Drag-to-pan refs (mouse)
  const isDragging = useRef(false);
  const hasDragged = useRef(false);
  const dragStartX = useRef(0);
  const dragStartRange = useRef<[number, number] | null>(null);

  // Ref for stable native event handlers (avoids re-attaching on every state change)
  const stateRef = useRef({ data, width });
  stateRef.current = { data, width };

  // Reset zoom when data changes (e.g. time range button)
  const dataId = data.length > 0 ? `${data[0].t}-${data[data.length - 1].t}` : '';
  const prevDataId = useRef(dataId);
  if (dataId !== prevDataId.current) {
    prevDataId.current = dataId;
    if (viewRange) setViewRangeLive(null);
  }

  // Filter data to view range
  const visibleData = useMemo(() => {
    if (!viewRange || data.length < 2) return data;
    const [lo, hi] = viewRange;
    return data.filter((p) => p.t >= lo && p.t <= hi);
  }, [data, viewRange]);

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
      const { data, width } = stateRef.current;
      const viewRange = viewRangeRef.current;
      if (data.length < 2) return;
      const fullMinT = data[0].t;
      const fullMaxT = data[data.length - 1].t;
      const curMin = viewRange ? viewRange[0] : fullMinT;
      const curMax = viewRange ? viewRange[1] : fullMaxT;
      const curRange = curMax - curMin;

      const newRange = curRange * zoomFactor;
      const minRange = (fullMaxT - fullMinT) * 0.005;
      if (newRange < minRange) return;
      if (newRange >= (fullMaxT - fullMinT)) { setViewRangeLive(null); return; }

      const pivot = curMin + frac * curRange;
      let newMin = pivot - frac * newRange;
      let newMax = pivot + (1 - frac) * newRange;
      if (newMin < fullMinT) { newMax += fullMinT - newMin; newMin = fullMinT; }
      if (newMax > fullMaxT) { newMin -= newMax - fullMaxT; newMax = fullMaxT; }
      newMin = Math.max(newMin, fullMinT);
      newMax = Math.min(newMax, fullMaxT);
      setViewRangeLive([newMin, newMax]);
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
      setViewRangeLive([newMin, newMax]);
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

    // ─── Touch: incremental pinch-to-zoom + pan ───
    // Incremental approach: each frame compares to PREVIOUS frame, not start.
    // This naturally handles one-finger-anchor + other-finger-scroll.
    let touchState: 'idle' | 'pan' | 'pinch' = 'idle';
    let touchPanLastX = 0;
    // Previous frame's 2-finger state for incremental zoom+pan
    let prevTouchA: { x: number; y: number } | null = null;
    let prevTouchB: { x: number; y: number } | null = null;

    const dist = (ax: number, ay: number, bx: number, by: number) =>
      Math.sqrt((bx - ax) ** 2 + (by - ay) ** 2);

    const touchStartHandler = (e: TouchEvent) => {
      const { data } = stateRef.current;
      if (data.length < 2) return;
      e.preventDefault();

      if (e.touches.length >= 2) {
        touchState = 'pinch';
        prevTouchA = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        prevTouchB = { x: e.touches[1].clientX, y: e.touches[1].clientY };
      } else if (e.touches.length === 1) {
        touchState = 'pan';
        touchPanLastX = toSvgX(e.touches[0].clientX);
      }
    };

    const touchMoveHandler = (e: TouchEvent) => {
      const { data, width } = stateRef.current;
      const viewRange = viewRangeRef.current;
      if (data.length < 2) return;
      e.preventDefault();

      const fullMinT = data[0].t;
      const fullMaxT = data[data.length - 1].t;
      const curMin = viewRange ? viewRange[0] : fullMinT;
      const curMax = viewRange ? viewRange[1] : fullMaxT;
      const curRange = curMax - curMin;
      const chartW = width - MARGIN.left - MARGIN.right;

      if (e.touches.length >= 2) {
        if (touchState !== 'pinch' || !prevTouchA || !prevTouchB) {
          // Transition to pinch — just record positions, actual zoom starts next frame
          touchState = 'pinch';
          prevTouchA = { x: e.touches[0].clientX, y: e.touches[0].clientY };
          prevTouchB = { x: e.touches[1].clientX, y: e.touches[1].clientY };
          return;
        }

        const curA = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        const curB = { x: e.touches[1].clientX, y: e.touches[1].clientY };
        const prevDist = dist(prevTouchA.x, prevTouchA.y, prevTouchB.x, prevTouchB.y);
        const curDist = dist(curA.x, curA.y, curB.x, curB.y);

        // Incremental zoom: ratio of previous distance to current distance
        if (prevDist > 10 && curDist > 10) {
          const zoomScale = prevDist / curDist; // fingers closer = zoom out, farther = zoom in
          const newRange = curRange * zoomScale;
          const minRange = (fullMaxT - fullMinT) * 0.005;

          // Incremental pan: shift of midpoint between fingers
          const prevMidX = (prevTouchA.x + prevTouchB.x) / 2;
          const curMidX = (curA.x + curB.x) / 2;
          const midFrac = pxFrac(toSvgX(curMidX));
          const panDeltaSvgPx = toSvgX(curMidX) - toSvgX(prevMidX);
          const panDeltaTime = -(panDeltaSvgPx / chartW) * curRange;

          if (newRange >= (fullMaxT - fullMinT)) {
            setViewRangeLive(null);
          } else if (newRange >= minRange) {
            // Apply zoom centered on midpoint + pan
            const pivot = curMin + midFrac * curRange;
            let newMin = pivot - midFrac * newRange + panDeltaTime;
            let newMax = pivot + (1 - midFrac) * newRange + panDeltaTime;
            // Clamp
            if (newMin < fullMinT) { newMax += fullMinT - newMin; newMin = fullMinT; }
            if (newMax > fullMaxT) { newMin -= newMax - fullMaxT; newMax = fullMaxT; }
            newMin = Math.max(newMin, fullMinT);
            newMax = Math.min(newMax, fullMaxT);
            setViewRangeLive([newMin, newMax]);
          }
        }

        prevTouchA = curA;
        prevTouchB = curB;
      } else if (e.touches.length === 1) {
        if (touchState === 'pinch') {
          // Was pinching, lifted one finger → switch to pan from current position
          touchState = 'pan';
          touchPanLastX = toSvgX(e.touches[0].clientX);
          prevTouchA = null;
          prevTouchB = null;
          return;
        }
        // Single finger incremental pan
        const svgX = toSvgX(e.touches[0].clientX);
        const deltaPx = svgX - touchPanLastX;
        if (Math.abs(deltaPx) > 1) {
          const deltaTime = -(deltaPx / chartW) * curRange;
          let newMin = curMin + deltaTime;
          let newMax = curMax + deltaTime;
          if (newMin < fullMinT) { newMax += fullMinT - newMin; newMin = fullMinT; }
          if (newMax > fullMaxT) { newMin -= newMax - fullMaxT; newMax = fullMaxT; }
          newMin = Math.max(newMin, fullMinT);
          newMax = Math.min(newMax, fullMaxT);
          setViewRangeLive([newMin, newMax]);
          touchPanLastX = svgX;
        }
      }
    };

    const touchEndHandler = (e: TouchEvent) => {
      if (e.touches.length === 0) {
        touchState = 'idle';
        prevTouchA = null;
        prevTouchB = null;
      } else if (e.touches.length === 1 && touchState === 'pinch') {
        // Released one finger during pinch → seamless transition to pan
        touchState = 'pan';
        touchPanLastX = toSvgX(e.touches[0].clientX);
        prevTouchA = null;
        prevTouchB = null;
      } else if (e.touches.length >= 2 && touchState !== 'pinch') {
        touchState = 'pinch';
        prevTouchA = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        prevTouchB = { x: e.touches[1].clientX, y: e.touches[1].clientY };
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

    return { margin, w, h, linePath, areaPath, toX, toY, fromX, yTicks, xTicks, showDates, minV, maxV, stats: { avg, min, max, current } };
  }, [visibleData, width, height]);

  // Mouse move: hover tooltip or drag-to-pan
  // Shared pan logic (used by both SVG onMouseMove and window mousemove)
  const doPan = useCallback(
    (clientX: number) => {
      if (!svgRef.current || !dragStartRange.current || data.length < 2) return;
      const rect = svgRef.current.getBoundingClientRect();
      const scaleX = width / rect.width;
      const px = (clientX - rect.left) * scaleX;
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
        setViewRangeLive([newMin, newMax]);
      }
    },
    [data, width, setViewRangeLive],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!layout || !svgRef.current) return;

      // If dragging, doPan handles it (window listener)
      if (isDragging.current) return;

      // Hover tooltip
      const rect = svgRef.current.getBoundingClientRect();
      const scaleX = width / rect.width;
      const px = (e.clientX - rect.left) * scaleX;
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
    [layout, visibleData, width],
  );

  // Window-level drag listeners (attached on mousedown, removed on mouseup)
  const windowMoveRef = useRef<((e: MouseEvent) => void) | null>(null);
  const windowUpRef = useRef<((e: MouseEvent) => void) | null>(null);

  const cleanupWindowDrag = useCallback(() => {
    if (windowMoveRef.current) window.removeEventListener('mousemove', windowMoveRef.current);
    if (windowUpRef.current) window.removeEventListener('mouseup', windowUpRef.current);
    windowMoveRef.current = null;
    windowUpRef.current = null;
  }, []);

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
      dragStartRange.current = viewRangeRef.current ?? [fullMinT, fullMaxT];

      // Attach window-level listeners so drag works outside SVG
      cleanupWindowDrag();
      const onMove = (ev: MouseEvent) => {
        ev.preventDefault();
        doPan(ev.clientX);
      };
      const onUp = () => {
        isDragging.current = false;
        cleanupWindowDrag();
      };
      windowMoveRef.current = onMove;
      windowUpRef.current = onUp;
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    },
    [data, viewRange, width, doPan, cleanupWindowDrag],
  );

  // Cleanup window drag on unmount
  useEffect(() => () => cleanupWindowDrag(), [cleanupWindowDrag]);

  const handleMouseLeave = useCallback(() => {
    // Only clear hover; don't kill drag (window listeners handle that)
    if (!isDragging.current) setHoverIdx(null);
  }, []);

  if (!layout) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
        No data
      </div>
    );
  }

  const { margin, h: chartH, linePath, areaPath, toX, toY, yTicks, xTicks, showDates, stats } = layout;
  const decimals = Math.abs(stats.max - stats.min) < 10 ? 1 : 0;
  const fmtV = (v: number) => v.toFixed(decimals);

  const hoverPoint = hoverIdx != null ? visibleData[hoverIdx] : null;
  const isZoomed = viewRange != null;

  return (
    <div>
      {/* Controls bar */}
      <div className="flex items-center justify-end mb-1 min-h-[1.5rem]">
        {isZoomed && (
          <button
            onClick={() => setViewRangeLive(null)}
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

        {/* Area + line */}
        <path d={areaPath} fill={color} opacity={0.1} />
        <path d={linePath} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" />

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
