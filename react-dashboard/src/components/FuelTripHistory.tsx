import { Fuel } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useFuelTrips, fuelEconomyColor } from '@/hooks/useFuelTrips';

function formatDate(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function FuelTripHistory() {
  const { validTrips, summary, loading, error } = useFuelTrips(25);

  const displayTrips = validTrips.slice(0, 10);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Fuel className="h-4 w-4" />
          Trip Economy
          {summary?.avg_l_per_100km != null && (
            <span className={cn('ml-auto text-sm font-normal tabular-nums', fuelEconomyColor(summary.avg_l_per_100km))}>
              avg {summary.avg_l_per_100km.toFixed(1)} L/100km
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-0.5">
        {loading && (
          <p className="text-xs text-muted-foreground py-2">Loading…</p>
        )}
        {error && (
          <p className="text-xs text-red-400 py-2">Error: {error}</p>
        )}
        {!loading && !error && displayTrips.length === 0 && (
          <p className="text-xs text-muted-foreground py-2 leading-relaxed">
            No fill-up-span trips yet — data accumulates between fill-ups
          </p>
        )}
        {displayTrips.map((trip, i) => (
          <div
            key={i}
            className="flex items-center gap-2 py-1 text-xs border-b border-border/30 last:border-0"
          >
            <span className="text-muted-foreground w-12 shrink-0">{formatDate(trip.start_ts)}</span>
            <span className="text-muted-foreground tabular-nums w-14 shrink-0">
              {trip.distance_km.toFixed(0)} km
            </span>
            <span className={cn('tabular-nums font-medium ml-auto', fuelEconomyColor(trip.l_per_100km!))}>
              {trip.l_per_100km!.toFixed(1)} L/100
            </span>
          </div>
        ))}
        {!loading && !error && displayTrips.length > 0 && summary && (
          <div className="flex items-center gap-2 pt-1.5 text-xs text-muted-foreground">
            <span>{displayTrips.length} trips</span>
            <span className="ml-auto">{summary.total_km.toFixed(0)} km total</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
