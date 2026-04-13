import { useEffect, useState, useRef, createContext, useContext, useCallback, type ReactNode } from 'react';
import { useHistory } from '@/hooks/useHistory';
import { useEntity } from '@/hooks/useEntity';
import { HistoryChart } from '@/components/Chart';
import { cn, timeAgo } from '@/lib/utils';
import { X } from 'lucide-react';

// ─── Dialog context (global open/close) ───

interface DialogState {
  entityId: string;
  name: string;
  unit: string;
}

interface DialogContextValue {
  open: (entityId: string, name: string, unit?: string) => void;
}

const DialogContext = createContext<DialogContextValue>({ open: () => {} });

export function useHistoryDialog() {
  return useContext(DialogContext);
}

// ─── Provider: renders the dialog + provides open function ───

const RANGES = [
  { label: '1h', hours: 1 },
  { label: '6h', hours: 6 },
  { label: '24h', hours: 24 },
  { label: '3d', hours: 72 },
  { label: '7d', hours: 168 },
] as const;

export function HistoryDialogProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DialogState | null>(null);
  const [hours, setHours] = useState(24);
  const backdropPointerDown = useRef(false);

  const open = useCallback((entityId: string, name: string, unit = '') => {
    setState({ entityId, name, unit });
    setHours(24);
  }, []);

  const close = useCallback(() => {
    setState(null);
  }, []);

  // Close on Escape
  useEffect(() => {
    if (!state) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [state, close]);

  const { data, loading } = useHistory(state?.entityId ?? null, hours);

  return (
    <DialogContext.Provider value={{ open }}>
      {children}
      {state && (
        <div
          className="absolute inset-0 z-[9999] flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onMouseDown={(e) => { backdropPointerDown.current = e.target === e.currentTarget; }}
          onTouchStart={(e) => { backdropPointerDown.current = e.target === e.currentTarget; }}
          onClick={(e) => { if (e.target === e.currentTarget && backdropPointerDown.current) close(); backdropPointerDown.current = false; }}
        >
          <div
            className={cn(
              'w-[min(95vw,700px)] max-h-[85vh] overflow-auto',
              'rounded-xl border bg-card text-foreground shadow-2xl',
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <DialogContent
              state={state}
              hours={hours}
              setHours={setHours}
              data={data}
              loading={loading}
              close={close}
            />
          </div>
        </div>
      )}
    </DialogContext.Provider>
  );
}

function DialogContent({
  state,
  hours,
  setHours,
  data,
  loading,
  close,
}: {
  state: DialogState;
  hours: number;
  setHours: (h: number) => void;
  data: import('@/hooks/useHistory').HistoryPoint[];
  loading: boolean;
  close: () => void;
}) {
  const entity = useEntity(state.entityId);
  const currentValue = entity?.state;
  const lastUpdated = entity?.last_updated || entity?.last_changed;
  const lastUpdatedStr = lastUpdated ? timeAgo(lastUpdated) : null;

  return (
    <div className="p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold">{state.name}</h2>
            {currentValue != null && currentValue !== 'unknown' && currentValue !== 'unavailable' && (
              <span className="text-lg font-bold tabular-nums text-primary">
                {currentValue}{state.unit && <span className="text-sm text-muted-foreground ml-0.5">{state.unit}</span>}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <p className="text-xs text-muted-foreground font-mono">{state.entityId}</p>
            {lastUpdatedStr && (
              <p className="text-xs text-muted-foreground">
                · Updated {lastUpdatedStr}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={close}
          className="rounded-md p-1.5 hover:bg-muted transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Time range selector */}
      <div className="flex gap-1">
        {RANGES.map((r) => (
          <button
            key={r.label}
            onClick={() => setHours(r.hours)}
            className={cn(
              'px-3 py-1 rounded-md text-xs font-medium transition-colors',
              hours === r.hours
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground',
            )}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="min-h-[250px] flex items-center justify-center">
        {loading ? (
          <div className="text-sm text-muted-foreground animate-pulse">Loading history…</div>
        ) : (
          <HistoryChart data={data} unit={state.unit} />
        )}
      </div>
    </div>
  );
}
