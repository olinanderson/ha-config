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
import { useButtonPress, useToggle } from '@/hooks/useService';
import { useHistoryDialog } from '@/components/EntityHistoryDialog';
import { cn, fmt } from '@/lib/utils';
import { useState, useEffect, useCallback, useRef } from 'react';
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
  Lightbulb,
  Wifi,
  Trash,
} from 'lucide-react';

// ─── Badge bar ───

function BadgeItem({
  label,
  value,
  color,
  icon: Icon,
  onClick,
}: {
  label: string;
  value: string;
  color: string;
  icon: React.ElementType;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 rounded-lg border bg-card px-3 py-2 min-w-[7rem] text-left transition-colors',
        onClick && 'hover:bg-accent active:bg-accent/80 cursor-pointer',
      )}
    >
      <Icon className={cn('h-4 w-4 shrink-0', color)} />
      <div className="min-w-0">
        <p className="text-[10px] text-muted-foreground leading-tight">{label}</p>
        <p className="text-sm font-semibold tabular-nums truncate">{value}</p>
      </div>
    </button>
  );
}

function BadgeBar() {
  const { value: soc } = useEntityNumeric('sensor.olins_van_bms_battery');
  const { value: solar } = useEntityNumeric('sensor.total_mppt_pv_power');
  const { value: fresh } = useEntityNumeric('sensor.a32_pro_fresh_water_tank_level');
  const { value: grey } = useEntityNumeric('sensor.a32_pro_grey_water_tank_level');
  const { value: fuel } = useEntityNumeric('sensor.stable_fuel_level');
  const { value: propane } = useEntityNumeric('sensor.propane_tank_percentage');
  const { value: dlSpeed } = useEntityNumeric('sensor.starlink_downlink_throughput_mbps');
  const inverter = useEntity('binary_sensor.shelly_em_reachable');
  const powerSaving = useEntity('input_boolean.power_saving_mode');
  const greyValve = useEntity('switch.a32_pro_switch06_grey_water_tank_valve');
  const light1 = useEntity('light.led_controller_cct_1');
  const light2 = useEntity('light.led_controller_cct_2');
  const light3 = useEntity('light.led_controller_sc_1');
  const light4 = useEntity('light.led_controller_sc_2');

  const { open } = useHistoryDialog();
  const toggleGreyValve = useToggle('switch.a32_pro_switch06_grey_water_tank_valve');
  const toggleEco = useToggle('input_boolean.power_saving_mode');
  const toggleMainLight = useToggle('light.led_controller_cct_1');

  const inverterOn = inverter?.state === 'on';
  const ecoOn = powerSaving?.state === 'on';
  const greyOpen = greyValve?.state === 'on';
  const lightsOn = [light1, light2, light3, light4].filter((l) => l?.state === 'on').length;
  const v = (n: number | null) => n ?? 0;

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      <BadgeItem
        label="Battery"
        value={`${fmt(soc, 0)}%`}
        color={v(soc) < 30 ? 'text-red-500' : v(soc) < 65 ? 'text-orange-500' : 'text-green-500'}
        icon={Battery}
        onClick={() => open('sensor.olins_van_bms_battery', 'Battery SOC', '%')}
      />
      <BadgeItem
        label="Solar"
        value={`${fmt(solar, 0)}W`}
        color={v(solar) > 50 ? 'text-yellow-500' : 'text-muted-foreground'}
        icon={Sun}
        onClick={() => open('sensor.total_mppt_pv_power', 'Solar Power', 'W')}
      />
      <BadgeItem
        label="Lights"
        value={lightsOn > 0 ? `${lightsOn} on` : 'Off'}
        color={lightsOn > 0 ? 'text-yellow-500' : 'text-muted-foreground'}
        icon={Lightbulb}
        onClick={toggleMainLight}
      />
      <BadgeItem
        label="Inverter"
        value={inverterOn ? 'ON' : 'OFF'}
        color={inverterOn ? 'text-green-500' : 'text-muted-foreground'}
        icon={Zap}
        onClick={() => open('sensor.inverter_power_24v', 'Inverter Power', 'W')}
      />
      <BadgeItem
        label="Internet"
        value={`${fmt(dlSpeed, 0)} Mbps`}
        color={v(dlSpeed) > 50 ? 'text-green-500' : v(dlSpeed) > 10 ? 'text-orange-500' : 'text-red-500'}
        icon={Wifi}
        onClick={() => open('sensor.starlink_downlink_throughput_mbps', 'Internet Speed', 'Mbps')}
      />
      <BadgeItem
        label="Fresh"
        value={`${fmt(fresh, 0)}%`}
        color={v(fresh) < 20 ? 'text-red-500' : v(fresh) < 50 ? 'text-orange-500' : 'text-blue-500'}
        icon={Droplets}
        onClick={() => open('sensor.a32_pro_fresh_water_tank_level', 'Fresh Water', '%')}
      />
      <BadgeItem
        label="Grey"
        value={`${fmt(grey, 0)}%`}
        color={v(grey) > 80 ? 'text-red-500' : v(grey) > 60 ? 'text-orange-500' : 'text-green-500'}
        icon={Trash2}
        onClick={() => open('sensor.a32_pro_grey_water_tank_level', 'Grey Water', '%')}
      />
      <BadgeItem
        label="Grey Dump"
        value={greyOpen ? 'OPEN' : 'Closed'}
        color={greyOpen ? 'text-orange-500' : 'text-muted-foreground'}
        icon={Trash}
        onClick={toggleGreyValve}
      />
      <BadgeItem
        label="Fuel"
        value={`${fmt(fuel, 0)}%`}
        color={v(fuel) < 15 ? 'text-red-500' : v(fuel) < 30 ? 'text-orange-500' : 'text-green-500'}
        icon={Fuel}
        onClick={() => open('sensor.stable_fuel_level', 'Fuel Level', '%')}
      />
      <BadgeItem
        label="Propane"
        value={`${fmt(propane, 0)}%`}
        color={
          v(propane) < 15 ? 'text-red-500' : v(propane) < 30 ? 'text-orange-500' : 'text-green-500'
        }
        icon={Flame}
        onClick={() => open('sensor.propane_tank_percentage', 'Propane', '%')}
      />
      <BadgeItem
        label="Eco Mode"
        value={ecoOn ? 'ON' : 'OFF'}
        color={ecoOn ? 'text-yellow-500' : 'text-muted-foreground'}
        icon={BatteryLow}
        onClick={toggleEco}
      />
    </div>
  );
}

// ─── Quick controls ───

const INVERTER_TIMEOUT_MS = 15000;

function InverterButton() {
  const pressInverter = useButtonPress('button.a32_pro_inverter_on_off_toggle');
  const shellyPing = useEntity('binary_sensor.shelly_em_reachable');
  const isOn = shellyPing?.state === 'on';
  const [pending, setPending] = useState(false);
  const pendingRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevState = useRef(shellyPing?.state);

  // When shelly state changes while pending, clear pending
  useEffect(() => {
    if (pendingRef.current && shellyPing?.state !== prevState.current) {
      pendingRef.current = false;
      setPending(false);
      if (timerRef.current) clearTimeout(timerRef.current);
    }
    prevState.current = shellyPing?.state;
  }, [shellyPing?.state]);

  // Cleanup on unmount
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const handlePress = useCallback(() => {
    pressInverter();
    setPending(true);
    pendingRef.current = true;
    prevState.current = shellyPing?.state;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      pendingRef.current = false;
      setPending(false);
    }, INVERTER_TIMEOUT_MS);
  }, [pressInverter, shellyPing?.state]);

  const colors = {
    border: 'border-green-500',
    bg: 'bg-green-500/10',
    text: 'text-green-500',
    glow: 'shadow-green-500/25',
  };

  const label = pending ? 'Loading…' : isOn ? 'ON' : 'OFF';

  return (
    <button
      onClick={handlePress}
      disabled={pending}
      className={cn(
        'flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-300 min-w-[5rem]',
        pending
          ? 'border-yellow-500 bg-yellow-500/10 text-yellow-500'
          : isOn
            ? `${colors.border} ${colors.bg} ${colors.text} shadow-lg ${colors.glow}`
            : 'border-border bg-card text-muted-foreground hover:bg-accent',
      )}
    >
      <Zap
        className={cn(
          'h-5 w-5 transition-transform duration-300',
          pending && 'animate-pulse',
          isOn && !pending && 'scale-110',
        )}
        style={isOn && !pending ? { animation: 'toggle-breathe 3s ease-in-out infinite' } : undefined}
      />
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}

function QuickControls() {
  return (
    <div className="flex flex-wrap gap-2">
      <ToggleButton
        entityId="input_boolean.shore_power_charger_enabled"
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
      <InverterButton />
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
