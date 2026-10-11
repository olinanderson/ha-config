import { useEntityNumeric } from '@/hooks/useEntity';

// The water tank senders swing 15–25 points while driving and the grey one
// wanders 20–40 points even parked, so the dashboard only ever shows the
// stable sensors (template/triggered.yaml: a rolling median, held while
// driving, whole percent). Every level display and its history dialog goes
// through here, so the raw A32 Pro sensors never reach the screen. A stable
// sensor restores its state across HA restarts and reloads; if it is ever
// unavailable the level shows "—" rather than a noisy raw number.
export const TANK_IDS = {
  fresh: 'sensor.stable_fresh_water_level',
  grey: 'sensor.stable_grey_water_level',
} as const;

export type Tank = keyof typeof TANK_IDS;

/** Level in % and its entity (for the history dialog). */
export function useTankLevel(tank: Tank): { value: number | null; entityId: string } {
  const entityId = TANK_IDS[tank];
  const { value } = useEntityNumeric(entityId);
  return { value, entityId };
}
