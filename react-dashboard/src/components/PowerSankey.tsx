import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEntityNumeric } from '@/hooks/useEntity';
import { useHistoryDialog } from '@/components/EntityHistoryDialog';
import { fmt } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Activity } from 'lucide-react';

// ─── Entity definitions (power + current pairs) ───

interface NodeDef {
  id: string;
  label: string;
  powerEntity: string;
  currentEntity: string;
  color: string;
}

const sources: NodeDef[] = [
  { id: 'mppt1', label: 'MPPT 1', powerEntity: 'sensor.a32_pro_mppt1_pv_power', currentEntity: 'sensor.a32_pro_mppt1_output_current', color: '#eab308' },
  { id: 'mppt2', label: 'MPPT 2', powerEntity: 'sensor.a32_pro_mppt2_pv_power', currentEntity: 'sensor.a32_pro_mppt2_output_current', color: '#f59e0b' },
  { id: 'alt', label: 'Alternator', powerEntity: 'sensor.alternator_charger_power_24v', currentEntity: 'sensor.a32_pro_s5140_channel_8_current_24v_alternator_charger', color: '#8b5cf6' },
  { id: 'shore', label: 'Shore', powerEntity: 'sensor.shore_power_charger_power_24v', currentEntity: 'sensor.a32_pro_s5140_channel_16_current_24v_shore_power_charger', color: '#22c55e' },
];

const consumers: NodeDef[] = [
  { id: 'ac', label: 'A/C', powerEntity: 'sensor.air_conditioning_power_24v', currentEntity: 'sensor.a32_pro_s5140_channel_4_current_24v_air_conditioning', color: '#06b6d4' },
  { id: 'inverter', label: 'Inverter', powerEntity: 'sensor.inverter_power_24v', currentEntity: 'sensor.a32_pro_s5140_channel_7_current_24v_inverter', color: '#f97316' },
  { id: '24v', label: '24V Devices', powerEntity: 'sensor.all_24v_devices_power_24v', currentEntity: 'sensor.a32_pro_s5140_channel_5_current_24v_24v_devices', color: '#3b82f6' },
  { id: '12v', label: '12V Devices', powerEntity: 'sensor.all_12v_devices_power_24v', currentEntity: 'sensor.a32_pro_s5140_channel_6_current_24v_12v_devices', color: '#6366f1' },
  { id: 'fan', label: 'Roof Fan', powerEntity: 'sensor.roof_fan_power_12v', currentEntity: 'sensor.a32_pro_s5140_channel_14_current_12v_roof_fan', color: '#14b8a6' },
  { id: 'heater', label: 'Batt Heater', powerEntity: 'sensor.battery_heater_power_12v', currentEntity: 'sensor.a32_pro_s5140_channel_13_current_12v_battery_heater', color: '#ef4444' },
  { id: 'bed', label: 'Bed Motor', powerEntity: 'sensor.bed_motor_power_24v', currentEntity: 'sensor.a32_pro_s5140_channel_15_current_24v_bed_motor', color: '#a855f7' },
];

// ─── SVG Sankey ───

type Mode = 'power' | 'amps';

interface FlowNode {
  id: string;
  label: string;
  entity: string;
  value: number;
  color: string;
}

interface SankeyLayout {
  sourceNodes: (FlowNode & { y: number; h: number })[];
  consumerNodes: (FlowNode & { y: number; h: number })[];
  batteryY: number;
  batteryH: number;
  chargeFlows: { from: FlowNode & { y: number; h: number }; toY: number; toH: number; value: number }[];
  dischargeFlows: { to: FlowNode & { y: number; h: number }; fromY: number; fromH: number; value: number }[];
  totalCharge: number;
  totalDischarge: number;
  soc: number;
}

function useFlowData(mode: Mode) {
  const vals: Record<string, { value: number | null; entity: string }> = {};
  // Sources
  for (const s of sources) {
    const entity = mode === 'amps' ? s.currentEntity : s.powerEntity;
    const { value } = useEntityNumeric(entity);
    vals[s.id] = { value, entity };
  }
  // Consumers
  for (const c of consumers) {
    const entity = mode === 'amps' ? c.currentEntity : c.powerEntity;
    const { value } = useEntityNumeric(entity);
    vals[c.id] = { value, entity };
  }
  // Battery
  const { value: soc } = useEntityNumeric('sensor.olins_van_bms_battery');
  // Power mode: use template sensors; Amps mode: use BMS current directly
  const { value: chargingPower } = useEntityNumeric('sensor.battery_charging');
  const { value: dischargingPower } = useEntityNumeric('sensor.battery_discharging');
  const { value: bmsCurrent } = useEntityNumeric('sensor.olins_van_bms_current');

  let charging: number;
  let discharging: number;
  if (mode === 'amps') {
    // BMS current: positive = charging, negative = discharging
    const current = bmsCurrent ?? 0;
    charging = current > 0 ? current : 0;
    discharging = current < 0 ? Math.abs(current) : 0;
  } else {
    charging = chargingPower ?? 0;
    discharging = dischargingPower ?? 0;
  }

  return { vals, soc: soc ?? 0, charging, discharging };
}

const SVG_W = 520;
const SVG_H = 380;
const COL_LEFT = 0;
const COL_MID = 210;
const COL_RIGHT = 370;
const NODE_W = 14;
const LABEL_PAD = 6;
const FIXED_NODE_H = 28;   // Fixed height per device node
const NODE_GAP = 6;        // Gap between fixed nodes
const MIN_FLOW_W = 1.5;
const MAX_FLOW_W = 36;     // Max ribbon thickness

export function PowerSankey() {
  const [mode, setMode] = useState<Mode>('amps');
  const { vals, soc, charging, discharging } = useFlowData(mode);
  const { open } = useHistoryDialog();
  const unit = mode === 'amps' ? 'A' : 'W';
  const threshold = mode === 'amps' ? 0.05 : 2;

  const layout = useMemo((): SankeyLayout => {
    const activeSourcesRaw = sources
      .map((s) => ({ ...s, entity: vals[s.id]?.entity ?? s.powerEntity, value: Math.abs(vals[s.id]?.value ?? 0) }));

    const activeConsumersRaw = consumers
      .map((c) => ({ ...c, entity: vals[c.id]?.entity ?? c.powerEntity, value: Math.abs(vals[c.id]?.value ?? 0) }));

    const totalCharge = charging;
    const totalDischarge = discharging;

    // Fixed-position layout — nodes are always in the same spot
    const sourceNodes = layoutFixedNodes(activeSourcesRaw);
    const consumerNodes = layoutFixedNodes(activeConsumersRaw);

    // Scale for flow ribbon thickness only
    const maxVal = Math.max(
      ...activeSourcesRaw.map((n) => n.value),
      ...activeConsumersRaw.map((n) => n.value),
      1,
    );
    const flowScale = MAX_FLOW_W / maxVal;

    // Battery bar (center) — fixed size
    const batteryH = Math.max(60, sourceNodes.length * FIXED_NODE_H + (sourceNodes.length - 1) * NODE_GAP);
    const batteryY = (SVG_H - batteryH) / 2;

    // Charge flows: source → battery (ribbons stacked on battery side)
    let chargeY = batteryY;
    const chargeFlows = sourceNodes.map((src) => {
      const h = src.value > 0 ? Math.max(MIN_FLOW_W, src.value * flowScale) : 0;
      const flow = { from: src, toY: chargeY, toH: h, value: src.value };
      chargeY += h;
      return flow;
    });

    // Discharge flows: battery → consumers (ribbons stacked on battery side)
    let dischY = batteryY;
    const dischargeFlows = consumerNodes.map((con) => {
      const h = con.value > 0 ? Math.max(MIN_FLOW_W, con.value * flowScale) : 0;
      const flow = { to: con, fromY: dischY, fromH: h, value: con.value };
      dischY += h;
      return flow;
    });

    return { sourceNodes, consumerNodes, batteryY, batteryH, chargeFlows, dischargeFlows, totalCharge, totalDischarge, soc };
  }, [vals, soc, charging, discharging, threshold]);

  const { sourceNodes, consumerNodes, batteryY, batteryH, chargeFlows, dischargeFlows, totalCharge, totalDischarge } = layout;

  // SOC color
  const socColor = soc >= 65 ? '#22c55e' : soc >= 30 ? '#f59e0b' : '#ef4444';

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity className="h-4 w-4" />
          Power Flow
          <div className="ml-auto flex gap-1">
            <button
              onClick={() => setMode('amps')}
              className={cn(
                'text-[10px] px-2 py-0.5 rounded transition-colors',
                mode === 'amps'
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'bg-muted text-muted-foreground hover:text-foreground',
              )}
            >
              Amps
            </button>
            <button
              onClick={() => setMode('power')}
              className={cn(
                'text-[10px] px-2 py-0.5 rounded transition-colors',
                mode === 'power'
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'bg-muted text-muted-foreground hover:text-foreground',
              )}
            >
              Watts
            </button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          className="w-full"
          style={{ minWidth: 320, maxHeight: 400 }}
        >
          {/* ─── Charge flows (source → battery) ─── */}
          {chargeFlows.map((f) => {
            if (f.value <= 0) return null;
            // Ribbon exits from vertical center of the fixed-height source node
            const srcMid = f.from.y + f.from.h / 2;
            return (
              <path
                key={f.from.id}
                d={flowPath(
                  COL_LEFT + NODE_W, srcMid - f.toH / 2, f.toH,
                  COL_MID, f.toY, f.toH,
                )}
                fill={f.from.color}
                opacity={0.25}
                className="transition-opacity hover:opacity-50 cursor-pointer"
                onClick={() => open(f.from.entity, f.from.label, unit)}
              />
            );
          })}

          {/* ─── Discharge flows (battery → consumers) ─── */}
          {dischargeFlows.map((f) => {
            if (f.value <= 0) return null;
            // Ribbon enters at vertical center of the fixed-height consumer node
            const conMid = f.to.y + f.to.h / 2;
            return (
              <path
                key={f.to.id}
                d={flowPath(
                  COL_MID + NODE_W, f.fromY, f.fromH,
                  COL_RIGHT, conMid - f.fromH / 2, f.fromH,
                )}
                fill={f.to.color}
                opacity={0.25}
                className="transition-opacity hover:opacity-50 cursor-pointer"
                onClick={() => open(f.to.entity, f.to.label, unit)}
              />
            );
          })}

          {/* ─── Source nodes (left) ─── */}
          {sourceNodes.map((n) => (
            <g key={n.id} className="cursor-pointer" onClick={() => open(n.entity, n.label, unit)} opacity={n.value <= threshold ? 0.35 : 1}>
              <rect x={COL_LEFT} y={n.y} width={NODE_W} height={FIXED_NODE_H} rx={3} fill={n.color} />
              <text
                x={COL_LEFT + NODE_W + LABEL_PAD}
                y={n.y + FIXED_NODE_H / 2 - 6}
                dominantBaseline="central"
                className="fill-foreground"
                fontSize={11}
                fontWeight={500}
              >
                {n.label}
              </text>
              <text
                x={COL_LEFT + NODE_W + LABEL_PAD}
                y={n.y + FIXED_NODE_H / 2 + 7}
                dominantBaseline="central"
                className="fill-muted-foreground"
                fontSize={10}
              >
                {fmt(n.value, mode === 'amps' ? 1 : 0)}{unit}
              </text>
            </g>
          ))}

          {/* ─── Battery (center) ─── */}
          <g>
            {/* Battery outline */}
            <rect
              x={COL_MID}
              y={batteryY}
              width={NODE_W}
              height={batteryH}
              rx={3}
              fill="hsl(var(--muted))"
              stroke="hsl(var(--border))"
              strokeWidth={1}
            />
            {/* SOC fill */}
            <rect
              x={COL_MID + 1}
              y={batteryY + batteryH * (1 - soc / 100)}
              width={NODE_W - 2}
              height={batteryH * (soc / 100)}
              rx={2}
              fill={socColor}
              opacity={0.6}
            />
            {/* Battery label */}
            <text
              x={COL_MID + NODE_W / 2}
              y={batteryY - 8}
              textAnchor="middle"
              className="fill-foreground"
              fontSize={11}
              fontWeight={600}
            >
              Battery
            </text>
            <text
              x={COL_MID + NODE_W / 2}
              y={batteryY + batteryH + 16}
              textAnchor="middle"
              className="fill-muted-foreground"
              fontSize={10}
            >
              {fmt(soc, 0)}%
            </text>
            {/* Charge/discharge labels */}
            {totalCharge > threshold && (
              <text
                x={COL_MID - 4}
                y={batteryY + batteryH / 2 - 6}
                textAnchor="end"
                fill="#22c55e"
                fontSize={10}
                fontWeight={500}
              >
                +{fmt(totalCharge, mode === 'amps' ? 1 : 0)}{unit}
              </text>
            )}
            {totalDischarge > threshold && (
              <text
                x={COL_MID + NODE_W + 4}
                y={batteryY + batteryH / 2 - 6}
                textAnchor="start"
                fill="#f97316"
                fontSize={10}
                fontWeight={500}
              >
                −{fmt(totalDischarge, mode === 'amps' ? 1 : 0)}{unit}
              </text>
            )}
          </g>

          {/* ─── Consumer nodes (right) ─── */}
          {consumerNodes.map((n) => (
            <g key={n.id} className="cursor-pointer" onClick={() => open(n.entity, n.label, unit)} opacity={n.value <= threshold ? 0.35 : 1}>
              <rect x={COL_RIGHT} y={n.y} width={NODE_W} height={FIXED_NODE_H} rx={3} fill={n.color} />
              <text
                x={COL_RIGHT + NODE_W + LABEL_PAD}
                y={n.y + FIXED_NODE_H / 2 - 6}
                dominantBaseline="central"
                className="fill-foreground"
                fontSize={11}
                fontWeight={500}
              >
                {n.label}
              </text>
              <text
                x={COL_RIGHT + NODE_W + LABEL_PAD}
                y={n.y + FIXED_NODE_H / 2 + 7}
                dominantBaseline="central"
                className="fill-muted-foreground"
                fontSize={10}
              >
                {fmt(n.value, mode === 'amps' ? 1 : 0)}{unit}
              </text>
            </g>
          ))}
        </svg>
      </CardContent>
    </Card>
  );
}

// ─── Helpers ───

function layoutFixedNodes<T>(
  nodes: T[],
): (T & { y: number; h: number })[] {
  const totalH = nodes.length * FIXED_NODE_H + Math.max(0, nodes.length - 1) * NODE_GAP;
  let y = (SVG_H - totalH) / 2;
  return nodes.map((n) => {
    const positioned = { ...n, y, h: FIXED_NODE_H };
    y += FIXED_NODE_H + NODE_GAP;
    return positioned;
  });
}

function flowPath(
  x0: number, y0: number, h0: number,
  x1: number, y1: number, h1: number,
): string {
  const cx = (x0 + x1) / 2;
  return [
    `M${x0},${y0}`,
    `C${cx},${y0} ${cx},${y1} ${x1},${y1}`,
    `L${x1},${y1 + h1}`,
    `C${cx},${y1 + h1} ${cx},${y0 + h0} ${x0},${y0 + h0}`,
    'Z',
  ].join(' ');
}
