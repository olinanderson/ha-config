import { PageContainer } from '@/components/layout/PageContainer';
import { BatteryCard } from '@/components/BatteryCard';
import { SolarCard } from '@/components/SolarCard';
import { PowerFlow } from '@/components/PowerFlow';
import { ToggleButton } from '@/components/ToggleButton';
import { InverterButton } from '@/components/InverterButton';
import { SparklineStat } from '@/components/ClickableValue';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEntityNumeric } from '@/hooks/useEntity';
import { fmt } from '@/lib/utils';
import { Zap, PlugZap, Gauge } from 'lucide-react';

function VoltageCard() {
  const { value: v12 } = useEntityNumeric('sensor.a32_pro_smart_battery_sense_12v_voltage');
  const { value: v12Temp } = useEntityNumeric('sensor.a32_pro_smart_battery_sense_12v_temperature');
  const { value: charging } = useEntityNumeric('sensor.battery_charging');
  const { value: discharging } = useEntityNumeric('sensor.battery_discharging');

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Gauge className="h-4 w-4" />
          System Voltages
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <SparklineStat entityId="sensor.a32_pro_smart_battery_sense_12v_voltage" label="12V Rail" value={fmt(v12, 2)} unit="V" color="#6366f1" />
        <SparklineStat entityId="sensor.a32_pro_smart_battery_sense_12v_temperature" label="12V Temp" value={fmt(v12Temp, 1)} unit="°C" color="#3b82f6" />
        <SparklineStat entityId="sensor.battery_charging" label="Charging" value={fmt(charging, 0)} unit="W" color="#22c55e" />
        <SparklineStat entityId="sensor.battery_discharging" label="Discharging" value={fmt(discharging, 0)} unit="W" color="#f97316" />
      </CardContent>
    </Card>
  );
}

function ChargingControls() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Zap className="h-4 w-4" />
          Charging Controls
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          <ToggleButton
            entityId="input_boolean.shore_power_charger_enabled"
            name="Shore Charger"
            icon={PlugZap}
            activeColor="green"
          />
          <InverterButton />
        </div>
      </CardContent>
    </Card>
  );
}

export default function Power() {
  return (
    <PageContainer title="Power & Energy">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="space-y-4">
          <BatteryCard />
          <VoltageCard />
        </div>
        <div className="space-y-4">
          <SolarCard />
          <ChargingControls />
        </div>
        <div className="space-y-4">
          <PowerFlow />
        </div>
      </div>
    </PageContainer>
  );
}
