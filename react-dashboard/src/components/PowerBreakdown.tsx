import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEntityNumeric } from '@/hooks/useEntity';
import { fmt, cn } from '@/lib/utils';
import { Activity } from 'lucide-react';

const consumers = [
  { label: 'A/C', entity: 'sensor.air_conditioning_power_24v' },
  { label: '24V Devices', entity: 'sensor.all_24v_devices_power_24v' },
  { label: '12V Devices', entity: 'sensor.all_12v_devices_power_24v' },
  { label: 'Inverter', entity: 'sensor.inverter_power_24v' },
  { label: 'Alt Charger', entity: 'sensor.alternator_charger_power_24v' },
  { label: 'Batt Heater', entity: 'sensor.battery_heater_power_12v' },
  { label: 'Roof Fan', entity: 'sensor.roof_fan_power_12v' },
  { label: 'Bed Motor', entity: 'sensor.bed_motor_power_24v' },
  { label: 'Shore Charger', entity: 'sensor.shore_power_charger_power_24v' },
];

function PowerItem({ label, entityId }: { label: string; entityId: string }) {
  const { value } = useEntityNumeric(entityId);
  const active = (value ?? 0) > 5;
  return (
    <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span
        className={cn(
          'text-sm font-medium tabular-nums',
          active ? 'text-foreground' : 'text-muted-foreground/50',
        )}
      >
        {fmt(value, 0)}W
      </span>
    </div>
  );
}

export function PowerBreakdown() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity className="h-4 w-4" />
          Power Consumers
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {consumers.map(({ label, entity }) => (
            <PowerItem key={entity} label={label} entityId={entity} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
