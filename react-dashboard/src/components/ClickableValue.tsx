import { useHistory, type HistoryPoint } from '@/hooks/useHistory';
import { Sparkline } from '@/components/Chart';
import { useHistoryDialog } from '@/components/EntityHistoryDialog';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

// ─── ClickableValue: wraps any child and opens history dialog on click ───

interface ClickableValueProps {
  entityId: string;
  name: string;
  unit?: string;
  children: React.ReactNode;
  className?: string;
}

export function ClickableValue({ entityId, name, unit = '', children, className }: ClickableValueProps) {
  const { open } = useHistoryDialog();
  return (
    <div
      className={cn('cursor-pointer hover:bg-muted/50 rounded-md transition-colors -mx-1 px-1', className)}
      onClick={() => open(entityId, name, unit)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') open(entityId, name, unit); }}
    >
      {children}
    </div>
  );
}

// ─── SparklineStat: label + sparkline + value, clickable for full history ───

interface SparklineStatProps {
  entityId: string;
  label: string;
  value: string | number;
  unit?: string;
  icon?: LucideIcon;
  color?: string;
  hours?: number;
  className?: string;
}

export function SparklineStat({
  entityId,
  label,
  value,
  unit = '',
  icon: Icon,
  color = '#3b82f6',
  hours = 6,
  className,
}: SparklineStatProps) {
  const { data } = useHistory(entityId, hours);
  const { open } = useHistoryDialog();

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-2 cursor-pointer hover:bg-muted/50 rounded-md transition-colors -mx-1 px-1 py-0.5',
        className,
      )}
      onClick={() => open(entityId, label, unit)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') open(entityId, label, unit); }}
    >
      <span className="text-xs text-muted-foreground flex items-center gap-1.5 shrink-0">
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {label}
      </span>
      <div className="flex items-center gap-2">
        <Sparkline data={data} color={color} width={64} height={20} />
        <span className="font-medium tabular-nums text-sm shrink-0">
          {value}
          {unit && <span className="text-muted-foreground ml-0.5 text-xs">{unit}</span>}
        </span>
      </div>
    </div>
  );
}
