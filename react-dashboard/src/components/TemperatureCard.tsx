import { Card, CardContent } from '@/components/ui/card';
import { useEntityNumeric } from '@/hooks/useEntity';
import { useHistory } from '@/hooks/useHistory';
import { fmt } from '@/lib/utils';
import { Droplets } from 'lucide-react';
import { Sparkline } from '@/components/Chart';
import { useHistoryDialog } from '@/components/EntityHistoryDialog';

interface TemperatureCardProps {
  name: string;
  tempEntity: string;
  humidityEntity: string;
}

export function TemperatureCard({ name, tempEntity, humidityEntity }: TemperatureCardProps) {
  const { value: temp } = useEntityNumeric(tempEntity);
  const { value: humidity } = useEntityNumeric(humidityEntity);
  const { data: tempHistory } = useHistory(tempEntity, 12);
  const { open } = useHistoryDialog();

  return (
    <Card
      className="cursor-pointer hover:bg-muted/30 transition-colors"
      onClick={() => open(tempEntity, `${name} Temperature`, '°C')}
    >
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">{name}</p>
            <p className="text-2xl font-bold tabular-nums">{fmt(temp, 1)}°C</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Sparkline data={tempHistory} color="#ef4444" width={56} height={18} />
            <div
              className="flex items-center gap-1 text-muted-foreground"
              onClick={(e) => { e.stopPropagation(); open(humidityEntity, `${name} Humidity`, '%'); }}
            >
              <Droplets className="h-3.5 w-3.5" />
              <span className="text-sm tabular-nums">{fmt(humidity, 0)}%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
