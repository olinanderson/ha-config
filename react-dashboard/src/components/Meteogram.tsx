/**
 * Meteogram — ONE combined weather chart: hourly temperature line/area on top,
 * hourly rainfall bars below (growing UP, height = mm read off a right-side mm
 * axis), sharing a scrollable time axis across the next 7 days.
 *
 * Two y-axes: LEFT = temperature °C, RIGHT = rainfall mm (the precip "legend").
 * Bar height encodes AMOUNT (mm); bar opacity encodes chance of rain (fainter =
 * less likely); color deepens with intensity. Day dividers + labels at local
 * midnight, hour ticks every 3h, an amber "now" line, auto-scroll to now.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { LineChart } from 'lucide-react';

const HOUR_W = 14;
const H = 192;
const LEFT_PAD = 30;
const RIGHT_PAD = 32;
const TEMP_TOP = 22;
const TEMP_BOT = 108;
const PRECIP_TOP = 116; // highest a bar can reach
const PRECIP_BASE = 156; // baseline — bars grow UP from here
const DAY_LABEL_Y = 12;
const HOUR_LABEL_Y = 172;
const PRECIP_H = PRECIP_BASE - PRECIP_TOP; // 40

interface HourPt {
  t: number; // ms
  temp: number;
  pop: number; // %
  mm: number;
}

function useHourlyMeteo(lat?: number, lon?: number) {
  const [hours, setHours] = useState<HourPt[] | null>(null);
  const [loading, setLoading] = useState(false);
  const latKey = lat != null && Number.isFinite(lat) ? lat.toFixed(2) : null;
  const lonKey = lon != null && Number.isFinite(lon) ? lon.toFixed(2) : null;

  useEffect(() => {
    if (latKey == null || lonKey == null) return;
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const url =
          `https://api.open-meteo.com/v1/forecast?latitude=${latKey}&longitude=${lonKey}` +
          `&hourly=temperature_2m,precipitation_probability,precipitation&timezone=auto&forecast_days=7`;
        const r = await fetch(url);
        const j = await r.json();
        if (cancelled) return;
        const h = j?.hourly;
        if (!h?.time) throw new Error('bad payload');
        const pts: HourPt[] = [];
        for (let i = 0; i < h.time.length; i++) {
          const temp = h.temperature_2m?.[i];
          if (temp == null) continue;
          pts.push({
            t: new Date(h.time[i]).getTime(),
            temp,
            pop: h.precipitation_probability?.[i] ?? 0,
            mm: h.precipitation?.[i] ?? 0,
          });
        }
        setHours(pts);
      } catch {
        /* keep last-good */
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    const id = setInterval(load, 15 * 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [latKey, lonKey]);

  return { hours, loading };
}

/** Monochrome-blue rain-intensity ramp (mm). */
function precipColor(mm: number): string {
  if (mm >= 7) return '#6C4AE0';
  if (mm >= 2.5) return '#1E5FE0';
  if (mm >= 1) return '#2E9BFF';
  return '#5AC8FA';
}

function niceStep(range: number, ticks: number): number {
  const rough = range / ticks;
  const mag = Math.pow(10, Math.floor(Math.log10(rough)));
  const r = rough / mag;
  if (r <= 1.5) return mag;
  if (r <= 3) return 2 * mag;
  if (r <= 7) return 5 * mag;
  return 10 * mag;
}

/** Nice ceiling + tick set for the mm axis. */
function mmAxis(rawMax: number): { max: number; ticks: number[] } {
  const max = rawMax <= 1 ? 1 : rawMax <= 2 ? 2 : rawMax <= 5 ? 5 : rawMax <= 10 ? 10 : Math.ceil(rawMax / 10) * 10;
  const ticks =
    max <= 1 ? [0, 0.5, 1]
      : max <= 2 ? [0, 1, 2]
        : max <= 5 ? [0, 2, 4]
          : max <= 10 ? [0, 5, 10]
            : [0, max / 2, max];
  return { max, ticks };
}

export function Meteogram({ lat, lon }: { lat?: number; lon?: number }) {
  const { hours, loading } = useHourlyMeteo(lat, lon);
  const scrollRef = useRef<HTMLDivElement>(null);

  const model = useMemo(() => {
    if (!hours || hours.length < 2) return null;
    const t0 = hours[0].t;
    const now = Date.now();
    const temps = hours.map((h) => h.temp);
    const tMin = Math.floor(Math.min(...temps)) - 1;
    const tMax = Math.ceil(Math.max(...temps)) + 1;
    const tRange = tMax - tMin || 1;
    const yTemp = (v: number) => TEMP_BOT - ((v - tMin) / tRange) * (TEMP_BOT - TEMP_TOP);

    const { max: mmMax, ticks: mmTicks } = mmAxis(Math.max(0, ...hours.map((h) => h.mm)));
    const yPrecip = (mm: number) => PRECIP_BASE - Math.min(1, mm / mmMax) * PRECIP_H;

    const xi = (i: number) => i * HOUR_W;
    const cx = (i: number) => i * HOUR_W + HOUR_W / 2;
    const xTime = (t: number) => ((t - t0) / 3600_000) * HOUR_W;
    const plotW = hours.length * HOUR_W;

    // Temperature gridlines
    const step = niceStep(tRange, 4);
    const grid: number[] = [];
    for (let v = Math.ceil(tMin / step) * step; v <= tMax; v += step) grid.push(v);

    const line = hours.map((h, i) => `${i === 0 ? 'M' : 'L'}${cx(i).toFixed(1)},${yTemp(h.temp).toFixed(1)}`).join(' ');
    const area = `${line} L${cx(hours.length - 1).toFixed(1)},${TEMP_BOT} L${cx(0).toFixed(1)},${TEMP_BOT} Z`;

    // Day boundaries + per-day hi/lo temp labels
    const days: { i: number; label: string }[] = [];
    for (let i = 0; i < hours.length; i++) {
      const d = new Date(hours[i].t);
      if (i === 0 || d.getHours() === 0) {
        days.push({ i, label: d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' }) });
      }
    }
    const tempLabels: { i: number; v: number; hi: boolean }[] = [];
    for (let k = 0; k < days.length; k++) {
      const start = days[k].i;
      const end = k + 1 < days.length ? days[k + 1].i : hours.length;
      let hiI = start;
      let loI = start;
      for (let i = start; i < end; i++) {
        if (hours[i].temp > hours[hiI].temp) hiI = i;
        if (hours[i].temp < hours[loI].temp) loI = i;
      }
      tempLabels.push({ i: hiI, v: hours[hiI].temp, hi: true });
      if (loI !== hiI) tempLabels.push({ i: loI, v: hours[loI].temp, hi: false });
    }

    // mm labels on wet-run peaks
    const mmLabels: { i: number; mm: number }[] = [];
    for (let i = 0; i < hours.length; i++) {
      const mm = hours[i].mm;
      if (mm >= 0.5 && mm >= (hours[i - 1]?.mm ?? 0) && mm >= (hours[i + 1]?.mm ?? 0)) {
        mmLabels.push({ i, mm });
      }
    }

    // Hour ticks every 3h, skip midnight
    const hourTicks: { i: number; hr: number }[] = [];
    for (let i = 0; i < hours.length; i++) {
      const hr = new Date(hours[i].t).getHours();
      if (hr % 3 === 0 && hr !== 0) hourTicks.push({ i, hr });
    }

    const xNow = xTime(now);
    let nowI = 0;
    for (let i = 0; i < hours.length; i++) if (hours[i].t <= now) nowI = i;

    return { now, grid, yTemp, yPrecip, mmMax, mmTicks, xi, cx, xTime, plotW, line, area, days, tempLabels, mmLabels, hourTicks, xNow, nowI };
  }, [hours]);

  useEffect(() => {
    if (model && scrollRef.current) {
      scrollRef.current.scrollLeft = Math.max(0, model.xNow - HOUR_W * 4);
    }
  }, [model]);

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <LineChart className="h-3.5 w-3.5" />
          Forecast — hourly, next 7 days
        </p>
        {loading && <span className="text-[10px] text-muted-foreground">updating…</span>}
      </div>
      {!model || !hours ? (
        <p className="py-8 text-center text-xs text-muted-foreground">
          {lat == null ? 'Waiting for GPS…' : 'Loading forecast…'}
        </p>
      ) : (
        <>
          <div className="flex">
            {/* Left: temperature °C axis */}
            <svg width={LEFT_PAD} height={H} className="shrink-0">
              {model.grid.map((v) => (
                <text key={v} x={LEFT_PAD - 4} y={model.yTemp(v) + 3} textAnchor="end" fontSize={9} className="fill-muted-foreground">
                  {Math.round(v)}°
                </text>
              ))}
            </svg>
            {/* Scrollable plot */}
            <div ref={scrollRef} className="flex-1 overflow-x-auto">
              <svg width={model.plotW} height={H} className="block">
                {/* temp gridlines */}
                {model.grid.map((v) => (
                  <line key={`g${v}`} x1={0} x2={model.plotW} y1={model.yTemp(v)} y2={model.yTemp(v)} stroke="currentColor" className="text-border" strokeWidth={0.5} />
                ))}
                {/* precip baseline + mm gridlines */}
                {model.mmTicks.map((mm) => (
                  <line key={`m${mm}`} x1={0} x2={model.plotW} y1={model.yPrecip(mm)} y2={model.yPrecip(mm)} stroke="currentColor" className="text-border" strokeWidth={mm === 0 ? 0.8 : 0.4} opacity={mm === 0 ? 0.8 : 0.4} />
                ))}
                {/* day dividers + labels */}
                {model.days.map((d) => (
                  <g key={d.i}>
                    {d.i > 0 && (
                      <line x1={model.xi(d.i)} x2={model.xi(d.i)} y1={16} y2={PRECIP_BASE} stroke="currentColor" className="text-border" strokeWidth={1} />
                    )}
                    <text x={model.xi(d.i) + 4} y={DAY_LABEL_Y} fontSize={11} className="fill-foreground" fontWeight={500}>
                      {d.label}
                    </text>
                  </g>
                ))}
                {/* rainfall bars — grow UP from baseline; height = mm, opacity = chance */}
                {hours.map((h, i) => {
                  if (h.mm < 0.05) return null;
                  const top = model.yPrecip(h.mm);
                  const barH = Math.max(1.5, PRECIP_BASE - top);
                  const past = h.t < model.now;
                  const opacity = (0.4 + 0.6 * (h.pop / 100)) * (past ? 0.5 : 1);
                  return (
                    <rect key={i} x={model.xi(i) + 1.5} y={PRECIP_BASE - barH} width={HOUR_W - 3} height={barH} rx={1} fill={precipColor(h.mm)} opacity={opacity} />
                  );
                })}
                {/* mm labels on wet-run peaks (above the bar) */}
                {model.mmLabels.map((l) => (
                  <text key={l.i} x={model.cx(l.i)} y={model.yPrecip(l.mm) - 3} textAnchor="middle" fontSize={8} fill="#cfe6ff">
                    {l.mm < 2 ? l.mm.toFixed(1) : Math.round(l.mm)}
                  </text>
                ))}
                {/* temperature area + line */}
                <path d={model.area} fill="#fb923c" opacity={0.12} />
                <path d={model.line} fill="none" stroke="#fb923c" strokeWidth={2} strokeLinejoin="round" />
                {/* per-day high/low temp labels */}
                {model.tempLabels.map((l, k) => (
                  <text key={k} x={model.cx(l.i)} y={model.yTemp(l.v) + (l.hi ? -5 : 11)} textAnchor="middle" fontSize={9} className="fill-foreground">
                    {Math.round(l.v)}°
                  </text>
                ))}
                {/* hour ticks every 3h */}
                {model.hourTicks.map((t) => (
                  <text key={t.i} x={model.cx(t.i)} y={HOUR_LABEL_Y} textAnchor="middle" fontSize={9} className="fill-muted-foreground" fontWeight={t.hr === 12 ? 600 : 400}>
                    {String(t.hr).padStart(2, '0')}
                  </text>
                ))}
                {/* now marker */}
                <line x1={model.xNow} x2={model.xNow} y1={16} y2={PRECIP_BASE} stroke="#f5a623" strokeWidth={1.5} strokeDasharray="4 2" />
                <circle cx={model.cx(model.nowI)} cy={model.yTemp(hours[model.nowI].temp)} r={3} fill="#f5a623" stroke="hsl(var(--card))" strokeWidth={1.5} />
              </svg>
            </div>
            {/* Right: rainfall mm axis */}
            <svg width={RIGHT_PAD} height={H} className="shrink-0">
              {model.mmTicks.map((mm) => (
                <text key={mm} x={4} y={model.yPrecip(mm) + 3} textAnchor="start" fontSize={9} fill="#7fb2e6">
                  {mm}
                </text>
              ))}
              <text x={4} y={PRECIP_TOP - 6} textAnchor="start" fontSize={8} fill="#7fb2e6">mm</text>
            </svg>
          </div>
          {/* legend */}
          <div className="mt-1 flex items-center justify-center gap-4 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><span className="h-0.5 w-3 rounded bg-orange-400" /> temp °C (left)</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-sky-400" /> rain mm (right) · fainter = less likely</span>
          </div>
        </>
      )}
    </div>
  );
}
