import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useEntity, useEntityNumeric } from '@/hooks/useEntity';
import { StatValue } from '@/components/StatValue';
import { useHistoryDialog } from '@/components/EntityHistoryDialog';
import { cn, fmt, timeAgo } from '@/lib/utils';
import { Radar, Wifi, WifiOff, Ruler, Wind, Sun, SunMedium, Thermometer, Gauge } from 'lucide-react';

const MSR = 'binary_sensor.apollo_msr_2_1731d8';
const E = (suffix: string) => `sensor.apollo_msr_2_1731d8_${suffix}`;
const B = (suffix: string) => `binary_sensor.apollo_msr_2_1731d8_${suffix}`;

/** Zone occupancy pill */
function Zone({ n }: { n: number }) {
  const z = useEntity(B(`radar_zone_${n}_occupancy`));
  const on = z?.state === 'on';
  const avail = z?.state === 'on' || z?.state === 'off';
  return (
    <div
      className={cn(
        'flex-1 rounded-lg border px-2 py-1.5 text-center transition-colors',
        on
          ? 'border-green-500/60 bg-green-500/10 text-green-500'
          : avail
            ? 'border-border bg-card text-muted-foreground'
            : 'border-border bg-card text-muted-foreground/40',
      )}
    >
      <p className="text-[10px] leading-tight">Zone {n}</p>
      <p className="text-xs font-semibold">{on ? 'Here' : avail ? '—' : 'n/a'}</p>
    </div>
  );
}

export function PresenceCard() {
  const online = useEntity(`${MSR}_online`);
  const occupied = useEntity('binary_sensor.van_occupied'); // debounced (stable)
  const rawTarget = useEntity(B('radar_target')); // live (flickery)
  const moving = useEntity(B('radar_moving_target'));
  const still = useEntity(B('radar_still_target'));

  const { value: distance } = useEntityNumeric(E('radar_detection_distance'));
  const { value: moveEnergy } = useEntityNumeric(E('radar_move_energy'));
  const { value: stillEnergy } = useEntityNumeric(E('radar_still_energy'));
  const { value: co2 } = useEntityNumeric(E('co2'));
  const { value: light } = useEntityNumeric(E('ltr390_light'));
  const { value: uv } = useEntityNumeric(E('ltr390_uv_index'));
  const { value: temp } = useEntityNumeric(E('dps310_temperature'));
  const { value: pressure } = useEntityNumeric(E('dps310_pressure'));
  const { value: rssi } = useEntityNumeric(E('rssi'));

  const { open } = useHistoryDialog();

  // The whole device is "offline" when its online sensor says so, or when the
  // radar target reads unavailable (covers the case where _online lags).
  const isOnline = online?.state === 'on' && rawTarget?.state !== 'unavailable';
  const isOccupied = occupied?.state === 'on';
  const liveOn = rawTarget?.state === 'on';

  const presenceLabel = !isOnline ? 'Offline' : isOccupied ? 'Occupied' : 'Empty';
  const presenceColor = !isOnline
    ? 'text-muted-foreground'
    : isOccupied
      ? 'text-green-500'
      : 'text-muted-foreground';

  // Live target kind (moving / still / none) — only meaningful when online.
  const targetKind =
    moving?.state === 'on' ? 'moving' : still?.state === 'on' ? 'still' : liveOn ? 'present' : 'clear';

  const co2Color =
    co2 == null ? '' : co2 > 1500 ? 'text-red-500' : co2 > 1000 ? 'text-orange-500' : 'text-green-500';

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Radar className="h-4 w-4" />
          Presence
          <div className="ml-auto flex items-center gap-1.5">
            {isOnline ? (
              <Wifi className="h-3.5 w-3.5 text-green-500" />
            ) : (
              <WifiOff className="h-3.5 w-3.5 text-amber-500" />
            )}
            <span className={cn('text-xs', isOnline ? 'text-muted-foreground' : 'text-amber-500')}>
              {isOnline
                ? `${fmt(rssi, 0)} dBm`
                : `offline ${timeAgo(online?.last_changed)}`}
            </span>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Primary occupancy (debounced) + live radar state */}
        <div className="flex items-center justify-between">
          <div>
            <p className={cn('text-2xl font-bold leading-tight', presenceColor)}>{presenceLabel}</p>
            <p className="text-[11px] text-muted-foreground">
              {isOnline ? (
                <>
                  live radar:{' '}
                  <span className={cn('font-medium', liveOn ? 'text-green-500' : 'text-muted-foreground')}>
                    {targetKind}
                  </span>
                  {' · '}stable 3 min
                </>
              ) : (
                'mmWave sensor not reporting'
              )}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground leading-tight">Distance</p>
            <p className="text-lg font-semibold tabular-nums">
              {isOnline && distance != null ? `${fmt(distance, 0)}` : '—'}
              <span className="text-muted-foreground ml-0.5 text-xs">cm</span>
            </p>
          </div>
        </div>

        {/* Radar zones */}
        <div className="flex gap-2">
          <Zone n={1} />
          <Zone n={2} />
          <Zone n={3} />
        </div>

        {/* Move / still energy */}
        <div className="grid gap-1.5">
          <div className="flex items-center gap-2">
            <span className="w-12 shrink-0 text-xs text-muted-foreground">Moving</span>
            <Progress value={moveEnergy ?? 0} className="h-2 flex-1" indicatorClassName="bg-cyan-500" />
            <span className="w-9 shrink-0 text-right text-xs tabular-nums">{fmt(moveEnergy, 0)}%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-12 shrink-0 text-xs text-muted-foreground">Still</span>
            <Progress value={stillEnergy ?? 0} className="h-2 flex-1" indicatorClassName="bg-indigo-500" />
            <span className="w-9 shrink-0 text-right text-xs tabular-nums">{fmt(stillEnergy, 0)}%</span>
          </div>
        </div>

        {/* Environment grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 border-t border-border pt-2">
          <button
            className="text-left"
            onClick={() => open(E('co2'), 'CO₂', 'ppm')}
          >
            <StatValue label="CO₂" value={fmt(co2, 0)} unit="ppm" icon={Wind} className={co2Color} />
          </button>
          <button
            className="text-left"
            onClick={() => open(E('dps310_temperature'), 'Sensor Temp', '°C')}
          >
            <StatValue label="Temp" value={fmt(temp, 1)} unit="°C" icon={Thermometer} />
          </button>
          <StatValue label="Light" value={fmt(light, 0)} unit="lx" icon={Sun} />
          <StatValue label="UV" value={fmt(uv, 1)} unit="" icon={SunMedium} />
          <StatValue label="Pressure" value={fmt(pressure, 0)} unit="hPa" icon={Gauge} />
          <StatValue label="Range" value={fmt(distance, 0)} unit="cm" icon={Ruler} />
        </div>
      </CardContent>
    </Card>
  );
}
