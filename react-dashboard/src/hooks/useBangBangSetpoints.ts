import { useState, useRef, useCallback, useEffect } from 'react';
import { useEntity } from '@/hooks/useEntity';
import { useService } from '@/hooks/useService';

/**
 * The two set points of a bang_bang climate, stepped from the dashboard.
 *
 * ESPHome's bang_bang heats below target_temp_low and goes idle above
 * target_temp_high (cooling: on above high, idle below low). A tap shows at
 * once and goes to climate.set_temperature 400 ms after the last one, so a
 * run of taps is one call; the local value clears when HA reports the new
 * one. Low stays at least half a degree under high, and both stay inside the
 * thermostat's min_temp / max_temp: HA rejects a value outside them, and the
 * local value would then never clear.
 */
export function useBangBangSetpoints(climateEntity: string) {
  const thermostat = useEntity(climateEntity);
  const callService = useService();

  const attrs = thermostat?.attributes ?? {};
  const targetLow = attrs.target_temp_low as number | undefined;
  const targetHigh = attrs.target_temp_high as number | undefined;
  const minTemp = (attrs.min_temp as number | undefined) ?? -Infinity;
  const maxTemp = (attrs.max_temp as number | undefined) ?? Infinity;

  const [localLow, setLocalLow] = useState<number | null>(null);
  const [localHigh, setLocalHigh] = useState<number | null>(null);
  const commitTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Clear the local override when the backend catches up
  useEffect(() => { setLocalLow(null); }, [targetLow]);
  useEffect(() => { setLocalHigh(null); }, [targetHigh]);

  const displayLow = localLow ?? targetLow ?? 0;
  const displayHigh = localHigh ?? targetHigh ?? 0;

  const commit = useCallback(
    (low: number, high: number) => {
      clearTimeout(commitTimer.current);
      commitTimer.current = setTimeout(() => {
        callService('climate', 'set_temperature', {
          target_temp_low: low,
          target_temp_high: high,
        }, { entity_id: climateEntity });
      }, 400);
    },
    [callService, climateEntity],
  );

  const adjustLow = (delta: number) => {
    const low = Math.round((displayLow + delta) * 10) / 10;
    if (low < minTemp || low >= displayHigh - 0.4) return;
    setLocalLow(low);
    commit(low, displayHigh);
  };

  const adjustHigh = (delta: number) => {
    const high = Math.round((displayHigh + delta) * 10) / 10;
    if (high > maxTemp || high <= displayLow + 0.4) return;
    setLocalHigh(high);
    commit(displayLow, high);
  };

  return { thermostat, targetLow, targetHigh, displayLow, displayHigh, adjustLow, adjustHigh };
}
