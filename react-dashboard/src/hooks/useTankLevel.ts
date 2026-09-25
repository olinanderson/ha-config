import { useEntityNumeric } from '@/hooks/useEntity';

// The water tank senders swing 15–25 points while driving and the grey one
// spikes 20–40 points even parked, so the dashboard shows the stable sensors
// (template/triggered.yaml: 5-min median, held while driving, whole percent).
// Until HA has them (or if they go unavailable) the raw reading is shown.
export const TANK_IDS = {
  fresh: { stable: 'sensor.stable_fresh_water_level', raw: 'sensor.a32_pro_fresh_water_tank_level' },
  grey: { stable: 'sensor.stable_grey_water_level', raw: 'sensor.a32_pro_grey_water_tank_level' },
} as const;

export type Tank = keyof typeof TANK_IDS;

/** Level in % and the entity it came from (for the history dialog). */
export function useTankLevel(tank: Tank): { value: number | null; entityId: string } {
  const ids = TANK_IDS[tank];
  const stable = useEntityNumeric(ids.stable);
  const raw = useEntityNumeric(ids.raw);
  return stable.value != null
    ? { value: stable.value, entityId: ids.stable }
    : { value: raw.value, entityId: ids.raw };
}
