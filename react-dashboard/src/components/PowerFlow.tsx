import { useState, useEffect, useRef } from 'react';
import { getSmoothStepPath, Position } from '@xyflow/react';
import { Card, CardContent } from '@/components/ui/card';
import { useEntityNumeric } from '@/hooks/useEntity';
import { useHistoryDialog } from '@/components/EntityHistoryDialog';
import { fmt, cn } from '@/lib/utils';
import {
  Sun, Plug, Car, Lightbulb, Snowflake, Cpu, Zap, Home, BatteryMedium,
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

// ─── Layout constants (px in SVG viewBox) ───

const CHIP_W = 120;
const CHIP_H = 56;
const HUB_SIZE = 90;
const BATT_W = 100;
const BATT_H = 72;

const HUB_X = 260;  // center
const HUB_Y = 175;  // center
const BATT_X = HUB_X;
const BATT_Y = 340;

const SRC_X = 10;
const CON_X = 450;

const VB_W = 580;
const VB_H = 420;

const MAX_DOTS = 3;

function centerPositions(count: number, centerY: number, spacing: number, itemH: number): number[] {
  const total = (count - 1) * spacing;
  const start = centerY - total / 2;
  return Array.from({ length: count }, (_, i) => start + i * spacing - itemH / 2);
}

const srcYs = centerPositions(sourcesDef.length, HUB_Y, 75, CHIP_H);
const conYs = centerPositions(consumersDef.length, HUB_Y, 68, CHIP_H);

// ─── Precompute all edge paths (static geometry) ───

interface EdgeDef {
  id: string;
  path: string;
  defaultColor: string;
}

function computePath(
  sx: number, sy: number, sp: Position,
  tx: number, ty: number, tp: Position,
): string {
  const [p] = getSmoothStepPath({
    sourceX: sx, sourceY: sy, sourcePosition: sp,
    targetX: tx, targetY: ty, targetPosition: tp,
    borderRadius: 16,
  });
  return p;
}

const edgeDefs: EdgeDef[] = [];

// Sources → Hub (source handle = right edge of chip, target = left side of hub spread)
sourcesDef.forEach((s, i) => {
  const sx = SRC_X + CHIP_W;
  const sy = srcYs[i] + CHIP_H / 2;
  const hubLeft = HUB_X - HUB_SIZE / 2;
  const hubTop = HUB_Y - HUB_SIZE / 2;
  const tx = hubLeft;
  const ty = hubTop + HUB_SIZE * (0.25 + i * 0.25);
  edgeDefs.push({
    id: `${s.id}-hub`,
    path: computePath(sx, sy, Position.Right, tx, ty, Position.Left),
    defaultColor: s.color,
  });
});

// Hub → Consumers (source = right side of hub spread, target = left edge of chip)
consumersDef.forEach((c, i) => {
  const hubRight = HUB_X + HUB_SIZE / 2;
  const hubTop = HUB_Y - HUB_SIZE / 2;
  const sx = hubRight;
  const sy = hubTop + HUB_SIZE * (0.13 + i * 0.25);
  const tx = CON_X;
  const ty = conYs[i] + CHIP_H / 2;
  edgeDefs.push({
    id: `hub-${c.id}`,
    path: computePath(sx, sy, Position.Right, tx, ty, Position.Left),
    defaultColor: c.color,
  });
});

// Hub → Battery
edgeDefs.push({
  id: 'batt-edge',
  path: computePath(HUB_X, HUB_Y + HUB_SIZE / 2, Position.Bottom, BATT_X, BATT_Y - BATT_H / 2, Position.Top),
  defaultColor: '#334155',
});

// ─── Module-level animation stores ───

interface AnimState {
  phases: number[];
  lastTime: number;
}

interface EdgeLive {
  color: string;
  active: boolean;
  speed: number;
  dotCount: number;
  reverse: boolean;
  strokeWidth: number;
}

const edgeAnimStore = new Map<string, AnimState>();
const edgeLiveStore = new Map<string, EdgeLive>();

function getAnim(id: string, dotCount: number): AnimState {
  let s = edgeAnimStore.get(id);
  if (!s) {
    s = { phases: Array.from({ length: MAX_DOTS }, (_, i) => i / Math.max(dotCount, MAX_DOTS)), lastTime: 0 };
    edgeAnimStore.set(id, s);
  }
  return s;
}

function getLive(id: string): EdgeLive {
  return edgeLiveStore.get(id) ?? { color: '#888', active: false, speed: 3, dotCount: 0, reverse: false, strokeWidth: 1 };
}

// Map value → speed + dot count
function valueToDur(val: number, mode: Mode): number {
  const maxVal = mode === 'amps' ? 20 : 500;
  return 4 - Math.min(val / maxVal, 1) * 3;
}
function valueToDotCount(val: number, mode: Mode): number {
  const frac = Math.min(val / (mode === 'amps' ? 15 : 400), 1);
  return frac > 0.5 ? 3 : frac > 0.15 ? 2 : 1;
}

// ─── Single global RAF loop for all edges ───

let rafId = 0;
let rafRunning = false;
const pathEls = new Map<string, SVGPathElement>();
const dotEls = new Map<string, SVGCircleElement[]>();

function startRAF() {
  if (rafRunning) return;
  rafRunning = true;

  function animate(now: number) {
    for (const eDef of edgeDefs) {
      const { id } = eDef;
      const live = getLive(id);
      const anim = getAnim(id, live.dotCount);
      const dt = anim.lastTime === 0 ? 0 : Math.min((now - anim.lastTime) / 1000, 0.1);
      anim.lastTime = now;

      // Update path
      const pathEl = pathEls.get(id);
      if (pathEl) {
        pathEl.setAttribute('stroke', live.color);
        pathEl.setAttribute('stroke-width', String(live.strokeWidth));
        pathEl.setAttribute('opacity', live.active ? '0.25' : '0.06');
      }

      // Update dots — enforce equal spacing from lead dot
      const dots = dotEls.get(id);
      if (!dots || !pathEl) continue;
      const totalLen = pathEl.getTotalLength();
      const increment = live.speed > 0 ? dt / live.speed : 0;

      // Advance only the lead dot; others are derived
      if (live.active && live.dotCount > 0) {
        anim.phases[0] = live.reverse
          ? ((anim.phases[0] - increment) % 1 + 1) % 1
          : (anim.phases[0] + increment) % 1;
      }

      const spacing = 1 / Math.max(live.dotCount, 1);
      for (let i = 0; i < MAX_DOTS; i++) {
        const c = dots[i];
        if (!c) continue;
        if (!live.active || i >= live.dotCount) {
          c.setAttribute('opacity', '0');
          continue;
        }
        const phase = ((anim.phases[0] + i * spacing) % 1 + 1) % 1;
        const pt = pathEl.getPointAtLength(phase * totalLen);
        c.setAttribute('cx', String(pt.x));
        c.setAttribute('cy', String(pt.y));
        c.setAttribute('fill', live.color);
        c.setAttribute('opacity', '0.8');
      }
    }
    rafId = requestAnimationFrame(animate);
  }

  rafId = requestAnimationFrame(animate);
}

function stopRAF() {
  rafRunning = false;
  cancelAnimationFrame(rafId);
}

// ─── Chip node (source / consumer) ───

function Chip({ def, val, unit, active, onClick }: {
  def: NodeDef; val: string; unit: string; active: boolean; onClick: () => void;
}) {
  const Icon = def.Icon;
  return (
    <div
      style={{ width: CHIP_W, height: CHIP_H, cursor: 'pointer' }}
      onClick={onClick}
    >
      <div style={{
        height: '100%', borderRadius: 12,
        border: `2px solid ${active ? `${def.color}70` : 'hsl(var(--border))'}`,
        padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 10,
        opacity: active ? 1 : 0.5,
        boxShadow: active ? `0 0 10px ${def.color}20` : 'none',
        transition: 'all 0.3s',
      }}>
        <Icon size={18} style={{ flexShrink: 0, color: active ? def.color : 'hsl(var(--muted-foreground))' }} />
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <span style={{
            fontSize: 11, fontWeight: 500, color: 'hsl(var(--muted-foreground))', lineHeight: 1.2,
            opacity: active ? 0.9 : 0.5,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{def.label}</span>
          <span style={{
            fontSize: 15, fontWeight: 700, lineHeight: 1.2,
            fontVariantNumeric: 'tabular-nums',
            color: active ? def.color : 'hsl(var(--muted-foreground))',
          }}>{val} {unit}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───

export function PowerFlow() {
  const [mode, setMode] = useState<Mode>('amps');
  const { open } = useHistoryDialog();
  const unit = mode === 'amps' ? 'A' : 'W';
  const threshold = mode === 'amps' ? 0.05 : 2;
  const decimals = mode === 'amps' ? 1 : 0;

  // Battery
  const { value: soc } = useEntityNumeric('sensor.olins_van_bms_battery');
  const { value: chargingW } = useEntityNumeric('sensor.battery_charging');
  const { value: dischargingW } = useEntityNumeric('sensor.battery_discharging');
  const { value: bmsCurrent } = useEntityNumeric('sensor.olins_van_bms_current');

  // Sources (power + current)
  const { value: solarW } = useEntityNumeric('sensor.total_mppt_pv_power');
  const { value: shoreW } = useEntityNumeric('sensor.shore_power_charger_power_24v');
  const { value: altW } = useEntityNumeric('sensor.alternator_charger_power_24v');
  const { value: solarA } = useEntityNumeric('sensor.total_mppt_output_current');
  const { value: shoreA } = useEntityNumeric('sensor.a32_pro_s5140_channel_16_current_24v_shore_power_charger');
  const { value: altA } = useEntityNumeric('sensor.a32_pro_s5140_channel_8_current_24v_alternator_charger');

  // Consumers (power + current)
  const { value: dev12W } = useEntityNumeric('sensor.all_12v_devices_power_24v');
  const { value: acW } = useEntityNumeric('sensor.air_conditioning_power_24v');
  const { value: dev24W } = useEntityNumeric('sensor.all_24v_devices_power_24v');
  const { value: inverterW } = useEntityNumeric('sensor.inverter_power_24v');
  const { value: dev12A } = useEntityNumeric('sensor.a32_pro_s5140_channel_6_current_24v_12v_devices');
  const { value: acA } = useEntityNumeric('sensor.a32_pro_s5140_channel_4_current_24v_air_conditioning');
  const { value: dev24A } = useEntityNumeric('sensor.a32_pro_s5140_channel_5_current_24v_24v_devices');
  const { value: inverterA } = useEntityNumeric('sensor.a32_pro_s5140_channel_7_current_24v_inverter');

  const srcVals: Record<string, number> = mode === 'amps'
    ? { solar: Math.abs(solarA ?? 0), shore: Math.abs(shoreA ?? 0), alt: Math.abs(altA ?? 0) }
    : { solar: Math.abs(solarW ?? 0), shore: Math.abs(shoreW ?? 0), alt: Math.abs(altW ?? 0) };

  const conVals: Record<string, number> = mode === 'amps'
    ? { '12v': Math.abs(dev12A ?? 0), ac: Math.abs(acA ?? 0), '24v': Math.abs(dev24A ?? 0), inverter: Math.abs(inverterA ?? 0) }
    : { '12v': Math.abs(dev12W ?? 0), ac: Math.abs(acW ?? 0), '24v': Math.abs(dev24W ?? 0), inverter: Math.abs(inverterW ?? 0) };

  let chg: number, dchg: number;
  if (mode === 'amps') {
    const cur = bmsCurrent ?? 0;
    chg = cur > 0 ? cur : 0;
    dchg = cur < 0 ? Math.abs(cur) : 0;
  } else {
    chg = chargingW ?? 0;
    dchg = dischargingW ?? 0;
  }

  const totalHome = Object.values(conVals).reduce((a, b) => a + b, 0);
  const socVal = soc ?? 0;
  const socColor = socVal >= 65 ? '#16a34a' : socVal >= 30 ? '#d97706' : '#dc2626';

  // ─── Update live edge data (RAF reads from here — no React rendering involved) ───
  const scale = mode === 'amps' ? 15 : 300;
  const maxSW = 4.5;

  sourcesDef.forEach((s) => {
    const val = srcVals[s.id];
    const active = val > threshold;
    edgeLiveStore.set(`${s.id}-hub`, {
      color: s.color, active,
      speed: valueToDur(val, mode), dotCount: valueToDotCount(val, mode),
      reverse: false,
      strokeWidth: active ? Math.min(1.5 + (val / scale) * maxSW, maxSW) : 1,
    });
  });

  consumersDef.forEach((c) => {
    const val = conVals[c.id];
    const active = val > threshold;
    edgeLiveStore.set(`hub-${c.id}`, {
      color: c.color, active,
      speed: valueToDur(val, mode), dotCount: valueToDotCount(val, mode),
      reverse: false,
      strokeWidth: active ? Math.min(1.5 + (val / scale) * maxSW, maxSW) : 1,
    });
  });

  const battVal = Math.max(chg, dchg);
  const battActive = chg > threshold || dchg > threshold;
  edgeLiveStore.set('batt-edge', {
    color: chg > threshold ? '#16a34a' : dchg > threshold ? '#ea580c' : 'hsl(var(--border))',
    active: battActive,
    speed: valueToDur(battVal, mode),
    dotCount: battActive ? valueToDotCount(battVal, mode) : 0,
    reverse: dchg > threshold,
    strokeWidth: battActive ? Math.min(1.5 + (battVal / scale) * maxSW, maxSW) : 1,
  });

  // SVG ref — mount paths + dots once, then never touch via React
  const svgRef = useRef<SVGSVGElement>(null);
  const svgInitRef = useRef(false);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || svgInitRef.current) return;
    svgInitRef.current = true;

    // Create all edge SVG elements imperatively (React never touches these)
    for (const eDef of edgeDefs) {
      // Path
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', eDef.path);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', '#888');
      path.setAttribute('stroke-width', '1');
      path.setAttribute('stroke-linecap', 'round');
      path.setAttribute('opacity', '0.07');
      svg.appendChild(path);
      pathEls.set(eDef.id, path);

      // Dots
      const dots: SVGCircleElement[] = [];
      for (let i = 0; i < MAX_DOTS; i++) {
        const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        c.setAttribute('r', '4');
        c.setAttribute('fill', 'none');
        c.setAttribute('opacity', '0');
        svg.appendChild(c);
        dots.push(c);
      }
      dotEls.set(eDef.id, dots);
    }

    startRAF();
    return () => stopRAF();
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

        {/* Flow diagram — SVG edges + HTML nodes layered */}
        <div style={{ position: 'relative', width: '100%', aspectRatio: `${VB_W}/${VB_H}`, margin: '0 auto' }}>
          {/* SVG layer (behind nodes) — imperatively managed, never re-rendered */}
          <svg
            ref={svgRef}
            viewBox={`0 0 ${VB_W} ${VB_H}`}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
            preserveAspectRatio="xMidYMid meet"
          />

          {/* HTML node layer (scales with SVG via same aspect ratio) */}
          <div style={{
            position: 'absolute', inset: 0,
            /* Use SVG viewBox coordinates via scale transform */
          }}>
            <svg viewBox={`0 0 ${VB_W} ${VB_H}`} style={{ width: '100%', height: '100%' }} preserveAspectRatio="xMidYMid meet">
              {/* foreignObject for each node so HTML scales with SVG viewBox */}

              {/* Source chips */}
              {sourcesDef.map((s, i) => {
                const val = srcVals[s.id];
                const entity = mode === 'amps' ? s.currentEntity : s.powerEntity;
                return (
                  <foreignObject key={s.id} x={SRC_X} y={srcYs[i]} width={CHIP_W} height={CHIP_H}>
                    <Chip def={s} val={fmt(val, decimals)} unit={unit}
                      active={val > threshold}
                      onClick={() => open(entity, s.label, unit)} />
                  </foreignObject>
                );
              })}

              {/* Hub */}
              <foreignObject x={HUB_X - HUB_SIZE / 2} y={HUB_Y - HUB_SIZE / 2} width={HUB_SIZE} height={HUB_SIZE}>
                <div style={{
                  width: HUB_SIZE, height: HUB_SIZE, borderRadius: '50%',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  border: `2px solid ${totalHome > threshold ? '#ca8a0460' : 'hsl(var(--border))'}`,
                  boxShadow: totalHome > threshold ? '0 0 12px #ca8a0420' : 'none',
                  transition: 'border-color 0.3s, box-shadow 0.3s',
                }}>
                  <Home size={18} style={{ color: totalHome > threshold ? '#ca8a04' : 'hsl(var(--muted-foreground))' }} />
                  <span style={{ fontSize: 12, fontWeight: 600, fontVariantNumeric: 'tabular-nums', marginTop: 2, color: 'hsl(var(--foreground))' }}>
                    {fmt(totalHome, decimals)} {unit}
                  </span>
                </div>
              </foreignObject>

              {/* Battery */}
              <foreignObject x={BATT_X - BATT_W / 2} y={BATT_Y - BATT_H / 2} width={BATT_W} height={BATT_H}>
                <div
                  style={{ width: BATT_W, height: BATT_H, position: 'relative', cursor: 'pointer' }}
                  onClick={() => open('sensor.olins_van_bms_battery', 'Battery SOC', '%')}
                >
                  <div style={{
                    width: BATT_W, height: BATT_H, borderRadius: '12px 12px 0 0',
                    border: `2px solid ${socColor}60`,
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    boxShadow: `0 0 8px ${socColor}15`,
                    transition: 'border-color 0.3s',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <BatteryMedium size={16} style={{ color: socColor }} />
                      <span style={{ fontSize: 14, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: socColor }}>
                        {fmt(socVal, 0)}%
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 2 }}>
                      {chg > threshold && (
                        <span style={{ fontSize: 10, fontWeight: 500, fontVariantNumeric: 'tabular-nums', color: '#16a34a' }}>
                          ↓ {fmt(chg, decimals)} {unit}
                        </span>
                      )}
                      {dchg > threshold && (
                        <span style={{ fontSize: 10, fontWeight: 500, fontVariantNumeric: 'tabular-nums', color: '#ea580c' }}>
                          ↑ {fmt(dchg, decimals)} {unit}
                        </span>
                      )}
                      {chg <= threshold && dchg <= threshold && (
                        <span style={{ fontSize: 10, color: 'hsl(var(--muted-foreground))', opacity: 0.5 }}>Idle</span>
                      )}
                    </div>
                    <div style={{
                      position: 'absolute', bottom: 0, left: 0, height: 3,
                      borderRadius: '0 0 12px 12px',
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
                  <foreignObject key={c.id} x={CON_X} y={conYs[i]} width={CHIP_W} height={CHIP_H}>
                    <Chip def={c} val={fmt(val, decimals)} unit={unit}
                      active={val > threshold}
                      onClick={() => open(entity, c.label, unit)} />
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
