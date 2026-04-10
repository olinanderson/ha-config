import { cn } from '@/lib/utils';

interface StatusDotProps {
  active: boolean;
  color?: string;
  label?: string;
  className?: string;
}

const colorMap: Record<string, string> = {
  green: 'bg-green-500',
  red: 'bg-red-500',
  orange: 'bg-orange-500',
  blue: 'bg-blue-500',
  yellow: 'bg-yellow-500',
  cyan: 'bg-cyan-500',
  purple: 'bg-purple-500',
};

export function StatusDot({ active, color = 'green', label, className }: StatusDotProps) {
  const colorClass = color.startsWith('bg-') ? color : (colorMap[color] ?? 'bg-green-500');
  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <span
        className={cn(
          'h-2.5 w-2.5 rounded-full shrink-0',
          active ? colorClass : 'bg-muted-foreground/30',
        )}
      />
      {label && <span className="text-xs text-muted-foreground">{label}</span>}
    </div>
  );
}
