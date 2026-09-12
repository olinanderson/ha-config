/**
 * ShopModeBanner — global "the van is deliberately inert" strip.
 *
 * Rendered directly under the nav in App.tsx, so it shows on EVERY page rather
 * than just Home. That placement is the whole point: while Shop Mode is armed
 * nothing responds, and without a persistent reminder the dashboard just looks
 * broken. Renders nothing at all when the mode is off.
 *
 * The "Disarm" affordance is intentionally right here — if the van is not doing
 * what you expect, the fix should be one tap from wherever you already are.
 */
import { useEntity } from '@/hooks/useEntity';
import { useService } from '@/hooks/useService';
import { Wrench } from 'lucide-react';

export function ShopModeBanner() {
  const shopMode = useEntity('input_boolean.shop_mode');
  const call = useService();

  if (shopMode?.state !== 'on') return null;

  const disarm = () =>
    call('input_boolean', 'turn_off', undefined, { entity_id: 'input_boolean.shop_mode' });

  return (
    <div className="flex-none border-b border-amber-500/40 bg-amber-500/15">
      <div className="mx-auto flex max-w-screen-2xl items-center gap-2 px-3 py-1.5 text-sm text-amber-300">
        <Wrench className="h-4 w-4 flex-none" />
        <span className="font-semibold">Shop Mode armed</span>
        <span className="hidden text-amber-400/80 sm:inline">
          · automations disabled, actuators locked off
        </span>
        <button
          onClick={disarm}
          className="ml-auto flex-none rounded-md bg-amber-500/25 px-2 py-0.5 text-xs font-medium transition-colors hover:bg-amber-500/40"
        >
          Disarm
        </button>
      </div>
    </div>
  );
}
