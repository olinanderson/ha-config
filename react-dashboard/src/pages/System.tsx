import { PageContainer } from '@/components/layout/PageContainer';
import { ToggleButton } from '@/components/ToggleButton';
import { SparklineStat } from '@/components/ClickableValue';
import { StatValue } from '@/components/StatValue';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useEntity, useEntityNumeric } from '@/hooks/useEntity';
import { useToggle, useService } from '@/hooks/useService';
import { useHistoryDialog } from '@/components/EntityHistoryDialog';
import { fmt, cn } from '@/lib/utils';
import {
  Wifi,
  Globe,
  BatteryLow,
  Moon,
  ShowerHead,
  Lightbulb,
  Monitor,
  Bed,
  Flame,
  Music,
  Satellite,
  Wind,
  Thermometer,
} from 'lucide-react';

function StarlinkCard() {
  const { value: down } = useEntityNumeric('sensor.starlink_downlink_throughput_mbps');
  const { value: up } = useEntityNumeric('sensor.starlink_uplink_throughput_mbps');
  const { value: dlSpeed } = useEntityNumeric('sensor.speedtest_download');
  const { value: ulSpeed } = useEntityNumeric('sensor.speedtest_upload');
  const { value: ping } = useEntityNumeric('sensor.speedtest_ping');
  const ethernet = useEntity('binary_sensor.starlink_ethernet_speeds');

  const ethOk = ethernet?.state === 'off'; // off = OK
  const { open } = useHistoryDialog();

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Globe className="h-4 w-4" />
          Internet
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div
            className="rounded-lg bg-muted/50 p-2.5 text-center cursor-pointer hover:bg-muted/80 transition-colors"
            onClick={() => open('sensor.starlink_downlink_throughput_mbps', 'Download', 'Mbps')}
          >
            <p className="text-[10px] text-muted-foreground">Download</p>
            <p className="text-xl font-bold tabular-nums">{fmt(down, 1)}</p>
            <p className="text-[10px] text-muted-foreground">Mbps</p>
          </div>
          <div
            className="rounded-lg bg-muted/50 p-2.5 text-center cursor-pointer hover:bg-muted/80 transition-colors"
            onClick={() => open('sensor.starlink_uplink_throughput_mbps', 'Upload', 'Mbps')}
          >
            <p className="text-[10px] text-muted-foreground">Upload</p>
            <p className="text-xl font-bold tabular-nums">{fmt(up, 1)}</p>
            <p className="text-[10px] text-muted-foreground">Mbps</p>
          </div>
        </div>
        <div className="grid gap-1">
          <SparklineStat entityId="sensor.speedtest_download" label="Speedtest DL" value={fmt(dlSpeed, 1)} unit="Mbps" color="#3b82f6" />
          <SparklineStat entityId="sensor.speedtest_upload" label="Speedtest UL" value={fmt(ulSpeed, 1)} unit="Mbps" color="#8b5cf6" />
          <SparklineStat entityId="sensor.speedtest_ping" label="Ping" value={fmt(ping, 0)} unit="ms" color="#f59e0b" />
          <StatValue
            label="Ethernet"
            value={ethOk ? 'OK' : 'Issues'}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function ModesCard() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Modes</CardTitle>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
}

function LightsCard() {
  const callService = useService();

  const lights = [
    { id: 'light.led_controller_cct_1', name: 'Main', color: true },
    { id: 'light.led_controller_cct_2', name: 'Under Cabinet', color: true },
    { id: 'light.led_controller_sc_1', name: 'Shower', color: false },
    { id: 'light.led_controller_sc_2', name: 'Accent', color: false },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Lightbulb className="h-4 w-4" />
          Lights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {lights.map((light) => (
          <LightRow key={light.id} entityId={light.id} name={light.name} />
        ))}
      </CardContent>
    </Card>
  );
}

function LightRow({ entityId, name }: { entityId: string; name: string }) {
  const entity = useEntity(entityId);
  const toggle = useToggle(entityId);
  const callService = useService();
  const isOn = entity?.state === 'on';
  const brightness = entity?.attributes?.brightness ?? 0;
  const pct = Math.round((brightness / 255) * 100);

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-sm">{name}</span>
        <div className="flex items-center gap-2">
          {isOn && <span className="text-xs text-muted-foreground tabular-nums">{pct}%</span>}
          <Switch checked={isOn} onCheckedChange={toggle} />
        </div>
      </div>
      {isOn && (
        <input
          type="range"
          min={0}
          max={100}
          value={pct}
          onChange={(e) =>
            callService('light', 'turn_on', { brightness_pct: Number(e.target.value) }, {
              entity_id: entityId,
            })
          }
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-secondary
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
        />
      )}
    </div>
  );
}

function SwitchesCard() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Switches</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          <ToggleButton
            entityId="switch.a32_pro_do8_switch06_top_monitor"
            name="Top Monitor"
            icon={Monitor}
            activeColor="blue"
          />
          <ToggleButton
            entityId="switch.a32_pro_do8_switch07_bottom_monitor"
            name="Bottom Mon"
            icon={Monitor}
            activeColor="blue"
          />
          <ToggleButton
            entityId="switch.a32_pro_switch27_bed_power_supply"
            name="Bed"
            icon={Bed}
            activeColor="orange"
          />
          <ToggleButton
            entityId="switch.a32_pro_switch16_lpg_valve"
            name="LPG"
            icon={Flame}
            activeColor="red"
          />
          <ToggleButton
            entityId="switch.a32_pro_switch26_starlink_power_supply"
            name="Starlink"
            icon={Satellite}
            activeColor="blue"
          />
          <ToggleButton
            entityId="switch.a32_pro_air_fryer_ventilation_enable"
            name="Air Fryer Vent"
            icon={Wind}
            activeColor="cyan"
          />
        </div>
      </CardContent>
    </Card>
  );
}

function AirFryerCard() {
  const { value: temp } = useEntityNumeric('sensor.a32_pro_s5140_channel_37_temperature_air_fryer_compartment');

  return (
    <Card>
      <CardContent className="pt-4">
        <SparklineStat
          entityId="sensor.a32_pro_s5140_channel_37_temperature_air_fryer_compartment"
          label="Air Fryer Compartment"
          value={fmt(temp, 1)}
          unit="°C"
          icon={Thermometer}
          color="#f97316"
        />
      </CardContent>
    </Card>
  );
}

function AudioCard() {
  const audioStream = useEntity('input_boolean.windows_audio_stream');
  const toggleAudio = useToggle('input_boolean.windows_audio_stream');

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-center justify-between">
          <span className="text-sm flex items-center gap-1.5">
            <Music className="h-3.5 w-3.5" />
            Windows Audio Stream
          </span>
          <Switch checked={audioStream?.state === 'on'} onCheckedChange={toggleAudio} />
        </div>
      </CardContent>
    </Card>
  );
}

export default function System() {
  return (
    <PageContainer title="System">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="space-y-4">
          <StarlinkCard />
          <AirFryerCard />
          <AudioCard />
        </div>
        <div className="space-y-4">
          <ModesCard />
          <SwitchesCard />
        </div>
        <div className="space-y-4">
          <LightsCard />
        </div>
      </div>
    </PageContainer>
  );
}
