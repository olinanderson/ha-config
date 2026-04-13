import { useState, useEffect, useRef, useCallback } from 'react';
import { useEntity } from '@/hooks/useEntity';
import { useButtonPress } from '@/hooks/useService';
import { cn } from '@/lib/utils';
import { Zap } from 'lucide-react';

const TIMEOUT_MS = 30000;

export function InverterButton({ name = 'Inverter' }: { name?: string }) {
  const pressInverter = useButtonPress('button.a32_pro_inverter_on_off_toggle');
  const entity = useEntity('input_boolean.inverter_state');
  const isOn = entity?.state === 'on';

  const [pending, setPending] = useState(false);
  const stateAtPressRef = useRef<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // When the stored state changes while we're pending, clear loading
  useEffect(() => {
    if (pending && stateAtPressRef.current !== null && entity?.state !== stateAtPressRef.current) {
      setPending(false);
      stateAtPressRef.current = null;
      if (timerRef.current) clearTimeout(timerRef.current);
    }
  }, [entity?.state, pending]);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const handlePress = useCallback(() => {
    if (pending) return;
    pressInverter();
    stateAtPressRef.current = entity?.state ?? null;
    setPending(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setPending(false);
      stateAtPressRef.current = null;
    }, TIMEOUT_MS);
  }, [pressInverter, pending, entity?.state]);

  const colors = {
    border: 'border-green-500',
    bg: 'bg-green-500/10',
    text: 'text-green-500',
    glow: 'shadow-green-500/25',
  };

  return (
    <button
      onClick={handlePress}
      className={cn(
        'flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-300 min-w-[5rem]',
        pending
          ? 'border-yellow-500 bg-yellow-500/10 text-yellow-500 shadow-lg shadow-yellow-500/25'
          : isOn
            ? `${colors.border} ${colors.bg} ${colors.text} shadow-lg ${colors.glow}`
            : 'border-border bg-card text-muted-foreground hover:bg-accent',
      )}
    >
      <Zap
        className={cn(
          'h-5 w-5 transition-transform duration-300',
          pending && 'animate-pulse',
          isOn && !pending && 'scale-110',
        )}
      />
      <span className="text-xs font-medium">
        {pending ? 'Loading…' : isOn ? 'ON' : 'Inverter'}
      </span>
    </button>
  );
}
