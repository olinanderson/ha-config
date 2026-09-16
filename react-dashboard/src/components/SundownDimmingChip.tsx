import { useEntity } from '@/hooks/useEntity';
import { useToggle } from '@/hooks/useService';
import { cn } from '@/lib/utils';
import { Moon, Sunset } from 'lucide-react';

// Sundown dimming: indoor lights get a brightness ceiling at sundown and a lower
// one after dark (sensor.indoor_light_phase + the "Indoor Lights – Sundown"
// automations). Tapping toggles it; the label shows the ceiling in force now.
export function SundownDimmingChip() {
  const enable = useEntity('input_boolean.indoor_light_sun_dimming');
  const phase = useEntity('sensor.indoor_light_phase');
  const toggle = useToggle('input_boolean.indoor_light_sun_dimming');
  const isOn = enable?.state === 'on';
  const pct = phase?.attributes?.max_brightness_pct;

  let label = 'Sundown dim';
  if (!isOn) label = 'Sundown dim off';
  else if (phase?.state === 'twilight') label = `Sundown · ${pct}%`;
  else if (phase?.state === 'dark') label = `After dark · ${pct}%`;
  const Icon = isOn && phase?.state === 'dark' ? Moon : Sunset;

  return (
    <button
      onClick={toggle}
      title="Dim the indoor lights at sundown and again after dark"
      className={cn(
        'flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium transition-colors',
        isOn
          ? 'border-orange-500/60 bg-orange-500/10 text-orange-500'
          : 'border-border text-muted-foreground hover:bg-accent',
      )}
    >
      <Icon className="h-3 w-3" />
      {label}
    </button>
  );
}
