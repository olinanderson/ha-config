import { PageContainer } from '@/components/layout/PageContainer';
import { TankLevel } from '@/components/TankLevel';
import { ToggleButton } from '@/components/ToggleButton';
import { SparklineStat } from '@/components/ClickableValue';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useEntity, useEntityNumeric } from '@/hooks/useEntity';
import { useToggle } from '@/hooks/useService';
import { fmt, cn } from '@/lib/utils';
import { Droplets, Waves, ShowerHead, Flame, Trash2, CircleDot, Thermometer } from 'lucide-react';

const valves = [
  { entityId: 'switch.a32_pro_switch01_water_system_valve_1', name: 'Valve 1' },
  { entityId: 'switch.a32_pro_switch02_water_system_valve_2', name: 'Valve 2' },
  { entityId: 'switch.a32_pro_switch03_water_system_valve_3', name: 'Valve 3' },
  { entityId: 'switch.a32_pro_switch06_grey_water_tank_valve', name: 'Grey Dump Valve' },
];

const pumps = [
  { entityId: 'switch.a32_pro_switch30_main_system_water_pump', name: 'Main Pump' },
  { entityId: 'switch.a32_pro_switch29_shower_system_water_pump', name: 'Shower Pump' },
  { entityId: 'switch.a32_pro_switch14_uv_filter', name: 'UV Filter' },
];

function StatusRow({ entityId, name, onLabel = 'Open', offLabel = 'Closed' }: { entityId: string; name: string; onLabel?: string; offLabel?: string }) {
  const entity = useEntity(entityId);
  const isOn = entity?.state === 'on';
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className="text-sm">{name}</span>
      <span
        className={cn(
          'text-xs font-medium px-2 py-0.5 rounded-full',
          isOn
            ? 'bg-green-500/15 text-green-500'
            : 'bg-muted text-muted-foreground',
        )}
      >
        {isOn ? onLabel : offLabel}
      </span>
    </div>
  );
}

function ValveStatus() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <CircleDot className="h-4 w-4" />
          Valves & Pumps
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {valves.map((v) => (
          <StatusRow key={v.entityId} entityId={v.entityId} name={v.name} />
        ))}
        <div className="border-t my-1.5" />
        {pumps.map((p) => (
          <StatusRow key={p.entityId} entityId={p.entityId} name={p.name} onLabel="Running" offLabel="Off" />
        ))}
      </CardContent>
    </Card>
  );
}

function WaterControls() {
  const master = useEntity('switch.a32_pro_water_system_master_switch');
  const main = useEntity('switch.a32_pro_water_system_state_main');
  const recirc = useEntity('switch.a32_pro_water_system_state_recirculating_shower');
  const flush = useEntity('switch.a32_pro_water_system_state_recirculating_shower_flush');

  const toggleMaster = useToggle('switch.a32_pro_water_system_master_switch');
  const toggleMain = useToggle('switch.a32_pro_water_system_state_main');
  const toggleRecirc = useToggle('switch.a32_pro_water_system_state_recirculating_shower');
  const toggleFlush = useToggle('switch.a32_pro_water_system_state_recirculating_shower_flush');

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Waves className="h-4 w-4" />
          Water Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Master Switch</span>
          <Switch checked={master?.state === 'on'} onCheckedChange={toggleMaster} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">Main Mode</span>
          <Switch checked={main?.state === 'on'} onCheckedChange={toggleMain} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm flex items-center gap-1.5">
            <ShowerHead className="h-3.5 w-3.5" />
            Recirc Shower
          </span>
          <Switch checked={recirc?.state === 'on'} onCheckedChange={toggleRecirc} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">Recirc Flush</span>
          <Switch checked={flush?.state === 'on'} onCheckedChange={toggleFlush} />
        </div>
      </CardContent>
    </Card>
  );
}

function PropaneCard() {
  const { value: pct } = useEntityNumeric('sensor.propane_tank_percentage');
  const { value: volume } = useEntityNumeric('sensor.propane_liquid_volume');
  const { value: depth } = useEntityNumeric('sensor.propane_liquid_depth');
  const { value: distance } = useEntityNumeric('sensor.propane_raw_distance');
  const lpg = useEntity('switch.a32_pro_switch16_lpg_valve');
  const toggleLpg = useToggle('switch.a32_pro_switch16_lpg_valve');

  const pctNum = pct ?? 0;
  const barColor =
    pctNum < 15 ? 'bg-red-500' : pctNum < 30 ? 'bg-orange-500' : 'bg-green-500';

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Flame className="h-4 w-4" />
          Propane
          <span
            className={cn(
              'ml-auto text-2xl font-bold tabular-nums',
              pctNum < 15 ? 'text-red-500' : pctNum < 30 ? 'text-orange-500' : 'text-green-500',
            )}
          >
            {fmt(pct, 0)}%
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="h-3 rounded-full bg-muted overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all duration-500', barColor)}
            style={{ width: `${Math.min(100, Math.max(0, pctNum))}%` }}
          />
        </div>
        <div className="grid gap-1">
          <SparklineStat entityId="sensor.propane_liquid_volume" label="Volume" value={fmt(volume, 1)} unit="L" color="#22c55e" />
          <SparklineStat entityId="sensor.propane_liquid_depth" label="Liquid Depth" value={fmt(depth, 0)} unit="mm" color="#3b82f6" />
          <SparklineStat entityId="sensor.propane_raw_distance" label="Raw Distance" value={fmt(distance, 0)} unit="mm" color="#64748b" />
        </div>
        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-sm">LPG Valve</span>
          <Switch checked={lpg?.state === 'on'} onCheckedChange={toggleLpg} />
        </div>
      </CardContent>
    </Card>
  );
}

function TankTemps() {
  const { value: freshTemp } = useEntityNumeric('sensor.a32_pro_s5140_channel_38_temperature_fresh_water_tank');
  const { value: greyTemp } = useEntityNumeric('sensor.a32_pro_s5140_channel_39_temperature_grey_water_tank');
  const { value: showerTemp } = useEntityNumeric('sensor.a32_pro_s5140_channel_40_temperature_shower_water_tank');

  const freshHeater = useEntity('switch.a32_pro_fresh_water_tank_heater_enable');
  const greyHeater = useEntity('switch.a32_pro_grey_water_tank_heater_enable');
  const showerHeater = useEntity('switch.a32_pro_shower_water_tank_heater_enable');
  const toggleFreshHeater = useToggle('switch.a32_pro_fresh_water_tank_heater_enable');
  const toggleGreyHeater = useToggle('switch.a32_pro_grey_water_tank_heater_enable');
  const toggleShowerHeater = useToggle('switch.a32_pro_shower_water_tank_heater_enable');

  const tanks = [
    { name: 'Fresh', temp: freshTemp, entityId: 'sensor.a32_pro_s5140_channel_38_temperature_fresh_water_tank', heater: freshHeater, toggleHeater: toggleFreshHeater },
    { name: 'Grey', temp: greyTemp, entityId: 'sensor.a32_pro_s5140_channel_39_temperature_grey_water_tank', heater: greyHeater, toggleHeater: toggleGreyHeater },
    { name: 'Shower', temp: showerTemp, entityId: 'sensor.a32_pro_s5140_channel_40_temperature_shower_water_tank', heater: showerHeater, toggleHeater: toggleShowerHeater },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Thermometer className="h-4 w-4" />
          Tank Temperatures
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {tanks.map((t) => (
          <div key={t.name} className="flex items-center justify-between">
            <SparklineStat
              entityId={t.entityId}
              label={t.name}
              value={fmt(t.temp, 1)}
              unit="°C"
              color={t.temp != null && t.temp < 3 ? '#ef4444' : '#3b82f6'}
              className="flex-1"
            />
            <div className="flex items-center gap-1.5 ml-2 shrink-0">
              <span className="text-[10px] text-muted-foreground">Heat</span>
              <Switch
                checked={t.heater?.state === 'on'}
                onCheckedChange={t.toggleHeater}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function ModeButtons() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Quick Modes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          <ToggleButton
            entityId="input_boolean.shower_mode"
            name="Shower"
            icon={ShowerHead}
            activeColor="cyan"
          />
          <ToggleButton
            entityId="switch.a32_pro_switch06_grey_water_tank_valve"
            name="Grey Dump"
            icon={Trash2}
            activeColor="orange"
          />
        </div>
      </CardContent>
    </Card>
  );
}

export default function Water() {
  return (
    <PageContainer title="Water & Propane">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {/* Column 1: Tanks */}
        <div className="space-y-4">
          <TankLevel
            name="Fresh Water"
            entityId="sensor.a32_pro_fresh_water_tank_level"
            icon={<Droplets className="h-4 w-4 text-blue-500" />}
          />
          <TankLevel
            name="Grey Water"
            entityId="sensor.a32_pro_grey_water_tank_level"
            invertWarning
            icon={<Trash2 className="h-4 w-4 text-orange-500" />}
          />
          <TankTemps />
          <ModeButtons />
        </div>

        {/* Column 2: Controls + Valve Status */}
        <div className="space-y-4">
          <WaterControls />
          <ValveStatus />
        </div>

        {/* Column 3: Propane */}
        <div className="space-y-4">
          <PropaneCard />
        </div>
      </div>
    </PageContainer>
  );
}
