import { Mountain } from 'lucide-react';
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
const SEGMENT_FT = 1_000;
const LABEL_FT = 2_000;

const grouped = (n: number) => Math.round(n).toLocaleString('en-US');

/** Elevation across the whole width of the Van page: feet (metres beside it,
 *  as on BC's summit signs) and a bar of 1,000 ft segments. Tap for history. */
export function ElevationBar({ className }: { className?: string }) {
  const { value, entity } = useEntityNumeric(ELEVATION_ID);
  // In metres if HA ever converts it (it did while it had device_class distance)
  const ft = value != null && entity?.attributes?.unit_of_measurement === 'm' ? value / M_PER_FT : value;
  const { open } = useHistoryDialog();

  const top = ft != null && ft > SCALE_FT ? Math.ceil(ft / LABEL_FT) * LABEL_FT : SCALE_FT;
  const segments = Array.from({ length: top / SEGMENT_FT }, (_, i) => i * SEGMENT_FT);
  const labels = Array.from({ length: top / LABEL_FT + 1 }, (_, i) => i * LABEL_FT);
  const feet = ft != null ? `${grouped(ft)} ft` : '—';

  return (
    <button
      type="button"
      onClick={() => open(ELEVATION_ID, 'Elevation', 'ft')}
      title="Elevation above sea level from the van's GPS, held while parked. Tap for history"
      aria-label={`Elevation ${feet}`}
      className={cn(
        'flex w-full items-center gap-3 rounded-md px-1 text-left transition-colors hover:bg-muted/50',
        className,
      )}
    >
      {/* Fixed width, so the bar doesn't shift as the digits change. 20 px tall,
          the same as the bar and its labels beside it. */}
      <span className="flex w-[8.5rem] shrink-0 items-center gap-1.5">
        <Mountain className="h-4 w-4 shrink-0 text-violet-500 dark:text-violet-400" />
        <span className="text-base font-semibold leading-5 tabular-nums">{feet}</span>
        {ft != null && (
          <span className="text-[10px] tabular-nums text-muted-foreground">{grouped(ft * M_PER_FT)} m</span>
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex h-2 gap-0.5">
          {segments.map((start) => (
            <span key={start} className="flex-1 overflow-hidden rounded-[2px] bg-violet-500/15 dark:bg-violet-400/25">
              <span
                className="block h-full bg-violet-500 dark:bg-violet-400"
                style={{ width: `${ft == null ? 0 : Math.min(Math.max((ft - start) / SEGMENT_FT, 0), 1) * 100}%` }}
              />
            </span>
          ))}
        </span>
        <span className="relative mt-0.5 block h-2.5 text-[9px] leading-[10px] tabular-nums text-muted-foreground">
          {labels.map((v, i) => (
            <span
              key={v}
              className={cn(
                'absolute',
                i === labels.length - 1 ? '-translate-x-full' : i > 0 && '-translate-x-1/2',
              )}
              style={{ left: `${(v / top) * 100}%` }}
            >
              {v === 0 ? '0' : `${v / 1000}K`}
            </span>
          ))}
        </span>
      </span>
    </button>
  );
}
