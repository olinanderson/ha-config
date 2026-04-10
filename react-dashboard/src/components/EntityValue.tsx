import { useEntity } from '@/hooks/useEntity';
import { cn } from '@/lib/utils';

interface EntityValueProps {
  entityId: string;
  name?: string;
  unit?: string;
  decimals?: number;
  className?: string;
}

export function EntityValue({
  entityId,
  name,
  unit,
  decimals = 1,
  className,
}: EntityValueProps) {
  const entity = useEntity(entityId);
  const state = entity?.state ?? '—';
  const numVal = Number(state);
  const display = Number.isFinite(numVal) ? numVal.toFixed(decimals) : state;
  const unitStr = unit ?? entity?.attributes?.unit_of_measurement ?? '';

  return (
    <div className={cn('flex items-center justify-between', className)}>
      {name && <span className="text-sm text-muted-foreground">{name}</span>}
      <span className="text-sm font-medium tabular-nums">
        {display}
        {unitStr && <span className="text-muted-foreground ml-0.5 text-xs">{unitStr}</span>}
      </span>
    </div>
  );
}
