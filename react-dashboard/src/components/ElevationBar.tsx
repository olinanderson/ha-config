import { useEntityNumeric } from '@/hooks/useEntity';
import { useHistoryDialog } from '@/components/EntityHistoryDialog';
import { cn } from '@/lib/utils';

// Feet above sea level from the van's GPS (template/sensors.yaml). It follows
// the GPS while moving and holds still while parked.
const ELEVATION_ID = 'sensor.van_elevation';
const M_PER_FT = 0.3048;
// Sea level to 10,000 ft holds every road on the trip (Tioga Pass, the
// highest, is 9,943 ft); past that the scale grows in 2,000 ft steps.
const SCALE_FT = 10_000;
const STEP_FT = 2_000;
const TICK_FT = 1_000;
// Above this share of the scale the reading goes under the dot, not over it
const FLIP_AT = 0.9;

const grouped = (n: number) => Math.round(n).toLocaleString('en-US');

/** Elevation as a slim vertical bar down the side of the Van page: sea level
 *  at the bottom, a tick every 1,000 ft, and the feet riding on top of the
 *  fill. It stretches to whatever height its row gives it. Tap for history. */
export function ElevationBar({ className }: { className?: string }) {
  const { value, entity } = useEntityNumeric(ELEVATION_ID);
  // In metres if HA ever converts it (it did while it had device_class distance)
  const ft = value != null && entity?.attributes?.unit_of_measurement === 'm' ? value / M_PER_FT : value;
  const { open } = useHistoryDialog();

  const top = ft != null && ft > SCALE_FT ? Math.ceil(ft / STEP_FT) * STEP_FT : SCALE_FT;
  const level = ft == null ? 0 : Math.min(Math.max(ft / top, 0), 1);
  const ticks = Array.from({ length: top / TICK_FT - 1 }, (_, i) => (i + 1) * TICK_FT);
  const pct = `${level * 100}%`;

  return (
    <button
      type="button"
      onClick={() => open(ELEVATION_ID, 'Elevation', 'ft')}
      title={
        ft != null
          ? `${grouped(ft)} ft (${grouped(ft * M_PER_FT)} m) above sea level, from the GPS; held while parked. Tap for history`
          : "Elevation from the van's GPS. Tap for history"
      }
      aria-label={`Elevation ${ft != null ? `${Math.round(ft)} ft` : 'unknown'}`}
      className={cn(
        // On a phone every px of the width comes off the cards
        'relative flex w-4 shrink-0 justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-9',
        className,
      )}
    >
      <span className="relative h-full w-1">
        {/* Track, sea level at the bottom */}
        <span className="absolute inset-0 rounded-full bg-violet-500/15 dark:bg-violet-400/15" />
        {ticks.map((t) => (
          <span
            key={t}
            data-tick
            className="absolute -left-[3px] h-px w-2.5 bg-violet-500/30 dark:bg-violet-400/30"
            style={{ bottom: `${(t / top) * 100}%` }}
          />
        ))}
        <span
          data-fill
          className="absolute inset-x-0 bottom-0 rounded-full bg-gradient-to-t from-violet-600 to-violet-400 dark:from-violet-500 dark:to-violet-300"
          style={{ height: pct }}
        />
        {ft != null && (
          <>
            {/* The dot on the level, ringed in the page colour */}
            <span
              className="absolute left-1/2 h-2.5 w-2.5 -translate-x-1/2 translate-y-1/2 rounded-full bg-violet-400 ring-2 ring-background dark:bg-violet-300"
              style={{ bottom: pct }}
            />
            {/* The reading, on the page colour so the track stops behind it.
                On a phone it runs up the bar, 13 px wide instead of 26. */}
            <span
              className={cn(
                'absolute left-1/2 -translate-x-1/2 rounded bg-background leading-none tabular-nums',
                'max-sm:rotate-180 max-sm:px-px max-sm:py-1 max-sm:[writing-mode:vertical-rl]',
                'sm:flex sm:flex-col sm:items-center sm:px-0.5 sm:py-0.5',
                level > FLIP_AT ? 'translate-y-[calc(100%+8px)]' : '-translate-y-2',
              )}
              style={{ bottom: pct }}
            >
              {/* No thousands comma, like a summit sign and the Wh on this page */}
              <span className="text-[11px] font-semibold sm:text-xs">{Math.round(ft)}</span>
              <span className="text-[9px] text-muted-foreground max-sm:mt-0.5 sm:mt-px">ft</span>
            </span>
          </>
        )}
      </span>
    </button>
  );
}
