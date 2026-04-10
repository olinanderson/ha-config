import { useEntity } from '@/hooks/useEntity';
import { StatusDot } from '@/components/StatusDot';

export function PresenceBar() {
  const radar = useEntity('binary_sensor.apollo_msr_2_1731d8_radar_target');
  const starlink = useEntity('device_tracker.starlink');
  const powerSave = useEntity('input_boolean.power_saving_mode');
  const sleepMode = useEntity('input_boolean.sleep_mode');
  const engine = useEntity('binary_sensor.engine_is_running');

  const occupied = radar?.state === 'on';
  const slConnected = starlink?.state === 'home';
  const isPowerSave = powerSave?.state === 'on';
  const isSleep = sleepMode?.state === 'on';
  const engineOn = engine?.state === 'on';

  return (
    <div className="flex flex-wrap items-center gap-3 px-1">
      <StatusDot active={occupied} color="green" label={occupied ? 'Occupied' : 'Empty'} />
      <StatusDot active={slConnected} color="blue" label={slConnected ? 'Online' : 'Offline'} />
      {engineOn && <StatusDot active color="orange" label="Engine On" />}
      {isPowerSave && <StatusDot active color="yellow" label="Power Save" />}
      {isSleep && <StatusDot active color="purple" label="Sleep" />}
    </div>
  );
}
