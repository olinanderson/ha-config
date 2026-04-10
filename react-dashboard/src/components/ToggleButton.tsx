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

const activeColors: Record<string, string> = {
  green: 'border-green-500 bg-green-500/10 text-green-500',
  blue: 'border-blue-500 bg-blue-500/10 text-blue-500',
  orange: 'border-orange-500 bg-orange-500/10 text-orange-500',
  red: 'border-red-500 bg-red-500/10 text-red-500',
  cyan: 'border-cyan-500 bg-cyan-500/10 text-cyan-500',
  yellow: 'border-yellow-500 bg-yellow-500/10 text-yellow-500',
  purple: 'border-purple-500 bg-purple-500/10 text-purple-500',
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

  return (
    <button
      onClick={onToggle ?? toggle}
      className={cn(
        'flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all min-w-[5rem]',
        isOn
          ? activeColors[activeColor] || activeColors.blue
          : 'border-border bg-card text-muted-foreground hover:bg-accent',
        className,
      )}
    >
      <Icon className="h-5 w-5" />
      <span className="text-xs font-medium">{name}</span>
    </button>
  );
}
