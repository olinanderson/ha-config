import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface StatValueProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: LucideIcon;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function StatValue({
  label,
  value,
  unit,
  icon: Icon,
  size = 'sm',
  className,
}: StatValueProps) {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      <span
        className={cn(
          'text-muted-foreground flex items-center gap-1.5',
          size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base',
        )}
      >
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {label}
      </span>
      <span
        className={cn(
          'font-medium tabular-nums',
          size === 'sm' ? 'text-sm' : size === 'md' ? 'text-base' : 'text-lg',
        )}
      >
        {value}
        {unit && <span className="text-muted-foreground ml-0.5 text-xs">{unit}</span>}
      </span>
    </div>
  );
}
