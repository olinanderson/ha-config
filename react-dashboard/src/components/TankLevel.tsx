import { Card, CardContent } from '@/components/ui/card';
import { useEntityNumeric } from '@/hooks/useEntity';
import { fmt, cn } from '@/lib/utils';

interface TankLevelProps {
  name: string;
  entityId: string;
  invertWarning?: boolean;
  icon?: React.ReactNode;
}

export function TankLevel({ name, entityId, invertWarning, icon }: TankLevelProps) {
  const { value: level } = useEntityNumeric(entityId);
  const lvl = level ?? 0;

  const barColor = invertWarning
    ? lvl > 80
      ? 'bg-red-500'
      : lvl > 60
        ? 'bg-orange-500'
        : 'bg-green-500'
    : lvl < 20
      ? 'bg-red-500'
      : lvl < 50
        ? 'bg-orange-500'
        : 'bg-blue-500';

  return (
    <Card>
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium flex items-center gap-1.5">
            {icon}
            {name}
          </p>
          <p className="text-lg font-bold tabular-nums">{fmt(level, 0)}%</p>
        </div>
        <div className="h-3 rounded-full bg-muted overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all duration-500', barColor)}
            style={{ width: `${Math.min(100, Math.max(0, lvl))}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
