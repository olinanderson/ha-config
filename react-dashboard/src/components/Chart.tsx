import { useMemo } from 'react';
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
  const layout = useMemo(() => {
    if (data.length < 2) return null;
    const margin = { top: 12, right: 12, bottom: 32, left: 48 };
    const w = width - margin.left - margin.right;
    const h = height - margin.top - margin.bottom;

    const minT = data[0].t;
    const maxT = data[data.length - 1].t;
    const rangeT = maxT - minT || 1;

    let minV = Infinity;
    let maxV = -Infinity;
    for (const p of data) {
      if (p.v < minV) minV = p.v;
      if (p.v > maxV) maxV = p.v;
    }
    // Add 5% padding
    const padV = (maxV - minV) * 0.05 || 1;
    minV -= padV;
    maxV += padV;
    const rangeV = maxV - minV;

    const toX = (t: number) => margin.left + ((t - minT) / rangeT) * w;
    const toY = (v: number) => margin.top + h - ((v - minV) / rangeV) * h;

    // Line path
    const linePath = data
      .map((p, i) => `${i === 0 ? 'M' : 'L'}${toX(p.t).toFixed(1)},${toY(p.v).toFixed(1)}`)
      .join(' ');

    // Area fill
    const areaPath = linePath +
      ` L${toX(data[data.length - 1].t).toFixed(1)},${(margin.top + h).toFixed(1)}` +
      ` L${toX(data[0].t).toFixed(1)},${(margin.top + h).toFixed(1)} Z`;

    // Y axis ticks
    const yStep = niceStep(rangeV, 5);
    const yTicks: number[] = [];
    const yStart = Math.ceil(minV / yStep) * yStep;
    for (let v = yStart; v <= maxV; v += yStep) yTicks.push(v);

    // X axis ticks (time)
    const showDates = rangeT > 86400_000;
    const xTickCount = Math.min(6, Math.floor(w / 80));
    const xTicks: number[] = [];
    for (let i = 0; i <= xTickCount; i++) {
      xTicks.push(minT + (rangeT * i) / xTickCount);
    }

    // Stats
    let sum = 0;
    for (const p of data) sum += p.v;
    const avg = sum / data.length;
    const min = Math.min(...data.map((p) => p.v));
    const max = Math.max(...data.map((p) => p.v));
    const current = data[data.length - 1].v;

    return { margin, w, h, linePath, areaPath, toX, toY, yTicks, xTicks, showDates, minV, maxV, stats: { avg, min, max, current } };
  }, [data, width, height]);

  if (!layout) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
        No data
      </div>
    );
  }

  const { margin, h, linePath, areaPath, toX, toY, yTicks, xTicks, showDates, stats } = layout;

  const decimals = Math.abs(stats.max - stats.min) < 10 ? 1 : 0;
  const fmtV = (v: number) => v.toFixed(decimals);

  return (
    <div>
      <svg width={width} height={height} className="w-full" viewBox={`0 0 ${width} ${height}`}>
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
            y={margin.top + h + 20}
            textAnchor="middle"
            className="fill-muted-foreground"
            fontSize={10}
          >
            {showDates ? formatDate(t) : formatTime(t)}
          </text>
        ))}

        {/* Area + Line */}
        <path d={areaPath} fill={color} opacity={0.1} />
        <path d={linePath} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" />
      </svg>

      {/* Stats row */}
      <div className="flex gap-4 mt-2 text-xs">
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
      </div>
    </div>
  );
}
