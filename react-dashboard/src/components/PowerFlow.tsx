import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useEntityNumeric } from '@/hooks/useEntity';
import { useHistoryDialog } from '@/components/EntityHistoryDialog';
import { fmt, cn } from '@/lib/utils';
import {
  Sun, Plug, Car, Lightbulb, Snowflake, Cpu, Zap, Home, BatteryMedium,
  Fan, Flame, BedDouble, Ellipsis,
  type LucideIcon,
} from 'lucide-react';

// ─── Types ───

type Mode = 'power' | 'amps';

interface NodeDef {
  id: string;
  label: string;
  Icon: LucideIcon;
  powerEntity: string;
  currentEntity: string;
  color: string;
}

// ─── Node definitions ───

const sourcesDef: NodeDef[] = [
  { id: 'solar', label: 'Solar', Icon: Sun, powerEntity: 'sensor.total_mppt_pv_power', currentEntity: 'sensor.total_mppt_output_current', color: '#ca8a04' },
  { id: 'shore', label: 'Shore Power', Icon: Plug, powerEntity: 'sensor.shore_power_charger_power_24v', currentEntity: 'sensor.a32_pro_s5140_channel_16_current_24v_shore_power_charger', color: '#16a34a' },
  { id: 'alt', label: 'Alt. Charger', Icon: Car, powerEntity: 'sensor.alternator_charger_power_24v', currentEntity: 'sensor.a32_pro_s5140_channel_8_current_24v_alternator_charger', color: '#2563eb' },
];

const consumersDef: NodeDef[] = [
  { id: '12v', label: '12V Devices', Icon: Lightbulb, powerEntity: 'sensor.all_12v_devices_power_24v', currentEntity: 'sensor.a32_pro_s5140_channel_6_current_24v_12v_devices', color: '#4f46e5' },
  { id: 'ac', label: 'A/C', Icon: Snowflake, powerEntity: 'sensor.air_conditioning_power_24v', currentEntity: 'sensor.a32_pro_s5140_channel_4_current_24v_air_conditioning', color: '#0891b2' },
  { id: '24v', label: '24V Devices', Icon: Cpu, powerEntity: 'sensor.all_24v_devices_power_24v', currentEntity: 'sensor.a32_pro_s5140_channel_5_current_24v_24v_devices', color: '#2563eb' },
  { id: 'inverter', label: 'Inverter', Icon: Zap, powerEntity: 'sensor.inverter_power_24v', currentEntity: 'sensor.a32_pro_s5140_channel_7_current_24v_inverter', color: '#ea580c' },
];

const subConsumersDef: { id: string; label: string; Icon: LucideIcon; parentId: string; powerEntity: string; currentEntity: string; color: string }[] = [
  { id: 'fan', label: 'Roof Fan', Icon: Fan, parentId: '12v', powerEntity: 'sensor.roof_fan_power_12v', currentEntity: 'sensor.a32_pro_s5140_channel_14_current_12v_roof_fan', color: '#8b5cf6' },
  { id: 'heater', label: 'Batt. Heater', Icon: Flame, parentId: '12v', powerEntity: 'sensor.battery_heater_power_12v', currentEntity: 'sensor.a32_pro_s5140_channel_13_current_12v_battery_heater', color: '#ef4444' },
  { id: 'other12v', label: 'Other', Icon: Ellipsis, parentId: '12v', powerEntity: 'sensor.all_12v_devices_power_24v', currentEntity: 'sensor.a32_pro_s5140_channel_6_current_24v_12v_devices', color: '#6b7280' },
  { id: 'bed', label: 'Bed Motor', Icon: BedDouble, parentId: '24v', powerEntity: 'sensor.bed_motor_power_24v', currentEntity: 'sensor.a32_pro_s5140_channel_15_current_24v_bed_motor', color: '#a855f7' },
  { id: 'other24v', label: 'Other', Icon: Ellipsis, parentId: '24v', powerEntity: 'sensor.all_24v_devices_power_24v', currentEntity: 'sensor.a32_pro_s5140_channel_5_current_24v_24v_devices', color: '#6b7280' },
];

// ─── Layout constants (SVG viewBox coords) ───

const CHIP_W = 70;
const CHIP_H = 28;
const HUB_R = 25;
const BATT_W = 60;
const BATT_H = 37;

const VB_W = 670;
const VB_H = 305;

const SRC_X = 50;
const SRC_YS = [42, 92, 142];

const HUB_CX = 280;
const HUB_CY = 106;

const BATT_LEFT = HUB_CX - BATT_W / 2;
const BATT_TOP = 248;

const CON_X = 420;
const CON_YS = [38, 78, 118, 158];

const SUB_X = 555;
const SUB_CHIP_W = 54;
const SUB_CHIP_H = 20;

const MAX_DOTS = 3;
const THRESHOLD_W = 8;
const THRESHOLD_A = 0.3;

// ─── Orthogonal path helper (90° turns with rounded corners) ───

function ortho(pts: [number, number][], r: number = 8): string {
  if (pts.length < 2) return '';
  let d = `M ${pts[0][0]},${pts[0][1]}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const [px, py] = pts[i - 1];
    const [cx, cy] = pts[i];
    const [nx, ny] = pts[i + 1];
    const dx1 = Math.sign(cx - px);
    const dy1 = Math.sign(cy - py);
    const dx2 = Math.sign(nx - cx);
    const dy2 = Math.sign(ny - cy);
    const leg1 = Math.abs(cx - px) + Math.abs(cy - py);
    const leg2 = Math.abs(nx - cx) + Math.abs(ny - cy);
    const rr = Math.min(r, leg1 / 2, leg2 / 2);
    d += ` L ${cx - dx1 * rr},${cy - dy1 * rr}`;
    d += ` Q ${cx},${cy} ${cx + dx2 * rr},${cy + dy2 * rr}`;
  }
  d += ` L ${pts[pts.length - 1][0]},${pts[pts.length - 1][1]}`;
  return d;
}

// ─── Edge paths (all orthogonal, all non-overlapping) ───

interface EdgeDef {
  id: string;
  path: string;
  color: string;
}

const edgeDefs: EdgeDef[] = [];

// Source → Hub (right of chip → staggered vertical channels → hub left)
// Chip right x=120. Source centers: solar y=56, shore y=106, alt y=156. Hub: CX=280, CY=106, R=25, left=255.
edgeDefs.push({ id: 'solar-hub', path: ortho([[120, 56],  [200, 56],  [200, 100], [255, 100]]), color: '#ca8a04' });
edgeDefs.push({ id: 'shore-hub', path: ortho([[120, 106], [255, 106]]),                          color: '#16a34a' });
edgeDefs.push({ id: 'alt-hub',   path: ortho([[120, 156], [210, 156], [210, 112], [255, 112]]), color: '#2563eb' });

// Source → Battery (left channel → down → horizontal → battery top at y=248)
edgeDefs.push({ id: 'solar-batt', path: ortho([[50, 56],  [10, 56],  [10, 236], [254, 236], [254, 248]]), color: '#ca8a04' });
edgeDefs.push({ id: 'shore-batt', path: ortho([[50, 106], [20, 106], [20, 228], [262, 228], [262, 248]]), color: '#16a34a' });
edgeDefs.push({ id: 'alt-batt',   path: ortho([[50, 156], [30, 156], [30, 220], [270, 220], [270, 248]]), color: '#2563eb' });

// Battery → Hub (straight vertical). Hub bottom = CY+R = 131.
edgeDefs.push({ id: 'batt-hub', path: ortho([[280, 248], [280, 131]]), color: '#ec4899' });

// Hub → Consumers. Hub top=81, bottom=131, right=305.
// Consumer chip top Y: 12v=38, ac=78, 24v=118, inverter=158. Centers: 52, 92, 132, 172.
edgeDefs.push({ id: 'hub-12v',      path: ortho([[288, 81],  [288, 52],  [420, 52]]),              color: '#4f46e5' });
edgeDefs.push({ id: 'hub-ac',       path: ortho([[305, 102], [352, 102], [352, 92],  [420, 92]]),  color: '#0891b2' });
edgeDefs.push({ id: 'hub-24v',      path: ortho([[305, 110], [354, 110], [354, 132], [420, 132]]), color: '#2563eb' });
edgeDefs.push({ id: 'hub-inverter', path: ortho([[288, 131], [288, 172], [420, 172]]),              color: '#ea580c' });

// Sub-consumer branches. Consumer chip right x=490.
// Sub chip top Y: fan=30, heater=52, other12v=74, bed=110, other24v=132. Centers: 40,62,84,120,142.
edgeDefs.push({ id: '12v-fan',      path: ortho([[490, 48],  [525, 48],  [525, 40],  [555, 40]]),  color: '#8b5cf6' });
edgeDefs.push({ id: '12v-heater',   path: ortho([[490, 52],  [527, 52],  [527, 62],  [555, 62]]),  color: '#ef4444' });
edgeDefs.push({ id: '12v-other12v', path: ortho([[490, 56],  [530, 56],  [530, 84],  [555, 84]]),  color: '#6b7280' });
edgeDefs.push({ id: '24v-bed',      path: ortho([[490, 128], [525, 128], [525, 120], [555, 120]]), color: '#a855f7' });
edgeDefs.push({ id: '24v-other24v', path: ortho([[490, 136], [527, 136], [527, 142], [555, 142]]), color: '#6b7280' });

// ─── Module-level animation stores (persist across unmount/remount) ───

interface EdgeLive {
  color: string;
  value: number;
  speed: number;
  dotCount: number;
  reverse: boolean;
  strokeWidth: number;
  threshold: number;
}

interface DrainInfo {
  endTime: number;
  speed: number;
  color: string;
  dotCount: number;
}

// Phase per edge — NEVER reset while JS context is alive
const phaseStore = new Map<string, number>();
// Drain: dots finishing their path after value drops to 0
const drainStore = new Map<string, DrainInfo>();
// Live data: written by React, read by RAF
const liveStore = new Map<string, EdgeLive>();

// SVG element refs — set/cleared per mount cycle
let mtPaths = new Map<string, SVGPathElement>();
let mtDots = new Map<string, SVGCircleElement[]>();

function updateEdge(id: string, data: Omit<EdgeLive, 'threshold'>, threshold: number) {
  const fullData: EdgeLive = { ...data, threshold };
  const old = liveStore.get(id);
  const wasActive = old ? old.value > threshold : false;
  const isActive = fullData.value > threshold;

  // Transition active → inactive: start drain so dots finish their path
  if (wasActive && !isActive && !drainStore.has(id)) {
    drainStore.set(id, {
      endTime: performance.now() + old!.speed * 1000,
      speed: old!.speed,
      color: old!.color,
      dotCount: old!.dotCount,
    });
  }
  if (isActive) drainStore.delete(id);
  liveStore.set(id, fullData);
}

function valToSpeed(v: number, m: Mode): number {
  return 4 - Math.min(v / (m === 'amps' ? 20 : 500), 1) * 3;
}
function valToDots(v: number, m: Mode): number {
  const f = Math.min(v / (m === 'amps' ? 15 : 400), 1);
  return f > 0.5 ? 3 : f > 0.15 ? 2 : 1;
}

// ─── Global RAF loop ───

let rafId = 0;
let rafRunning = false;
let lastTs = 0;

function tick(now: number) {
  const dt = lastTs === 0 ? 0 : Math.min((now - lastTs) / 1000, 0.1);
  lastTs = now;

  for (const { id } of edgeDefs) {
    const live = liveStore.get(id);
    if (!live) continue;

    const drain = drainStore.get(id);
    const isActive = live.value > live.threshold;

    let speed: number, animating: boolean, dotCount: number, dotColor: string;

    if (isActive) {
      speed = live.speed; animating = true; dotCount = live.dotCount; dotColor = live.color;
    } else if (drain) {
      if (now >= drain.endTime) {
        drainStore.delete(id); animating = false; speed = 0; dotCount = 0; dotColor = live.color;
      } else {
        speed = drain.speed; animating = true; dotCount = drain.dotCount; dotColor = drain.color;
      }
    } else {
      animating = false; speed = 0; dotCount = 0; dotColor = live.color;
    }

    // Advance phase continuously (even without mounted SVG)
    if (animating && speed > 0) {
      const p = phaseStore.get(id) ?? 0;
      const inc = dt / speed;
      phaseStore.set(id, live.reverse ? ((p - inc) % 1 + 1) % 1 : (p + inc) % 1);
    }

    const pathEl = mtPaths.get(id);
    const dots = mtDots.get(id);
    if (!pathEl || !dots) continue;

    pathEl.setAttribute('stroke', isActive ? live.color : (drain ? drain.color : live.color));
    pathEl.setAttribute('stroke-width', String(live.strokeWidth));
    pathEl.setAttribute('opacity', (isActive || drain) ? '0.55' : '0.18');

    const len = pathEl.getTotalLength();
    const curP = phaseStore.get(id) ?? 0;
    const gap = 1 / Math.max(dotCount, 1);

    for (let i = 0; i < MAX_DOTS; i++) {
      const c = dots[i];
      if (!c) continue;
      if (!animating || i >= dotCount) { c.setAttribute('opacity', '0'); continue; }
      const dp = ((curP + i * gap) % 1 + 1) % 1;
      const pt = pathEl.getPointAtLength(dp * len);
      c.setAttribute('cx', String(pt.x));
      c.setAttribute('cy', String(pt.y));
      c.setAttribute('fill', dotColor);
      c.setAttribute('opacity', '0.95');
    }
  }
  rafId = requestAnimationFrame(tick);
}

function startRAF() { if (rafRunning) return; rafRunning = true; lastTs = 0; rafId = requestAnimationFrame(tick); }
function stopRAF() { rafRunning = false; cancelAnimationFrame(rafId); }

// ─── Chip node ───

function Chip({ def, val, unit, active, onClick }: {
  def: NodeDef; val: string; unit: string; active: boolean; onClick: () => void;
}) {
  const Icon = def.Icon;
  return (
    <div style={{ width: CHIP_W, height: CHIP_H, cursor: 'pointer' }} onClick={onClick}>
      <div style={{
        height: '100%', borderRadius: 7,
        border: `1.5px solid ${active ? `${def.color}70` : 'hsl(var(--border))'}`,
        padding: '3px 6px', display: 'flex', alignItems: 'center', gap: 5,
        opacity: active ? 1 : 0.65,
        boxShadow: active ? `0 0 6px ${def.color}20` : 'none',
        transition: 'all 0.3s',
      }}>
        <Icon size={10} style={{ flexShrink: 0, color: active ? def.color : 'hsl(var(--muted-foreground))' }} />
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <span style={{
            fontSize: 7, fontWeight: 500, color: 'hsl(var(--muted-foreground))', lineHeight: 1.2,
            opacity: active ? 0.9 : 0.7,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{def.label}</span>
          <span style={{
            fontSize: 9, fontWeight: 700, lineHeight: 1.2,
            fontVariantNumeric: 'tabular-nums',
            color: active ? def.color : 'hsl(var(--muted-foreground))',
          }}>{val} {unit}</span>
        </div>
      </div>
    </div>
  );
}

// ─── 10-second rolling average hook ───

function useRollingAvg(value: number | null, windowMs = 10000): number | null {
  const buf = useRef<{ t: number; v: number }[]>([]);
  const prev = useRef<number | null>(null);
  const now = Date.now();
  if (value != null && value !== prev.current) {
    buf.current.push({ t: now, v: value });
    prev.current = value;
  }
  buf.current = buf.current.filter(e => e.t >= now - windowMs);
  if (buf.current.length === 0) return value;
  return buf.current.reduce((s, e) => s + e.v, 0) / buf.current.length;
}

function useEntityAvg(entityId: string, windowMs = 10000) {
  const { value, entity } = useEntityNumeric(entityId);
  const avg = useRollingAvg(value, windowMs);
  return { value: avg, entity };
}

// ─── Main component ───

export function PowerFlow() {
  const [mode, setMode] = useState<Mode>('amps');
  const { open } = useHistoryDialog();
  const unit = mode === 'amps' ? 'A' : 'W';
  const threshold = mode === 'amps' ? THRESHOLD_A : THRESHOLD_W;
  const decimals = mode === 'amps' ? 1 : 0;

  // Battery (SOC instant, power/current averaged)
  const { value: soc } = useEntityNumeric('sensor.olins_van_bms_battery');
  const { value: chargingW } = useEntityAvg('sensor.battery_charging');
  const { value: dischargingW } = useEntityAvg('sensor.battery_discharging');
  const { value: bmsCurrent } = useEntityAvg('sensor.olins_van_bms_current');

  // Sources (10s rolling average)
  const { value: solarW } = useEntityAvg('sensor.total_mppt_pv_power');
  const { value: shoreW } = useEntityAvg('sensor.shore_power_charger_power_24v');
  const { value: altW } = useEntityAvg('sensor.alternator_charger_power_24v');
  const { value: solarA } = useEntityAvg('sensor.total_mppt_output_current');
  const { value: shoreA } = useEntityAvg('sensor.a32_pro_s5140_channel_16_current_24v_shore_power_charger');
  const { value: altA } = useEntityAvg('sensor.a32_pro_s5140_channel_8_current_24v_alternator_charger');

  // Consumers (10s rolling average)
  const { value: dev12W } = useEntityAvg('sensor.all_12v_devices_power_24v');
  const { value: acW } = useEntityAvg('sensor.air_conditioning_power_24v');
  const { value: dev24W } = useEntityAvg('sensor.all_24v_devices_power_24v');
  const { value: inverterW } = useEntityAvg('sensor.inverter_power_24v');
  const { value: dev12A } = useEntityAvg('sensor.a32_pro_s5140_channel_6_current_24v_12v_devices');
  const { value: acA } = useEntityAvg('sensor.a32_pro_s5140_channel_4_current_24v_air_conditioning');
  const { value: dev24A } = useEntityAvg('sensor.a32_pro_s5140_channel_5_current_24v_24v_devices');
  const { value: inverterA } = useEntityAvg('sensor.a32_pro_s5140_channel_7_current_24v_inverter');

  // Sub-consumers (10s rolling average)
  const { value: fanW } = useEntityAvg('sensor.roof_fan_power_12v');
  const { value: heaterW } = useEntityAvg('sensor.battery_heater_power_12v');
  const { value: bedW } = useEntityAvg('sensor.bed_motor_power_24v');
  const { value: fanA } = useEntityAvg('sensor.a32_pro_s5140_channel_14_current_12v_roof_fan');
  const { value: heaterA } = useEntityAvg('sensor.a32_pro_s5140_channel_13_current_12v_battery_heater');
  const { value: bedA } = useEntityAvg('sensor.a32_pro_s5140_channel_15_current_24v_bed_motor');

  // Voltage ratio for converting 12V amps → 24V-equivalent amps
  // Fan (ch14) and heater (ch13) are measured on the 12V rail; all others are 24V
  const { value: bmsV } = useEntityNumeric('sensor.olins_van_bms_voltage');
  const { value: rail12V } = useEntityNumeric('sensor.a32_pro_smart_battery_sense_12v_voltage');
  const v12to24 = (bmsV && rail12V && bmsV > 0) ? rail12V / bmsV : 0.5;

  const srcRaw: Record<string, number> = mode === 'amps'
    ? { solar: Math.abs(solarA ?? 0), shore: Math.abs(shoreA ?? 0), alt: Math.abs(altA ?? 0) }
    : { solar: Math.abs(solarW ?? 0), shore: Math.abs(shoreW ?? 0), alt: Math.abs(altW ?? 0) };

  const conVals: Record<string, number> = mode === 'amps'
    ? { '12v': Math.abs(dev12A ?? 0), ac: Math.abs(acA ?? 0), '24v': Math.abs(dev24A ?? 0), inverter: Math.abs(inverterA ?? 0) }
    : { '12v': Math.abs(dev12W ?? 0), ac: Math.abs(acW ?? 0), '24v': Math.abs(dev24W ?? 0), inverter: Math.abs(inverterW ?? 0) };

  const namedSubVals = mode === 'amps'
    ? { fan: Math.abs(fanA ?? 0) * v12to24, heater: Math.abs(heaterA ?? 0) * v12to24, bed: Math.abs(bedA ?? 0) }
    : { fan: Math.abs(fanW ?? 0), heater: Math.abs(heaterW ?? 0), bed: Math.abs(bedW ?? 0) };

  const subVals: Record<string, number> = {
    ...namedSubVals,
    other12v: Math.max(0, conVals['12v'] - namedSubVals.fan - namedSubVals.heater),
    other24v: Math.max(0, conVals['24v'] - namedSubVals.bed),
  };

  // Battery charge / discharge
  let chg: number, dchg: number;
  if (mode === 'amps') {
    const cur = bmsCurrent ?? 0;
    chg = cur > 0 ? cur : 0;
    dchg = cur < 0 ? Math.abs(cur) : 0;
  } else {
    chg = chargingW ?? 0;
    dchg = dischargingW ?? 0;
  }

  // ─── Flow split: source → hub vs source → battery ───
  const totalSrc = Object.values(srcRaw).reduce((a, b) => a + b, 0);
  let battFrac = 0;
  if (chg > threshold && totalSrc > 0) battFrac = Math.min(1, chg / totalSrc);
  const homeFrac = 1 - battFrac;

  const srcToHub: Record<string, number> = {};
  const srcToBatt: Record<string, number> = {};
  for (const s of sourcesDef) {
    srcToHub[s.id] = srcRaw[s.id] * homeFrac;
    srcToBatt[s.id] = srcRaw[s.id] * battFrac;
  }

  const totalHome = totalSrc * homeFrac + dchg;
  const socVal = soc ?? 0;
  const socColor = socVal >= 65 ? '#16a34a' : socVal >= 30 ? '#d97706' : '#dc2626';

  // ─── Update live edge data ───
  const scale = mode === 'amps' ? 15 : 300;
  const maxSW = 4.5;

  sourcesDef.forEach((s) => {
    const v = srcToHub[s.id];
    updateEdge(`${s.id}-hub`, {
      color: s.color, value: v,
      speed: valToSpeed(v, mode), dotCount: valToDots(v, mode),
      reverse: false,
      strokeWidth: v > threshold ? Math.min(1.5 + (v / scale) * maxSW, maxSW) : 1.2,
    }, threshold);

    const vb = srcToBatt[s.id];
    updateEdge(`${s.id}-batt`, {
      color: s.color, value: vb,
      speed: valToSpeed(vb, mode), dotCount: valToDots(vb, mode),
      reverse: false,
      strokeWidth: vb > threshold ? Math.min(1.5 + (vb / scale) * maxSW, maxSW) : 1.2,
    }, threshold);
  });

  updateEdge('batt-hub', {
    color: '#ec4899', value: dchg,
    speed: valToSpeed(dchg, mode), dotCount: valToDots(dchg, mode),
    reverse: false,
    strokeWidth: dchg > threshold ? Math.min(1.5 + (dchg / scale) * maxSW, maxSW) : 1.2,
  }, threshold);

  consumersDef.forEach((c) => {
    const v = conVals[c.id];
    updateEdge(`hub-${c.id}`, {
      color: c.color, value: v,
      speed: valToSpeed(v, mode), dotCount: valToDots(v, mode),
      reverse: false,
      strokeWidth: v > threshold ? Math.min(1.5 + (v / scale) * maxSW, maxSW) : 1.2,
    }, threshold);
  });

  // Sub-consumer branch edges
  subConsumersDef.forEach((sc) => {
    const v = subVals[sc.id];
    updateEdge(`${sc.parentId}-${sc.id}`, {
      color: sc.color, value: v,
      speed: valToSpeed(v, mode), dotCount: valToDots(v, mode),
      reverse: false,
      strokeWidth: v > threshold ? Math.min(1 + (v / scale) * 3, 3) : 0.8,
    }, threshold);
  });

  // ─── SVG init ───
  const svgRef = useRef<SVGSVGElement>(null);
  const initDone = useRef(false);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || initDone.current) return;
    initDone.current = true;

    mtPaths = new Map();
    mtDots = new Map();

    for (const eDef of edgeDefs) {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', eDef.path);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', '#888');
      path.setAttribute('stroke-width', '1');
      path.setAttribute('stroke-linecap', 'round');
      path.setAttribute('opacity', '0.06');
      svg.appendChild(path);
      mtPaths.set(eDef.id, path);

      const dots: SVGCircleElement[] = [];
      for (let i = 0; i < MAX_DOTS; i++) {
        const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        c.setAttribute('r', '3');
        c.setAttribute('fill', 'none');
        c.setAttribute('opacity', '0');
        svg.appendChild(c);
        dots.push(c);
      }
      mtDots.set(eDef.id, dots);
    }

    startRAF();
    return () => { stopRAF(); mtPaths = new Map(); mtDots = new Map(); };
  }, []);

  return (
    <Card>
      <CardContent className="pt-4 relative">
        {/* Mode toggle */}
        <div className="absolute top-3 left-3 z-10 flex gap-1">
          <button
            onClick={() => setMode('amps')}
            className={cn(
              'text-[10px] px-2 py-0.5 rounded-md border transition-colors',
              mode === 'amps'
                ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                : 'bg-card text-muted-foreground border-border hover:text-foreground',
            )}
          >Amps</button>
          <button
            onClick={() => setMode('power')}
            className={cn(
              'text-[10px] px-2 py-0.5 rounded-md border transition-colors',
              mode === 'power'
                ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                : 'bg-card text-muted-foreground border-border hover:text-foreground',
            )}
          >Watts</button>
        </div>

        {/* Flow diagram */}
        <div style={{ position: 'relative', width: '100%', aspectRatio: `${VB_W}/${VB_H}`, margin: '0 auto' }}>
          <svg
            ref={svgRef}
            viewBox={`0 0 ${VB_W} ${VB_H}`}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
            preserveAspectRatio="xMidYMid meet"
          />
          <div style={{ position: 'absolute', inset: 0 }}>
            <svg viewBox={`0 0 ${VB_W} ${VB_H}`} style={{ width: '100%', height: '100%' }} preserveAspectRatio="xMidYMid meet">

              {/* Source chips */}
              {sourcesDef.map((s, i) => {
                const val = srcRaw[s.id];
                const entity = mode === 'amps' ? s.currentEntity : s.powerEntity;
                return (
                  <foreignObject key={s.id} x={SRC_X} y={SRC_YS[i]} width={CHIP_W} height={CHIP_H}>
                    <Chip def={s} val={fmt(val, decimals)} unit={unit}
                      active={val > threshold}
                      onClick={() => open(entity, s.label, unit)} />
                  </foreignObject>
                );
              })}

              {/* Home hub */}
              <foreignObject x={HUB_CX - HUB_R} y={HUB_CY - HUB_R} width={HUB_R * 2} height={HUB_R * 2}>
                <div style={{
                  width: HUB_R * 2, height: HUB_R * 2, borderRadius: '50%',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  border: `1.5px solid ${totalHome > threshold ? '#ca8a0460' : 'hsl(var(--border))'}`,
                  boxShadow: totalHome > threshold ? '0 0 8px #ca8a0420' : 'none',
                  transition: 'border-color 0.3s, box-shadow 0.3s',
                }}>
                  <Home size={11} style={{ color: totalHome > threshold ? '#ca8a04' : 'hsl(var(--muted-foreground))' }} />
                  <span style={{ fontSize: 8, fontWeight: 600, fontVariantNumeric: 'tabular-nums', marginTop: 1, color: 'hsl(var(--foreground))' }}>
                    {fmt(totalHome, decimals)} {unit}
                  </span>
                </div>
              </foreignObject>

              {/* Battery */}
              <foreignObject x={BATT_LEFT} y={BATT_TOP} width={BATT_W} height={BATT_H}>
                <div
                  style={{ width: BATT_W, height: BATT_H, position: 'relative', cursor: 'pointer' }}
                  onClick={() => open('sensor.olins_van_bms_battery', 'Battery SOC', '%')}
                >
                  <div style={{
                    width: BATT_W, height: BATT_H, borderRadius: '8px 8px 0 0',
                    border: `1.5px solid ${socColor}60`,
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    boxShadow: `0 0 5px ${socColor}15`,
                    transition: 'border-color 0.3s',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <BatteryMedium size={10} style={{ color: socColor }} />
                      <span style={{ fontSize: 9, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: socColor }}>
                        {fmt(socVal, 0)}%
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 1 }}>
                      {chg > threshold && (
                        <span style={{ fontSize: 7, fontWeight: 500, fontVariantNumeric: 'tabular-nums', color: '#16a34a' }}>
                          ↓ {fmt(chg, decimals)} {unit}
                        </span>
                      )}
                      {dchg > threshold && (
                        <span style={{ fontSize: 7, fontWeight: 500, fontVariantNumeric: 'tabular-nums', color: '#ea580c' }}>
                          ↑ {fmt(dchg, decimals)} {unit}
                        </span>
                      )}
                      {chg <= threshold && dchg <= threshold && (
                        <span style={{ fontSize: 7, color: 'hsl(var(--muted-foreground))', opacity: 0.5 }}>Idle</span>
                      )}
                    </div>
                    <div style={{
                      position: 'absolute', bottom: 0, left: 0, height: 2,
                      borderRadius: '0 0 8px 8px',
                      width: `${socVal}%`,
                      backgroundColor: socColor,
                      boxShadow: `0 0 4px ${socColor}40`,
                      transition: 'all 0.5s',
                    }} />
                  </div>
                </div>
              </foreignObject>

              {/* Consumer chips */}
              {consumersDef.map((c, i) => {
                const val = conVals[c.id];
                const entity = mode === 'amps' ? c.currentEntity : c.powerEntity;
                return (
                  <foreignObject key={c.id} x={CON_X} y={CON_YS[i]} width={CHIP_W} height={CHIP_H}>
                    <Chip def={c} val={fmt(val, decimals)} unit={unit}
                      active={val > threshold}
                      onClick={() => open(entity, c.label, unit)} />
                  </foreignObject>
                );
              })}

              {/* Sub-consumer chips (branching off parent buses) */}
              {subConsumersDef.map((sc) => {
                const val = subVals[sc.id];
                const entity = mode === 'amps' ? sc.currentEntity : sc.powerEntity;
                const active = val > threshold;
                const Icon = sc.Icon;
                const yPos = { fan: 30, heater: 52, other12v: 74, bed: 110, other24v: 132 }[sc.id] ?? 0;
                return (
                  <foreignObject key={sc.id} x={SUB_X} y={yPos} width={SUB_CHIP_W} height={SUB_CHIP_H}>
                    <div style={{ width: SUB_CHIP_W, height: SUB_CHIP_H, cursor: 'pointer' }}
                      onClick={() => open(entity, sc.label, unit)}>
                      <div style={{
                        height: '100%', borderRadius: 5,
                        border: `1px solid ${active ? `${sc.color}60` : 'hsl(var(--border))'}`,
                        padding: '1px 4px', display: 'flex', alignItems: 'center', gap: 3,
                        opacity: active ? 1 : 0.65,
                        transition: 'all 0.3s',
                      }}>
                        <Icon size={7} style={{ flexShrink: 0, color: active ? sc.color : 'hsl(var(--muted-foreground))' }} />
                        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                          <span style={{ fontSize: 6, fontWeight: 500, color: 'hsl(var(--muted-foreground))', lineHeight: 1.1, opacity: active ? 0.9 : 0.7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sc.label}</span>
                          <span style={{ fontSize: 7, fontWeight: 700, lineHeight: 1.1, fontVariantNumeric: 'tabular-nums', color: active ? sc.color : 'hsl(var(--muted-foreground))' }}>{fmt(val, decimals)} {unit}</span>
                        </div>
                      </div>
                    </div>
                  </foreignObject>
                );
              })}
            </svg>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
