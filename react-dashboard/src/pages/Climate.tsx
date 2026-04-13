import { PageContainer } from '@/components/layout/PageContainer';
import { HeatingControls } from '@/components/HeatingControls';
import { TemperatureCard } from '@/components/TemperatureCard';
import { FanControl } from '@/components/FanControl';
import { SparklineStat } from '@/components/ClickableValue';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useEntity, useEntityNumeric } from '@/hooks/useEntity';
import { useToggle } from '@/hooks/useService';
import { fmt } from '@/lib/utils';
import { Thermometer, ToggleLeft, Battery, Wind } from 'lucide-react';

const zones = [
  {
    name: 'Living Area',
    temp: 'sensor.a32_pro_bme280_1_temperature',
    humidity: 'sensor.a32_pro_bme280_1_relative_humidity',
  },
  {
    name: 'Cab',
    temp: 'sensor.a32_pro_bme280_2_temperature',
    humidity: 'sensor.a32_pro_bme280_2_relative_humidity',
  },
  {
    name: 'Shower',
    temp: 'sensor.a32_pro_bme280_3_temperature',
    humidity: 'sensor.a32_pro_bme280_3_relative_humidity',
  },
  {
    name: 'Outdoor',
    temp: 'sensor.a32_pro_bme280_4_temperature',
    humidity: 'sensor.a32_pro_bme280_4_relative_humidity',
  },
];

function BatteryHeaterCard() {
  const { value: power } = useEntityNumeric('sensor.battery_heater_power_12v');
  const { value: plateTemp } = useEntityNumeric('sensor.a32_pro_s5140_channel_36_temperature_battery_bottom_aluminum_plate');
  const heaterEnable = useEntity('switch.a32_pro_battery_heater_enable');
  const toggleHeater = useToggle('switch.a32_pro_battery_heater_enable');
  const thermostat = useEntity('climate.a32_pro_battery_heater_thermostat');

  const targetTemp = thermostat?.attributes?.temperature;
  const currentTemp = thermostat?.attributes?.current_temperature;
  const mode = thermostat?.state; // 'heat' or 'off'

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Battery className="h-4 w-4" />
          Battery Heater
          <div className="ml-auto flex items-center gap-1.5">
            <span className="text-[10px] text-muted-foreground">{mode === 'heat' ? 'Heating' : 'Off'}</span>
            <Switch checked={heaterEnable?.state === 'on'} onCheckedChange={toggleHeater} />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <SparklineStat entityId="sensor.a32_pro_s5140_channel_36_temperature_battery_bottom_aluminum_plate" label="Battery Plate" value={fmt(plateTemp, 1)} unit="°C" color="#3b82f6" />
        {currentTemp != null && <div className="flex items-center justify-between text-xs"><span className="text-muted-foreground">Thermostat</span><span className="tabular-nums">{fmt(currentTemp, 1)}°C → {fmt(targetTemp, 0)}°C</span></div>}
        <SparklineStat entityId="sensor.battery_heater_power_12v" label="Power" value={fmt(power, 0)} unit="W" color="#ef4444" />
      </CardContent>
    </Card>
  );
}

function BlowerModeCard() {
  const blowerMode = useEntity('switch.a32_pro_coolant_blower_mode_auto_manual');
  const toggleMode = useToggle('switch.a32_pro_coolant_blower_mode_auto_manual');
  const isAuto = blowerMode?.state === 'on';

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-center justify-between">
          <span className="text-sm flex items-center gap-1.5">
            <ToggleLeft className="h-3.5 w-3.5" />
            Blower Fan Mode
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{isAuto ? 'Auto (PID)' : 'Manual'}</span>
            <Switch checked={isAuto} onCheckedChange={toggleMode} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AirFryerCard() {
  const { value: temp } = useEntityNumeric('sensor.a32_pro_s5140_channel_37_temperature_air_fryer_compartment');
  const vent = useEntity('switch.a32_pro_air_fryer_ventilation_enable');
  const toggleVent = useToggle('switch.a32_pro_air_fryer_ventilation_enable');

  return (
    <Card>
      <CardContent className="pt-4 space-y-2">
        <SparklineStat
          entityId="sensor.a32_pro_s5140_channel_37_temperature_air_fryer_compartment"
          label="Air Fryer Compartment"
          value={fmt(temp, 1)}
          unit="°C"
          icon={Thermometer}
          color="#f97316"
        />
        <div className="flex items-center justify-between">
          <span className="text-sm flex items-center gap-1.5">
            <Wind className="h-3.5 w-3.5" />
            Ventilation Fan
          </span>
          <Switch checked={vent?.state === 'on'} onCheckedChange={toggleVent} />
        </div>
      </CardContent>
    </Card>
  );
}

export default function Climate() {
  return (
    <PageContainer title="Climate & Heating">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {/* Column 1: Heating */}
        <div className="space-y-4">
          <HeatingControls />
        </div>

        {/* Column 2: Temperatures */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Temperature Zones
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {zones.map((z) => (
              <TemperatureCard
                key={z.name}
                name={z.name}
                tempEntity={z.temp}
                humidityEntity={z.humidity}
              />
            ))}
          </div>
          <BatteryHeaterCard />
          <AirFryerCard />
        </div>

        {/* Column 3: Fan + Controls */}
        <div className="space-y-4">
          <FanControl />
          <BlowerModeCard />
        </div>
      </div>
    </PageContainer>
  );
}
