import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useEntity, useEntityNumeric } from '@/hooks/useEntity';
import { useHistory } from '@/hooks/useHistory';
import { fmt, cn } from '@/lib/utils';
import { Battery } from 'lucide-react';
import { SparklineStat } from '@/components/ClickableValue';
import { Sparkline } from '@/components/Chart';
import { useHistoryDialog } from '@/components/EntityHistoryDialog';

export function BatteryCard({ compact = false }: { compact?: boolean }) {
  const { value: soc } = useEntityNumeric('sensor.olins_van_bms_battery');
  const { value: voltage } = useEntityNumeric('sensor.olins_van_bms_voltage');
  const { value: current } = useEntityNumeric('sensor.olins_van_bms_current');
  const { value: power } = useEntityNumeric('sensor.olins_van_bms_power');
  const { value: stored } = useEntityNumeric('sensor.olins_van_bms_stored_energy');
  const { value: temp } = useEntityNumeric('sensor.olins_van_bms_temperature');
  const { value: cycles } = useEntityNumeric('sensor.olins_van_bms_cycles');
  const { value: delta } = useEntityNumeric('sensor.olins_van_bms_delta_voltage');
  const estimateEntity = useEntity('sensor.battery_time_estimate');

  const { data: socHistory } = useHistory('sensor.olins_van_bms_battery', 12);
  const { open } = useHistoryDialog();

  const charging = (current ?? 0) > 0;
  const estimate = estimateEntity?.state;
  const estimateDisplay =
    !estimate || estimate === 'unknown' || estimate === 'unavailable'
      ? '—'
      : estimate === 'Idle'
        ? 'Idle'
        : estimate;
  const socNum = soc ?? 0;
  const socColor = socNum < 30 ? 'text-red-500' : socNum < 65 ? 'text-orange-500' : 'text-green-500';
  const barColor =
    socNum < 30 ? 'bg-red-500' : socNum < 65 ? 'bg-orange-500' : 'bg-green-500';

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Battery className="h-4 w-4" />
          Battery
          <div className="ml-auto flex items-center gap-2">
            <Sparkline
              data={socHistory}
              color={socNum < 30 ? '#ef4444' : socNum < 65 ? '#f97316' : '#22c55e'}
              width={64}
              height={20}
              onClick={() => open('sensor.olins_van_bms_battery', 'Battery SOC', '%')}
            />
            <span className={cn('text-2xl font-bold tabular-nums', socColor)}>
              {fmt(soc, 0)}%
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Progress value={socNum} className="h-3" indicatorClassName={barColor} />
        <div className="grid gap-1">
          <SparklineStat entityId="sensor.olins_van_bms_voltage" label="Voltage" value={fmt(voltage, 2)} unit="V" color="#6366f1" />
          <SparklineStat entityId="sensor.olins_van_bms_current" label="Current" value={fmt(current, 2)} unit="A" color="#06b6d4" />
          <SparklineStat entityId="sensor.olins_van_bms_power" label="Power" value={fmt(power != null ? Math.abs(power) : null, 0)} unit="W" color="#f59e0b" />
          {!compact && (
            <>
              <SparklineStat entityId="sensor.olins_van_bms_stored_energy" label="Stored" value={fmt(stored, 0)} unit="Wh" color="#8b5cf6" />
              <SparklineStat entityId="sensor.olins_van_bms_temperature" label="Temperature" value={fmt(temp, 1)} unit="°C" color="#ef4444" />
              <SparklineStat entityId="sensor.olins_van_bms_cycles" label="Cycles" value={fmt(cycles, 0)} unit="" color="#64748b" />
              <SparklineStat entityId="sensor.olins_van_bms_delta_voltage" label="Cell Delta" value={fmt(delta, 3)} unit="V" color="#ec4899" />
            </>
          )}
        </div>
        <p
          className={cn(
            'text-xs font-medium text-center',
            estimateDisplay === 'Idle' || estimateDisplay === '—'
              ? 'text-muted-foreground'
              : charging
                ? 'text-green-500'
                : 'text-orange-500',
          )}
        >
          {estimateDisplay}
        </p>
      </CardContent>
    </Card>
  );
}
