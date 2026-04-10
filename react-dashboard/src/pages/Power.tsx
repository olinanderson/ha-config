import { PageContainer } from '@/components/layout/PageContainer';
import { BatteryCard } from '@/components/BatteryCard';
import { SolarCard } from '@/components/SolarCard';
import { PowerBreakdown } from '@/components/PowerBreakdown';
import { ToggleButton } from '@/components/ToggleButton';
import { SparklineStat } from '@/components/ClickableValue';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEntityNumeric } from '@/hooks/useEntity';
import { useButtonPress } from '@/hooks/useService';
import { fmt } from '@/lib/utils';
import { Zap, PlugZap, Gauge } from 'lucide-react';

function VoltageCard() {
  const { value: v12 } = useEntityNumeric('sensor.a32_pro_smart_battery_sense_12v_voltage');
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
        <SparklineStat entityId="sensor.battery_charging" label="Charging" value={fmt(charging, 0)} unit="W" color="#22c55e" />
        <SparklineStat entityId="sensor.battery_discharging" label="Discharging" value={fmt(discharging, 0)} unit="W" color="#f97316" />
      </CardContent>
    </Card>
  );
}

function ChargingControls() {
  const pressInverter = useButtonPress('button.a32_pro_inverter_on_off_toggle');

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
            entityId="switch.a32_pro_do8_switch04_shore_power_charger"
            name="Shore Charger"
            icon={PlugZap}
            activeColor="green"
          />
          <ToggleButton
            entityId="binary_sensor.shelly_em_reachable"
            name="Inverter"
            icon={Zap}
            activeColor="green"
            onToggle={pressInverter}
          />
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
        <div className="xl:col-span-1 md:col-span-2 xl:col-span-1">
          <PowerBreakdown />
        </div>
      </div>
    </PageContainer>
  );
}
