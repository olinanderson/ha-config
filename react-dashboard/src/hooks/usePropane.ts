import { useEntity, useEntityNumeric } from '@/hooks/useEntity';

export const PROPANE_PCT_ID = 'sensor.propane_tank_percentage';
// The Mopeka Pro Check under the 20 lb tank (BLE, coin cell).
export const PROPANE_LEVEL_ID = 'sensor.pro_check_f317_tank_level';
export const PROPANE_BATTERY_ID = 'sensor.pro_check_f317_battery';

// Below this the Mopeka's readings get unreliable, and it stops a few weeks
// later: 59 % in May 2026, 0 % by late June, silent from 2026-07-23.
const LOW_BATTERY = 15;

export type PropaneProblem = 'dead' | 'low' | null;

/**
 * Propane level with the sensor's own health. When the Mopeka stops reporting
 * HA can only say "unavailable", and the old template turned that into 0 %,
 * which reads as an empty tank. A silent sensor under a fixed tank is almost
 * always its battery, so the dashboard says so instead of showing a number.
 * (No "since" date: HA marked it unavailable on 2026-09-16, weeks after the
 * last reading, so last_changed would be wrong.)
 */
export function usePropane(): { value: number | null; problem: PropaneProblem; battery: number | null } {
  const level = useEntity(PROPANE_LEVEL_ID);
  const { value: pct } = useEntityNumeric(PROPANE_PCT_ID);
  const { value: battery } = useEntityNumeric(PROPANE_BATTERY_ID);
  if (!level || level.state === 'unavailable' || level.state === 'unknown') {
    return { value: null, problem: 'dead', battery: null };
  }
  return { value: pct, problem: battery != null && battery <= LOW_BATTERY ? 'low' : null, battery };
}

/** One line for a tooltip or a card; empty when the sensor is fine. */
export function propaneProblemText(problem: PropaneProblem, battery: number | null): string {
  if (problem === 'dead') return 'Propane sensor not reporting: replace its coin cell (CR2032, under the cap)';
  if (problem === 'low') return `Propane sensor battery ${battery}%: replace its coin cell soon`;
  return '';
}
