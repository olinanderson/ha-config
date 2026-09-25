import { useCallback } from 'react';
import { BatteryWarning, Droplets, Flame, Lightbulb, Trash2 } from 'lucide-react';
import { useEntity } from '@/hooks/useEntity';
import { useTankLevel } from '@/hooks/useTankLevel';
import { usePropane, propaneProblemText, PROPANE_PCT_ID } from '@/hooks/usePropane';
import { useService } from '@/hooks/useService';
import { useHistoryDialog } from '@/components/EntityHistoryDialog';
import { cn, fmt } from '@/lib/utils';

export const LIGHT_IDS = [
  'light.led_controller_cct_1',
  'light.led_controller_cct_2',
  'light.led_controller_sc_1',
  'light.led_controller_sc_2',
];

// One line each, so the row costs the phone driving screen as little height as
// possible (docs/react-dashboard.md → Van Page on a Phone).
function Chip({
  label,
  value,
  color,
  icon: Icon,
  title,
  onClick,
  alert,
  warn,
}: {
  label: string;
  value: string;
  color: string;
  icon: React.ElementType;
  title: string;
  onClick: () => void;
  /** The value is a problem, not a reading: it takes the label's room on a phone. */
  alert?: boolean;
  /** A reading with a problem beside it (low sensor battery). */
  warn?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={`${label} ${value}`}
      className="flex h-9 min-w-0 items-center justify-center gap-1.5 rounded-lg border bg-card px-2 transition-colors hover:bg-accent active:bg-accent/80"
    >
      <Icon className={cn('h-4 w-4 shrink-0', color)} />
      <span className={cn('truncate text-[11px] text-muted-foreground', alert && 'max-sm:hidden')}>{label}</span>
      <span
        className={cn(
          'font-semibold tabular-nums',
          alert ? 'truncate text-xs text-orange-400' : 'text-sm',
        )}
      >
        {value}
      </span>
      {warn && <BatteryWarning className="h-3.5 w-3.5 shrink-0 text-orange-400" />}
    </button>
  );
}

const pct = (n: number | null) => (n == null ? '—' : `${fmt(n, 0)}%`);

/** Propane, fresh and grey water, and the lights, at the top of the Van page. */
export function VanBadges() {
  const { value: propane, problem: propaneProblem, battery: propaneBattery } = usePropane();
  const { value: fresh, entityId: freshId } = useTankLevel('fresh');
  const { value: grey, entityId: greyId } = useTankLevel('grey');
  const l1 = useEntity(LIGHT_IDS[0]);
  const l2 = useEntity(LIGHT_IDS[1]);
  const l3 = useEntity(LIGHT_IDS[2]);
  const l4 = useEntity(LIGHT_IDS[3]);
  const lightsOn = [l1, l2, l3, l4].filter((l) => l?.state === 'on').length;

  const { open } = useHistoryDialog();
  const callService = useService();
  const toggleLights = useCallback(() => {
    callService('light', lightsOn > 0 ? 'turn_off' : 'turn_on', undefined, {
      entity_id: LIGHT_IDS,
    });
  }, [callService, lightsOn]);

  return (
    <div className="grid grid-cols-4 gap-2">
      <Chip
        label="Propane"
        value={propaneProblem === 'dead' ? 'Battery dead' : pct(propane)}
        alert={propaneProblem === 'dead'}
        warn={propaneProblem === 'low'}
        color={
          propane == null
            ? 'text-muted-foreground'
            : propane < 15
              ? 'text-red-500'
              : propane < 30
                ? 'text-orange-500'
                : 'text-green-500'
        }
        icon={Flame}
        title={propaneProblemText(propaneProblem, propaneBattery) || 'Propane history'}
        onClick={() => open(PROPANE_PCT_ID, 'Propane', '%')}
      />
      <Chip
        label="Fresh"
        value={pct(fresh)}
        color={
          fresh == null
            ? 'text-muted-foreground'
            : fresh < 20
              ? 'text-red-500'
              : fresh < 50
                ? 'text-orange-500'
                : 'text-blue-500'
        }
        icon={Droplets}
        title="Fresh water history"
        onClick={() => open(freshId, 'Fresh Water', '%')}
      />
      <Chip
        label="Grey"
        value={pct(grey)}
        color={
          grey == null
            ? 'text-muted-foreground'
            : grey > 80
              ? 'text-red-500'
              : grey > 60
                ? 'text-orange-500'
                : 'text-green-500'
        }
        icon={Trash2}
        title="Grey water history"
        onClick={() => open(greyId, 'Grey Water', '%')}
      />
      <Chip
        label="Lights"
        value={lightsOn > 0 ? `${lightsOn} on` : 'Off'}
        color={lightsOn > 0 ? 'text-yellow-500' : 'text-muted-foreground'}
        icon={Lightbulb}
        title={lightsOn > 0 ? 'Turn all lights off' : 'Turn all lights on'}
        onClick={toggleLights}
      />
    </div>
  );
}
