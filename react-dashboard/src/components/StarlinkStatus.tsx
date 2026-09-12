/**
 * StarlinkStatus — dish status badge + the auto-recovery banner.
 *
 * Background: the DC-DC converter feeding the Starlink PoE injector sometimes
 * latches up while driving. The dish goes completely unreachable and only comes
 * back if the injector is de-energised long enough to drain its capacitors (a
 * quick off/on does nothing), or if the ethernet is pulled at the dish end.
 * HA automates the power-cycle half of that — see script.starlink_recover and
 * automation starlink_auto_recover.
 *
 * Two exports:
 *   <StarlinkBanner />  — only renders while recovering or after both attempts
 *                          failed. Meant for the top of a page.
 *   <StarlinkBadge />   — small always-on status chip for a card header.
 *
 * These read the underlying entities directly rather than trusting the attribute
 * typing on sensor.starlink_status, so a template reload can't blank the UI.
 */
import { SatelliteDish, AlertTriangle, RotateCw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useEntity, useEntityNumeric } from '@/hooks/useEntity';
import { useService } from '@/hooks/useService';
import { useHistoryDialog } from '@/components/EntityHistoryDialog';
import { cn } from '@/lib/utils';

const RECOVER_SCRIPT = 'script.starlink_recover';
// Never script.turn_off the recovery directly — a cancel during the 90 s
// off-window would strand the supply OFF. This script stops it and re-energises.
const ABORT_SCRIPT = 'script.starlink_recover_abort';
const MAX_ATTEMPTS = 2;

type Tone = 'good' | 'warn' | 'bad' | 'idle';

/** Status word → colour tone. Mirrors sensor.starlink_status's precedence. */
function toneFor(status: string): Tone {
  switch (status) {
    case 'Online':
      return 'good';
    case 'Offline':
      return 'bad';
    case 'Recovering':
    case 'Obstructed':
    case 'No Signal':
      return 'warn';
    default:
      // Sleeping / Powered Off — intentional, not a fault.
      return 'idle';
  }
}

const TONE_TEXT: Record<Tone, string> = {
  good: 'text-green-500',
  warn: 'text-orange-500',
  bad: 'text-red-500',
  idle: 'text-muted-foreground',
};

const TONE_BORDER: Record<Tone, string> = {
  good: 'border-green-500/40',
  warn: 'border-orange-500/40',
  bad: 'border-red-500/40',
  idle: 'border-muted-foreground/30',
};

/** Shared state read used by both the banner and the badge. */
function useStarlink() {
  const status = useEntity('sensor.starlink_status');
  const failed = useEntity('input_boolean.starlink_recovery_failed');
  const inProgress = useEntity('input_boolean.starlink_recovery_in_progress');
  const { value: attempts } = useEntityNumeric('input_number.starlink_recovery_attempts');

  return {
    status: status?.state ?? 'Unknown',
    failed: failed?.state === 'on',
    recovering: inProgress?.state === 'on',
    attempt: attempts ?? 0,
  };
}

// ─── Banner ───

export function StarlinkBanner() {
  const { failed, recovering, attempt } = useStarlink();
  const call = useService();

  const runRecovery = () =>
    call('script', 'turn_on', undefined, { entity_id: RECOVER_SCRIPT });
  const stopRecovery = () =>
    call('script', 'turn_on', undefined, { entity_id: ABORT_SCRIPT });
  const clearFailed = () =>
    call('input_boolean', 'turn_off', undefined, {
      entity_id: 'input_boolean.starlink_recovery_failed',
    });

  // Recovery running → amber progress strip.
  if (recovering) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-orange-500/40 bg-orange-500/10 px-3 py-2 text-sm text-orange-300">
        <RotateCw className="h-4 w-4 shrink-0 animate-spin" />
        <span className="font-medium">Starlink recovering</span>
        <span className="text-xs text-orange-300/80">
          · power-cycling the supply — attempt {Math.max(attempt, 1)} of {MAX_ATTEMPTS}
        </span>
        <button
          onClick={stopRecovery}
          className="ml-auto rounded-md border border-orange-500/40 px-2 py-0.5 text-xs hover:bg-orange-500/20"
        >
          Stop
        </button>
      </div>
    );
  }

  if (!failed) return null;

  // Both attempts failed → the loud one. This state means it needs hands.
  return (
    <Card className="border-red-500/50 bg-red-500/10">
      <div className="p-4">
        <div className="flex items-center gap-2 text-base font-semibold text-red-400">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          Starlink is offline — automatic recovery failed
        </div>
        <p className="mt-2 text-sm text-red-200/90">
          Both power cycles of the Starlink supply failed to bring the dish back.
          This one needs hands:
        </p>
        <ol className="mt-2 ml-4 list-decimal space-y-1 text-sm text-red-200/80">
          <li>Unplug the ethernet cable at the <strong>dish</strong> end, wait, reconnect.</li>
          <li>
            Or cut the Starlink power supply switch by hand and leave it off a{' '}
            <strong>full minute</strong> before switching it back on.
          </li>
        </ol>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={runRecovery}
            className="flex items-center gap-1 rounded-md bg-red-500/20 px-2.5 py-1 text-xs text-red-200 hover:bg-red-500/30"
          >
            <RotateCw className="h-3 w-3" /> Try power cycle again
          </button>
          <button
            onClick={clearFailed}
            className="rounded-md border border-border px-2.5 py-1 text-xs text-muted-foreground hover:bg-accent"
          >
            Dismiss
          </button>
        </div>
      </div>
    </Card>
  );
}

// ─── Badge ───

/** Compact status chip for a card header — tap opens the status history. */
export function StarlinkBadge({ className }: { className?: string }) {
  const { status, recovering, attempt } = useStarlink();
  const { open } = useHistoryDialog();
  const tone = toneFor(status);
  const label = recovering
    ? `Recovering ${Math.max(attempt, 1)}/${MAX_ATTEMPTS}`
    : status;

  return (
    <Badge
      variant="outline"
      className={cn(
        'cursor-pointer gap-1',
        TONE_TEXT[tone],
        TONE_BORDER[tone],
        recovering && 'animate-pulse',
        className,
      )}
      onClick={() => open('sensor.starlink_status', 'Starlink Status')}
    >
      <SatelliteDish className="h-3 w-3" />
      {label}
    </Badge>
  );
}
