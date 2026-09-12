/**
 * ShopModeCard — arm/disarm the shop lockout from the System page.
 *
 * Shop Mode (input_boolean.shop_mode) disables every automation except a small
 * keep-alive allowlist and forces every actuator HA can reach off. See
 * script.shop_mode_apply for the authoritative list; this card only drives the
 * toggle and explains the consequences.
 *
 * Arming is deliberately two-step. It is not destructive in the "lost data"
 * sense, but it silently stops ~37 automations, and an accidental tap that
 * closes the LPG valve and kills the water system mid-trip is a bad afternoon.
 * Disarming is one tap — getting OUT of a broken state should never be gated.
 */
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEntity } from '@/hooks/useEntity';
import { useService } from '@/hooks/useService';
import { cn } from '@/lib/utils';
import { Wrench, ShieldAlert, Check, X } from 'lucide-react';

// Mirrors script.shop_mode_apply. Kept as copy so the card explains itself
// without a round-trip; if you change the script, change this text too.
const SHUT_OFF = [
  'LPG valve + hydronic heater (thermostat off)',
  'Water system + grey dump valve',
  'Bed lift power + air compressor',
  'Roof fan + lid closed',
  'All lights, inside and out',
  'Inverter (off and locked)',
  'Shore charger + both monitors',
];

const STAYS_LIVE = [
  'GPS tracking',
  'Battery / BMS monitoring',
  'Starlink + remote access',
];

export function ShopModeCard() {
  const shopMode = useEntity('input_boolean.shop_mode');
  const call = useService();
  const [confirming, setConfirming] = useState(false);

  const isOn = shopMode?.state === 'on';
  const unavailable = shopMode == null || shopMode.state === 'unavailable';

  const arm = () => {
    call('input_boolean', 'turn_on', undefined, { entity_id: 'input_boolean.shop_mode' });
    setConfirming(false);
  };
  const disarm = () =>
    call('input_boolean', 'turn_off', undefined, { entity_id: 'input_boolean.shop_mode' });

  return (
    <Card className={cn(isOn && 'border-amber-500/50 bg-amber-500/5')}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Wrench className={cn('h-4 w-4', isOn && 'text-amber-500')} />
          Shop Mode
          {isOn && (
            <span className="ml-auto rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-400">
              Armed
            </span>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {unavailable ? (
          <p className="text-sm text-muted-foreground">
            Shop Mode helper not loaded. Reload Input Boolean in Developer&nbsp;Tools&nbsp;→&nbsp;YAML.
          </p>
        ) : isOn ? (
          <>
            <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-2.5 text-sm text-amber-300">
              <ShieldAlert className="mt-0.5 h-4 w-4 flex-none" />
              <span>
                Automations are disabled and actuators are locked off. This survives a
                reboot — it will re-apply itself if HA restarts.
              </span>
            </div>
            <div>
              <p className="mb-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                Still running
              </p>
              <div className="flex flex-wrap gap-1">
                {STAYS_LIVE.map((s) => (
                  <span
                    key={s}
                    className="rounded-md bg-green-500/15 px-1.5 py-0.5 text-[11px] text-green-400"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <button
              onClick={disarm}
              className="w-full rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
            >
              Disarm Shop Mode
            </button>
            <p className="text-[11px] leading-snug text-muted-foreground">
              Disarming re-enables automations and restores lights/monitors. Gas, water,
              heat, bed lift, compressor and shore charger stay off until you turn them
              back on yourself (the heater&apos;s power supply comes back so its switch works).
            </p>
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              Locks the van down for a mechanic or body shop: disables automations and
              forces every actuator off.
            </p>
            <div className="grid gap-0.5">
              {SHUT_OFF.map((s) => (
                <div key={s} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <X className="h-3 w-3 flex-none text-red-400/70" />
                  {s}
                </div>
              ))}
            </div>

            {confirming ? (
              <div className="flex gap-2">
                <button
                  onClick={arm}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-amber-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-700"
                >
                  <Check className="h-4 w-4" />
                  Confirm — arm it
                </button>
                <button
                  onClick={() => setConfirming(false)}
                  className="rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirming(true)}
                className="w-full rounded-lg border-2 border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm font-medium text-amber-400 transition-colors hover:bg-amber-500/20"
              >
                Arm Shop Mode…
              </button>
            )}

            <p className="text-[11px] leading-snug text-muted-foreground">
              Physical rocker switches still work, and this cannot stop the shop pulling
              the battery disconnect — which is still the real lockout.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
