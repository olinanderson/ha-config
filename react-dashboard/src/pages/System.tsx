import { PageContainer } from '@/components/layout/PageContainer';
import { ToggleButton } from '@/components/ToggleButton';
import { SparklineStat } from '@/components/ClickableValue';
import { StatValue } from '@/components/StatValue';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useEntity, useEntityNumeric } from '@/hooks/useEntity';
import { useToggle, useService } from '@/hooks/useService';
import { useHistoryDialog } from '@/components/EntityHistoryDialog';
import { fmt } from '@/lib/utils';
import {
  Globe,
  BatteryLow,
  Moon,
  ShowerHead,
  Monitor,
  Bed,
  Flame,
  Music,
  Loader2,
} from 'lucide-react';

function StarlinkCard() {
  const { value: down } = useEntityNumeric('sensor.starlink_downlink_throughput_mbps');
  const { value: up } = useEntityNumeric('sensor.starlink_uplink_throughput_mbps');
  const { value: dlSpeed } = useEntityNumeric('sensor.speedtest_download');
  const { value: ulSpeed } = useEntityNumeric('sensor.speedtest_upload');
  const { value: ping } = useEntityNumeric('sensor.speedtest_ping');
  const ethernet = useEntity('binary_sensor.starlink_ethernet_speeds');
  const speedtestRunning = useEntity('input_boolean.speedtest_running');
  const callService = useService();

  const ethOk = ethernet?.state === 'off'; // off = OK
  const isRunning = speedtestRunning?.state === 'on';

  const runSpeedtest = () => {
    if (isRunning) return;
    callService('script', 'turn_on', undefined, { entity_id: 'script.update_speedtest' });
  };
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
        <button
          onClick={runSpeedtest}
          disabled={isRunning}
          className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium py-2 px-3 flex items-center justify-center gap-2 transition-colors"
        >
          {isRunning ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Running…
            </>
          ) : (
            'Run Speedtest'
          )}
        </button>
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
        </div>
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
          <AudioCard />
        </div>
        <div className="space-y-4">
          <ModesCard />
          <SwitchesCard />
        </div>
      </div>
    </PageContainer>
  );
}
