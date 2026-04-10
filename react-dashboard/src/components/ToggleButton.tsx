import { useEntity } from '@/hooks/useEntity';
import { useToggle } from '@/hooks/useService';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface ToggleButtonProps {
  entityId: string;
  name: string;
  icon: LucideIcon;
  activeColor?: string;
  className?: string;
  onToggle?: () => void;
}

const activeColors: Record<string, { border: string; bg: string; text: string; glow: string }> = {
  green:  { border: 'border-green-500',  bg: 'bg-green-500/10',  text: 'text-green-500',  glow: 'shadow-green-500/25' },
  blue:   { border: 'border-blue-500',   bg: 'bg-blue-500/10',   text: 'text-blue-500',   glow: 'shadow-blue-500/25' },
  orange: { border: 'border-orange-500', bg: 'bg-orange-500/10', text: 'text-orange-500', glow: 'shadow-orange-500/25' },
  red:    { border: 'border-red-500',    bg: 'bg-red-500/10',    text: 'text-red-500',    glow: 'shadow-red-500/25' },
  cyan:   { border: 'border-cyan-500',   bg: 'bg-cyan-500/10',   text: 'text-cyan-500',   glow: 'shadow-cyan-500/25' },
  yellow: { border: 'border-yellow-500', bg: 'bg-yellow-500/10', text: 'text-yellow-500', glow: 'shadow-yellow-500/25' },
  purple: { border: 'border-purple-500', bg: 'bg-purple-500/10', text: 'text-purple-500', glow: 'shadow-purple-500/25' },
};

export function ToggleButton({
  entityId,
  name,
  icon: Icon,
  activeColor = 'blue',
  onToggle,
  className,
}: ToggleButtonProps) {
  const entity = useEntity(entityId);
  const toggle = useToggle(entityId);
  const isOn = entity?.state === 'on';
  const colors = activeColors[activeColor] || activeColors.blue;

  return (
    <button
      onClick={onToggle ?? toggle}
      className={cn(
        'flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-300 min-w-[5rem]',
        isOn
          ? `${colors.border} ${colors.bg} ${colors.text} shadow-lg ${colors.glow}`
          : 'border-border bg-card text-muted-foreground hover:bg-accent',
        className,
      )}
    >
      <Icon
        className={cn('h-5 w-5 transition-transform duration-300')}
      />
      <span className="text-xs font-medium">{name}</span>
    </button>
  );
}
