import { PageContainer } from '@/components/layout/PageContainer';
import { HeatingControls } from '@/components/HeatingControls';
import { ThermostatControl } from '@/components/ThermostatControl';
import { TemperatureCard } from '@/components/TemperatureCard';
import { FanControl } from '@/components/FanControl';
import { BangBangControl } from '@/components/BangBangControl';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useEntity } from '@/hooks/useEntity';
import { useToggle } from '@/hooks/useService';
import { Battery, Droplets, Trash2, ShowerHead, ToggleLeft, Flame } from 'lucide-react';

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

export default function Climate() {

  return (
    <PageContainer title="Climate & Heating">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {/* Column 1: Thermostat + Heating System */}
        <div className="space-y-4">
          <ThermostatControl />
          <HeatingControls />
        </div>

        {/* Column 2: Temperatures + Freeze Protection */}
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

          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider pt-2">
            Freeze Protection
          </h2>
          <BangBangControl
            climateEntity="climate.a32_pro_battery_heater_thermostat"
            enableEntity="switch.a32_pro_battery_heater_enable"
            tempEntity="sensor.a32_pro_s5140_channel_36_temperature_battery_bottom_aluminum_plate"
            powerEntity="sensor.battery_heater_power_12v"
            name="Battery Heater"
            icon={Battery}
            color="#3b82f6"
          />
          <BangBangControl
            climateEntity="climate.a32_pro_fresh_water_tank_thermostat"
            tempEntity="sensor.a32_pro_s5140_channel_38_temperature_fresh_water_tank"
            name="Fresh Water Tank"
            icon={Droplets}
            color="#06b6d4"
          />
          <BangBangControl
            climateEntity="climate.a32_pro_shower_water_tank_thermostat"
            tempEntity="sensor.a32_pro_s5140_channel_40_temperature_shower_water_tank"
            name="Shower Tank"
            icon={ShowerHead}
            color="#8b5cf6"
          />
          <BangBangControl
            climateEntity="climate.a32_pro_grey_water_tank_thermostat"
            tempEntity="sensor.a32_pro_s5140_channel_39_temperature_grey_water_tank"
            name="Grey Water Tank"
            icon={Trash2}
            color="#64748b"
          />
        </div>

        {/* Column 3: Fan + Controls + Air Fryer + Wind + Radar */}
        <div className="space-y-4">
          <FanControl />
          <BlowerModeCard />
          <BangBangControl
            climateEntity="climate.a32_pro_air_fryer_ventilation_thermostat"
            enableEntity="switch.a32_pro_air_fryer_ventilation_enable"
            tempEntity="sensor.a32_pro_s5140_channel_37_temperature_air_fryer_compartment"
            name="Air Fryer Ventilation"
            icon={Flame}
            color="#f97316"
            isCooling
          />
        </div>
      </div>
    </PageContainer>
  );
}
