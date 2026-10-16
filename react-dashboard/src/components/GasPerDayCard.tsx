import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEntity, useEntityNumeric } from '@/hooks/useEntity';
import { fmt, cn } from '@/lib/utils';
import { Coins } from 'lucide-react';
import { SparklineStat } from '@/components/ClickableValue';
import { useHistoryDialog } from '@/components/EntityHistoryDialog';

// One whole day from sensor.gas_cost_per_day_7d's `days` attribute
// (template/gas_living.yaml): HA's days, oldest first.
interface GasDay {
  date: string;
  km: number;
  engine_l: number;
  heater_h: number;
  alt_kwh: number;
  cad: number;
}

interface GasSummary {
  engine_l_per_day: number;
  engine_cad_per_day: number;
  heater_h_per_day: number;
  heater_l_per_day: number;
  heater_cad_per_day: number;
  alt_kwh_per_day: number;
  charging_cad_per_day: number;
  km_per_day: number;
}

const num = (v: unknown): number | null => {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : null;
};
const cad = (v: number | null | undefined, decimals = 2) => (v != null && Number.isFinite(v) ? `$${v.toFixed(decimals)}` : '—');
const WEEKDAY = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

/**
 * What living in the van costs in gas, per day: the engine's fuel (the OBD
 * estimate) plus the Espar heater's, at today's GasBuddy price. The 7-day
 * figures are whole days from HA's long-term statistics; today's count from
 * midnight. "Charging" is the estimated share of the engine's fuel that went
 * into the house battery — part of the driving figure, not extra — and the
 * per-10 % figure is the same estimate for a tenth of the pack. Everything
 * comes from template/gas_living.yaml, so the card just reads sensors.
 */
export function GasPerDayCard() {
  const perDay = useEntity('sensor.gas_cost_per_day_7d');
  const { value: perDayCad } = useEntityNumeric('sensor.gas_cost_per_day_7d');
  const today = useEntity('sensor.gas_cost_today');
  const { value: todayCad } = useEntityNumeric('sensor.gas_cost_today');
  const { value: per10 } = useEntityNumeric('sensor.charging_gas_per_10_percent');
  const { open } = useHistoryDialog();

  const summary = (perDay?.attributes?.summary ?? null) as Partial<GasSummary> | null;
  const days = (Array.isArray(perDay?.attributes?.days) ? perDay!.attributes.days : []) as GasDay[];
  const todayL = num(today?.attributes?.engine_l);
  const todayHeaterL = num(today?.attributes?.heater_l);
  const todayHeaterH = num(today?.attributes?.heater_h);
  const todayKm = num(today?.attributes?.km);
  const price = num(perDay?.attributes?.price_used);
  const maxDay = days.reduce((m, d) => Math.max(m, num(d.cad) ?? 0), 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Coins className="h-4 w-4" />
          Gas per day
          <div
            className="ml-auto flex cursor-pointer items-baseline gap-1 rounded-md px-1 transition-colors hover:bg-muted/50"
            title="Engine + heater fuel per day, averaged over the last 7 whole days, at today's price — tap for history"
            onClick={() => open('sensor.gas_cost_per_day_7d', 'Gas per Day (7-day average)', 'CAD/d')}
          >
            <span className="text-2xl font-bold tabular-nums">{cad(perDayCad, 0)}</span>
            <span className="text-xs text-muted-foreground">/day</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <SparklineStat
          entityId="sensor.gas_cost_today"
          label="Today"
          value={cad(todayCad)}
          unit=""
          color="#f59e0b"
          hours={24}
          title={`Since midnight: ${fmt(todayL, 1)} L driving${todayKm != null ? ` (${fmt(todayKm, 0)} km)` : ''} + ${fmt(todayHeaterL, 1)} L heater (${fmt(todayHeaterH, 1)} h)`}
        />
        <Row
          label="Driving, 7 d"
          value={cad(summary?.engine_cad_per_day)}
          detail={`${fmt(summary?.engine_l_per_day, 1)} L · ${fmt(summary?.km_per_day, 0)} km a day`}
          title="The engine's fuel per day (OBD estimate; idling reads low), at today's price"
        />
        <Row
          label="Heater, 7 d"
          value={cad(summary?.heater_cad_per_day)}
          detail={`${fmt(summary?.heater_h_per_day, 1)} h · ${fmt(summary?.heater_l_per_day, 1)} L a day`}
          title="The Espar's fuel per day: 0.25 L per hour of on-time, at today's price"
        />
        <Row
          label="Charging, 7 d"
          value={cad(summary?.charging_cad_per_day)}
          detail={`${fmt(summary?.alt_kwh_per_day, 2)} kWh a day · est.`}
          title="The share of the driving fuel that went into the house battery: ≈0.75 L per kWh the alternator chargers delivered (engine ≈30 %, alternator ≈55 %, chargers ≈90 %). An estimate, already inside the driving figure"
        />
        <SparklineStat
          entityId="sensor.charging_gas_per_10_percent"
          label="Gas per 10% charge"
          value={cad(per10)}
          unit=""
          color="#22c55e"
          hours={24}
          title="Extra gas for a tenth of the pack from the chargers while driving (≈0.57 L), at today's price. Idling barely charges — the chargers throttle with the alternator at idle"
        />
        {days.length > 0 && (
          <div className="pt-1">
            <div className="grid grid-cols-7 gap-1 text-center">
              {days.map((d) => {
                const v = num(d.cad);
                const h = maxDay > 0 && v != null ? Math.max(2, Math.round((v / maxDay) * 28)) : 2;
                const dt = new Date(`${d.date}T12:00:00`);
                return (
                  <div
                    key={d.date}
                    className="flex flex-col items-center gap-0.5"
                    title={`${d.date}: ${cad(v)} — ${fmt(num(d.engine_l), 1)} L driving (${fmt(num(d.km), 0)} km), heater ${fmt(num(d.heater_h), 1)} h, chargers ${fmt(num(d.alt_kwh), 2)} kWh`}
                  >
                    <div className="flex h-7 items-end">
                      <div className={cn('w-4 rounded-sm', v != null && v > 0 ? 'bg-amber-500/70' : 'bg-muted')} style={{ height: `${h}px` }} />
                    </div>
                    <span className="text-[10px] tabular-nums text-muted-foreground">{v != null ? `$${v.toFixed(0)}` : '—'}</span>
                    <span className="text-[9px] text-muted-foreground/70">{Number.isNaN(dt.getTime()) ? '' : WEEKDAY[dt.getDay()]}</span>
                  </div>
                );
              })}
            </div>
            <p className="pt-1 text-center text-[9px] text-muted-foreground/70">
              Whole days, HA's time zone{price != null ? ` · at $${price.toFixed(2)}/L` : ''}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Row({ label, value, detail, title }: { label: string; value: string; detail: string; title?: string }) {
  return (
    <div className="-mx-1 flex items-center justify-between gap-2 rounded-md px-1 py-0.5" title={title}>
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="flex items-baseline gap-2">
        <span className="text-[10px] text-muted-foreground/70">{detail}</span>
        <span className="text-sm font-medium tabular-nums">{value}</span>
      </span>
    </div>
  );
}
