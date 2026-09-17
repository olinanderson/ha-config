import { PageContainer } from '@/components/layout/PageContainer';
import { HeaterCard } from '@/components/HeaterCard';
import { AirConditionerCard } from '@/components/AirConditionerCard';
import { TonightCard } from '@/components/TonightCard';
import { TemperatureCard } from '@/components/TemperatureCard';
import { FanControl } from '@/components/FanControl';
import { BangBangControl } from '@/components/BangBangControl';
import { Battery, Droplets, Trash2, ShowerHead, Flame } from 'lucide-react';

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

export default function Climate() {

  return (
    <PageContainer title="Climate & Heating">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {/* Column 1: Heater + AC + tonight's program */}
        <div className="space-y-4">
          <HeaterCard />
          <AirConditionerCard />
          <TonightCard />
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
