import { PageContainer } from '@/components/layout/PageContainer';
import { BatteryCard } from '@/components/BatteryCard';
import { SolarCard } from '@/components/SolarCard';
import { TemperatureCard } from '@/components/TemperatureCard';
import { TankLevel } from '@/components/TankLevel';
import { WeatherCard } from '@/components/WeatherCard';
import { ThermostatControl } from '@/components/ThermostatControl';
import { HeatingControls } from '@/components/HeatingControls';
import { FanControl } from '@/components/FanControl';
import { PresenceBar } from '@/components/PresenceBar';
import { ToggleButton } from '@/components/ToggleButton';
import { StatusDot } from '@/components/StatusDot';
import { useEntity, useEntityNumeric } from '@/hooks/useEntity';
import { useButtonPress } from '@/hooks/useService';
import { cn, fmt } from '@/lib/utils';
import {
  Battery,
  Sun,
  Droplets,
  Fuel,
  Flame,
  Zap,
  PlugZap,
  Trash2,
  Moon,
  ShowerHead,
  BatteryLow,
} from 'lucide-react';

// ─── Badge bar ───

function BadgeItem({
  label,
  value,
  color,
  icon: Icon,
}: {
  label: string;
  value: string;
  color: string;
  icon: React.ElementType;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2 min-w-[7rem]">
      <Icon className={cn('h-4 w-4 shrink-0', color)} />
      <div className="min-w-0">
        <p className="text-[10px] text-muted-foreground leading-tight">{label}</p>
        <p className="text-sm font-semibold tabular-nums truncate">{value}</p>
      </div>
    </div>
  );
}

function BadgeBar() {
  const { value: soc } = useEntityNumeric('sensor.olins_van_bms_battery');
  const { value: solar } = useEntityNumeric('sensor.total_mppt_pv_power');
  const { value: fresh } = useEntityNumeric('sensor.a32_pro_fresh_water_tank_level');
  const { value: grey } = useEntityNumeric('sensor.a32_pro_grey_water_tank_level');
  const { value: fuel } = useEntityNumeric('sensor.stable_fuel_level');
  const { value: propane } = useEntityNumeric('sensor.propane_tank_percentage');
  const inverter = useEntity('binary_sensor.shelly_em_reachable');
  const inverterOn = inverter?.state === 'on';

  const v = (n: number | null) => n ?? 0; // null-safe for color thresholds

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      <BadgeItem
        label="Battery"
        value={`${fmt(soc, 0)}%`}
        color={v(soc) < 30 ? 'text-red-500' : v(soc) < 65 ? 'text-orange-500' : 'text-green-500'}
        icon={Battery}
      />
      <BadgeItem
        label="Solar"
        value={`${fmt(solar, 0)}W`}
        color={v(solar) > 50 ? 'text-yellow-500' : 'text-muted-foreground'}
        icon={Sun}
      />
      <BadgeItem
        label="Fresh"
        value={`${fmt(fresh, 0)}%`}
        color={v(fresh) < 20 ? 'text-red-500' : v(fresh) < 50 ? 'text-orange-500' : 'text-blue-500'}
        icon={Droplets}
      />
      <BadgeItem
        label="Grey"
        value={`${fmt(grey, 0)}%`}
        color={v(grey) > 80 ? 'text-red-500' : v(grey) > 60 ? 'text-orange-500' : 'text-green-500'}
        icon={Trash2}
      />
      <BadgeItem
        label="Fuel"
        value={`${fmt(fuel, 0)}%`}
        color={v(fuel) < 15 ? 'text-red-500' : v(fuel) < 30 ? 'text-orange-500' : 'text-green-500'}
        icon={Fuel}
      />
      <BadgeItem
        label="Propane"
        value={`${fmt(propane, 0)}%`}
        color={
          v(propane) < 15 ? 'text-red-500' : v(propane) < 30 ? 'text-orange-500' : 'text-green-500'
        }
        icon={Flame}
      />
      <BadgeItem
        label="Inverter"
        value={inverterOn ? 'ON' : 'OFF'}
        color={inverterOn ? 'text-green-500' : 'text-muted-foreground'}
        icon={Zap}
      />
    </div>
  );
}

// ─── Quick controls ───

function QuickControls() {
  const pressInverter = useButtonPress('button.a32_pro_inverter_on_off_toggle');

  return (
    <div className="flex flex-wrap gap-2">
      <ToggleButton
        entityId="switch.a32_pro_do8_switch04_shore_power_charger"
        name="Shore"
        icon={PlugZap}
        activeColor="green"
      />
      <ToggleButton
        entityId="switch.a32_pro_switch06_grey_water_tank_valve"
        name="Grey Dump"
        icon={Trash2}
        activeColor="orange"
      />
      <ToggleButton
        entityId="binary_sensor.shelly_em_reachable"
        name="Inverter"
        icon={Zap}
        activeColor="green"
        onToggle={pressInverter}
      />
    </div>
  );
}

// ─── Mode toggles ───

function ModeToggles() {
  return (
    <div className="flex flex-wrap gap-2">
      <ToggleButton
        entityId="input_boolean.power_saving_mode"
        name="Eco"
        icon={BatteryLow}
        activeColor="yellow"
      />
      <ToggleButton
        entityId="input_boolean.sleep_mode"
        name="Sleep"
        icon={Moon}
        activeColor="purple"
      />
      <ToggleButton
        entityId="input_boolean.shower_mode"
        name="Shower"
        icon={ShowerHead}
        activeColor="cyan"
      />
    </div>
  );
}

// ─── Page ───

export default function Home() {
  return (
    <PageContainer title="Home">
      <BadgeBar />
      <PresenceBar />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {/* Column 1: Climate */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <TemperatureCard
              name="Living"
              tempEntity="sensor.a32_pro_bme280_1_temperature"
              humidityEntity="sensor.a32_pro_bme280_1_relative_humidity"
            />
            <TemperatureCard
              name="Outdoor"
              tempEntity="sensor.a32_pro_bme280_4_temperature"
              humidityEntity="sensor.a32_pro_bme280_4_relative_humidity"
            />
          </div>
          <ThermostatControl />
          <HeatingControls />
          <FanControl />
        </div>

        {/* Column 2: Power */}
        <div className="space-y-4">
          <BatteryCard compact />
          <SolarCard compact />
          <QuickControls />
        </div>

        {/* Column 3: Tanks + Weather + Modes */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <TankLevel name="Fresh" entityId="sensor.a32_pro_fresh_water_tank_level" />
            <TankLevel
              name="Grey"
              entityId="sensor.a32_pro_grey_water_tank_level"
              invertWarning
            />
          </div>
          <ModeToggles />
          <WeatherCard />
        </div>
      </div>
    </PageContainer>
  );
}
