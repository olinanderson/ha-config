import { PageContainer } from '@/components/layout/PageContainer';
import { ThermostatControl } from '@/components/ThermostatControl';
import { HeatingControls } from '@/components/HeatingControls';
import { TemperatureCard } from '@/components/TemperatureCard';
import { FanControl } from '@/components/FanControl';
import { SparklineStat } from '@/components/ClickableValue';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEntityNumeric } from '@/hooks/useEntity';
import { fmt } from '@/lib/utils';
import { Thermometer } from 'lucide-react';

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

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Thermometer className="h-4 w-4" />
          Battery Heater
        </CardTitle>
      </CardHeader>
      <CardContent>
        <SparklineStat entityId="sensor.battery_heater_power_12v" label="Power" value={fmt(power, 0)} unit="W" color="#ef4444" />
      </CardContent>
    </Card>
  );
}

export default function Climate() {
  return (
    <PageContainer title="Climate & Heating">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {/* Column 1: Thermostat + Heating */}
        <div className="space-y-4">
          <ThermostatControl />
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
        </div>

        {/* Column 3: Fan */}
        <div className="space-y-4">
          <FanControl />
        </div>
      </div>
    </PageContainer>
  );
}
