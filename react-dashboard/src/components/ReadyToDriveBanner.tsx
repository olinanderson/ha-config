/**
 * ReadyToDriveBanner — "are we actually packed up?" guard for the Home page.
 *
 * Appears only when the van is heading toward a drive (engine running, out of
 * Park, or already moving). It recomputes the camp-teardown checklist CLIENT-SIDE
 * from existing entities (so it works even if the HA template sensor is mid-reload)
 * and shows:
 *   • a thin green "Ready to drive" pill when all hard items are stowed/off, or
 *   • a red card listing offenders with per-item "Turn off" + an "I know" dismiss.
 *
 * "Hard" items should be off before driving. "Advisory" items (shore charger,
 * inverter) are shown in amber only — you often legitimately drive with the
 * inverter on (DC-DC charging), so they never block. Mirrors the HA-side
 * sensor.rtd_offenders / automation rtd_guard_warn, which handle the notification.
 *
 * Zero new hardware. Tier-2 (roof-vent / awning / cabinet reed switches) would
 * just add rows here once those Zigbee contact sensors exist.
 */
import { AlertTriangle, CheckCircle2, Power } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useEntity } from '@/hooks/useEntity';
import { useService, useToggle } from '@/hooks/useService';
import { cn } from '@/lib/utils';

const isOn = (s?: string) => s === 'on';

export function ReadyToDriveBanner() {
  // About-to-drive signals
  const engine = useEntity('binary_sensor.engine_is_running');
  const gear = useEntity('sensor.gear_display');
  const moving = useEntity('binary_sensor.vehicle_is_moving');

  // Hard offenders — should be OFF before driving (each turn-off-able from here)
  const grey = useEntity('switch.a32_pro_switch06_grey_water_tank_valve');
  const compressor = useEntity('switch.a32_pro_switch28_compressor');
  const battFan = useEntity('light.0xa4c138fd668411cd');
  const lLight = useEntity('switch.a32_pro_switch21_left_outdoor_lights');
  const rLight = useEntity('switch.a32_pro_switch22_right_outdoor_lights');
  const rearLight = useEntity('switch.a32_pro_switch23_rear_outdoor_lights');
  const lightbar = useEntity('switch.a32_pro_switch31_lightbar');
  const sleep = useEntity('input_boolean.sleep_mode');
  const shower = useEntity('input_boolean.shower_mode');

  // Advisory — amber only, never blocks (you often drive with these on)
  const shore = useEntity('input_boolean.shore_power_charger_enabled');
  const inverter = useEntity('binary_sensor.shelly_em_reachable');

  const override = useEntity('input_boolean.rtd_guard_override');
  const call = useService();
  const toggleOverride = useToggle('input_boolean.rtd_guard_override');

  const hard = [
    { id: 'switch.a32_pro_switch06_grey_water_tank_valve', label: 'Grey dump valve open', on: isOn(grey?.state) },
    { id: 'switch.a32_pro_switch28_compressor', label: 'Compressor on', on: isOn(compressor?.state) },
    { id: 'light.0xa4c138fd668411cd', label: 'Battery vent fan on', on: isOn(battFan?.state) },
    { id: 'switch.a32_pro_switch21_left_outdoor_lights', label: 'Left light on', on: isOn(lLight?.state) },
    { id: 'switch.a32_pro_switch22_right_outdoor_lights', label: 'Right light on', on: isOn(rLight?.state) },
    { id: 'switch.a32_pro_switch23_rear_outdoor_lights', label: 'Rear light on', on: isOn(rearLight?.state) },
    { id: 'switch.a32_pro_switch31_lightbar', label: 'Lightbar on', on: isOn(lightbar?.state) },
    { id: 'input_boolean.sleep_mode', label: 'Sleep mode on', on: isOn(sleep?.state) },
    { id: 'input_boolean.shower_mode', label: 'Shower mode on', on: isOn(shower?.state) },
  ].filter((x) => x.on);

  const advisory = [
    { id: 'input_boolean.shore_power_charger_enabled', label: 'Shore charger enabled', on: isOn(shore?.state), canOff: true },
    { id: 'binary_sensor.shelly_em_reachable', label: 'Inverter on', on: isOn(inverter?.state), canOff: false },
  ].filter((x) => x.on);

  // Only surface the guard when actually heading toward a drive.
  const gearState = gear?.state;
  const aboutToDrive =
    isOn(engine?.state) ||
    (gearState != null && !['Park', '--', 'unknown', 'unavailable'].includes(gearState)) ||
    isOn(moving?.state);
  if (!aboutToDrive) return null;

  const overridden = isOn(override?.state);
  const turnOff = (id: string) => call(id.split('.')[0], 'turn_off', undefined, { entity_id: id });

  // All clear → thin green pill (with advisory note if any).
  if (hard.length === 0) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-1.5 text-sm text-green-400">
        <CheckCircle2 className="h-4 w-4" />
        Ready to drive
        {advisory.length > 0 && (
          <span className="text-xs text-amber-400/80">· {advisory.map((a) => a.label).join(', ')}</span>
        )}
      </div>
    );
  }

  // Offenders → red card.
  return (
    <Card className={cn('border-red-500/40 bg-red-500/10', overridden && 'opacity-60')}>
      <div className="p-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-red-400">
          <AlertTriangle className="h-4 w-4" />
          Not ready to drive — {hard.length} item{hard.length !== 1 ? 's' : ''} need attention
        </div>
        <div className="mt-2 space-y-1">
          {hard.map((o) => (
            <div key={o.id} className="flex items-center justify-between gap-2 text-sm">
              <span>{o.label}</span>
              <button
                onClick={() => turnOff(o.id)}
                className="flex items-center gap-1 rounded-md bg-red-500/20 px-2 py-0.5 text-xs text-red-300 hover:bg-red-500/30"
              >
                <Power className="h-3 w-3" /> Turn off
              </button>
            </div>
          ))}
          {advisory.map((a) => (
            <div key={a.id} className="flex items-center justify-between gap-2 text-xs text-amber-400/90">
              <span>{a.label} — ok to drive</span>
              {a.canOff && (
                <button
                  onClick={() => turnOff(a.id)}
                  className="rounded-md bg-amber-500/20 px-2 py-0.5 hover:bg-amber-500/30"
                >
                  Turn off
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-end">
          <button
            onClick={toggleOverride}
            className="rounded-md border border-border px-2 py-0.5 text-xs text-muted-foreground hover:bg-accent"
          >
            {overridden ? 'Guard silenced ✓' : 'I know — dismiss'}
          </button>
        </div>
      </div>
    </Card>
  );
}
