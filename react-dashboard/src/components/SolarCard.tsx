import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEntityNumeric } from '@/hooks/useEntity';
import { useHistory } from '@/hooks/useHistory';
import { fmt, cn } from '@/lib/utils';
import { Sun } from 'lucide-react';
import { SparklineStat } from '@/components/ClickableValue';
import { Sparkline } from '@/components/Chart';
import { useHistoryDialog } from '@/components/EntityHistoryDialog';

export function SolarCard({ compact = false }: { compact?: boolean }) {
  const { value: totalPv } = useEntityNumeric('sensor.total_mppt_pv_power');
  const { value: mppt1Pv } = useEntityNumeric('sensor.a32_pro_mppt1_pv_power');
  const { value: mppt2Pv } = useEntityNumeric('sensor.a32_pro_mppt2_pv_power');
  const { value: mppt1Yield } = useEntityNumeric('sensor.a32_pro_mppt1_yield_today');
  const { value: mppt2Yield } = useEntityNumeric('sensor.a32_pro_mppt2_yield_today');
  const { value: totalYield } = useEntityNumeric('sensor.total_mppt_yield_today');
  const { value: avgVoltage } = useEntityNumeric('sensor.average_mppt_output_voltage');
  const { value: totalCurrent } = useEntityNumeric('sensor.total_mppt_output_current');

  const { data: pvHistory } = useHistory('sensor.total_mppt_pv_power', 12);
  const { open } = useHistoryDialog();

  const active = (totalPv ?? 0) > 10;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sun className={cn('h-4 w-4', active ? 'text-yellow-500' : 'text-muted-foreground')} />
          Solar
          <div className="ml-auto flex items-center gap-2">
            <Sparkline
              data={pvHistory}
              color="#eab308"
              width={64}
              height={20}
              onClick={() => open('sensor.total_mppt_pv_power', 'Total Solar', 'W')}
            />
            <span
              className={cn(
                'text-2xl font-bold tabular-nums',
                active ? 'text-yellow-500' : 'text-muted-foreground',
              )}
            >
              {fmt(totalPv, 0)}W
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div
            className="space-y-1 rounded-lg bg-muted/50 p-2.5 cursor-pointer hover:bg-muted/80 transition-colors"
            onClick={() => open('sensor.a32_pro_mppt1_pv_power', 'MPPT 1', 'W')}
          >
            <p className="text-xs font-medium text-muted-foreground">MPPT 1</p>
            <p className="text-lg font-bold tabular-nums">{fmt(mppt1Pv, 0)}W</p>
            <p className="text-xs text-muted-foreground">{fmt(mppt1Yield, 2)} kWh today</p>
          </div>
          <div
            className="space-y-1 rounded-lg bg-muted/50 p-2.5 cursor-pointer hover:bg-muted/80 transition-colors"
            onClick={() => open('sensor.a32_pro_mppt2_pv_power', 'MPPT 2', 'W')}
          >
            <p className="text-xs font-medium text-muted-foreground">MPPT 2</p>
            <p className="text-lg font-bold tabular-nums">{fmt(mppt2Pv, 0)}W</p>
            <p className="text-xs text-muted-foreground">{fmt(mppt2Yield, 2)} kWh today</p>
          </div>
        </div>
        {!compact && (
          <div className="grid gap-1">
            <SparklineStat entityId="sensor.total_mppt_yield_today" label="Total Yield" value={fmt(totalYield, 0)} unit="Wh" color="#eab308" />
            <SparklineStat entityId="sensor.average_mppt_output_voltage" label="Output Voltage" value={fmt(avgVoltage, 1)} unit="V" color="#6366f1" />
            <SparklineStat entityId="sensor.total_mppt_output_current" label="Output Current" value={fmt(totalCurrent, 1)} unit="A" color="#06b6d4" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
