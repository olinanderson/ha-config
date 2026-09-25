import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useEntity, useEntityNumeric } from '@/hooks/useEntity';
import { useService } from '@/hooks/useService';
import { cn } from '@/lib/utils';
import { Thermometer, Flame, Snowflake, Fan, Power, Minus, Plus } from 'lucide-react';

// The back of the van at a glance while driving, and the smallest control that
// can do something about it. Auto and Fan write the Climate Program's own mode,
// so this card and the Climate page can never disagree: HA still decides what
// runs, this only says what it should aim for. Off is a script in HA, because
// choosing Off on the mode does nothing while it already reads Off and never
// reaches an appliance started from its own card.
//   Off  — heater, roof fan and A/C off, however they were started
//   Auto — the program's Hold mode: keep the living space at the target, the
//          heater below it, the roof fan or the A/C above it. The one control
//          that both heats and cools, so it is the only one with a target.
//   Fan  — roof fan at the speed and direction set on the Climate page
// Each button says in a word what it does and the line under them says what
// is happening now, so the card is understood without the Climate page.
export const ROOM_ID = 'sensor.living_space_temperature';
// Cached ambient (template sensor): holds its reading when the WiCAN stops
// publishing, so the outside line never blanks at a stop.
export const OUTSIDE_ID = 'sensor.ambient_air_temp_last_good';
export const MODE_ID = 'input_select.night_climate_mode';
export const HOLD_TARGET_ID = 'input_number.night_climate_hold_target';
export const TARGET_ID = 'sensor.night_climate_target';
export const STATUS_ID = 'sensor.night_climate_status';
export const HEATER_ID = 'climate.a32_pro_van_hydronic_heating_pid';
export const AC_ID = 'climate.ag_pro_24v_air_conditioner';
export const FAN_ID = 'fan.ag_pro_roof_fan';
export const FAN_THERMOSTAT_ID = 'switch.ag_pro_roof_fan_thermostat';
export const FAN_POWER_ID = 'sensor.roof_fan_power_12v';
// Ends the program, then the heater, fan and A/C (scripts.yaml). The fan and
// A/C go through the program's own off scripts, which never send the A/C's
// power toggle to a unit that is not really running.
export const OFF_SCRIPT_ID = 'script.living_space_off';

export const MODES = [
  {
    key: 'Off',
    label: 'Off',
    caption: 'all off',
    icon: Power,
    title: 'Heater, roof fan and A/C off, however they were started',
  },
  {
    key: 'Hold',
    label: 'Auto',
    caption: 'heat or cool',
    icon: Thermometer,
    title: 'Keep the living space at the target — heater below it, roof fan or A/C above it',
  },
  {
    key: 'Fan all night',
    label: 'Fan',
    caption: 'roof fan',
    icon: Fan,
    title: 'Roof fan at the speed and direction set on the Climate page',
  },
] as const;

// The Climate page can also set Night, Heater or A/C all night. Those are not
// worth a button at the wheel, but the badge names them so the card never
// claims to be Off while something is running. Modes with a button show as
// the selected button instead.
const BADGE: Record<string, string> = {
  Program: 'Night',
  Heater: 'Heater',
  'A/C all night': 'A/C',
};

// Problems HA's status line reports (template/night_climate.yaml). The card's
// own sentence carries the first one, since it is why nothing heats or cools.
const WARNINGS = [
  'A/C needs shore power',
  'heater supply is off',
  'heater fuel lockout',
  'Shop Mode blocks the heater',
];

// Within this of the target the room counts as there. The program's own
// deadbands are wider, so "At target" does not flicker against them.
const AT_TARGET = 0.5;

type Tone = 'heat' | 'cool' | 'warn' | 'ok' | 'idle';

const TONE: Record<Tone, string> = {
  heat: 'text-amber-500',
  cool: 'text-cyan-500',
  warn: 'text-orange-400',
  ok: 'text-green-500',
  idle: 'text-muted-foreground',
};

const num = (raw: string | undefined, fallback: number) => {
  if (raw == null || raw === '' || raw === 'unknown' || raw === 'unavailable') return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
};

const deg = (t: number | null) => (t != null ? `${t.toFixed(1)}°` : '—');

/**
 * Living space, °C — a comfort scale, not a fault scale, so it stays neutral
 * through the range you would actually sit in and only colours at the ends.
 * Below 5 °C the plumbing is the worry; above 28 °C it is the sleeping.
 */
function roomTempColor(t: number | null): string {
  if (t == null) return 'text-foreground';
  if (t < 5) return 'text-sky-400';
  if (t < 15) return 'text-cyan-400';
  if (t <= 27) return 'text-foreground';
  if (t < 31) return 'text-amber-400';
  return 'text-orange-400';
}

/** One "this is running" pill, from the appliance's own entity. */
function RunningPill({
  label, icon: Icon, className, spin,
}: {
  label: string; icon: typeof Flame; className: string; spin?: boolean;
}) {
  return (
    <span
      className={cn('flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium', className)}
    >
      <Icon className={cn('h-3 w-3', spin && 'animate-spin')} style={spin ? { animationDuration: '2s' } : undefined} />
      {label}
    </span>
  );
}

export function LivingSpaceCard() {
  const callService = useService();
  const modeEnt = useEntity(MODE_ID);
  const { value: room } = useEntityNumeric(ROOM_ID);
  const { value: outside } = useEntityNumeric(OUTSIDE_ID);
  const holdEnt = useEntity(HOLD_TARGET_ID);
  const { value: target } = useEntityNumeric(TARGET_ID);
  const status = useEntity(STATUS_ID);
  const heater = useEntity(HEATER_ID);
  const ac = useEntity(AC_ID);
  const fan = useEntity(FAN_ID);
  const fanThermo = useEntity(FAN_THERMOSTAT_ID);
  const { value: fanWatts } = useEntityNumeric(FAN_POWER_ID);
  const offScript = useEntity(OFF_SCRIPT_ID);

  const mode = modeEnt?.state ?? '';
  const known = mode !== '' && mode !== 'unknown' && mode !== 'unavailable';
  const active = known && mode !== 'Off';
  const auto = mode === 'Hold';
  // One of this card's three buttons. Night / Heater / A/C all night are set
  // on the Climate page and get the badge.
  const ownMode = MODES.some((m) => m.key === mode);

  const heating = heater?.state === 'heat';
  const cooling = ac?.state === 'cool';
  // Under its own thermostat the fan entity stays off while the motor cycles,
  // so the draw is the only sign it is turning.
  const fanArmed = fan?.state === 'on' || fanThermo?.state === 'on';
  const fanTurning = fanWatts != null ? fanWatts > 2 : fan?.state === 'on';
  // The mode can read Off while an appliance started from its own card runs.
  // Then Off is not what is in effect, so it is not shown selected.
  const somethingOn = heating || cooling || fanArmed;
  const offByHand = mode === 'Off' && somethingOn;

  const holdTarget = num(holdEnt?.state, 22);
  const holdMin = num(holdEnt?.attributes?.min != null ? String(holdEnt.attributes.min) : undefined, 5);
  const holdMax = num(holdEnt?.attributes?.max != null ? String(holdEnt.attributes.max) : undefined, 35);
  const holdStep = num(holdEnt?.attributes?.step != null ? String(holdEnt.attributes.step) : undefined, 0.5);

  const setHold = (v: number) => {
    const next = Math.round(Math.max(holdMin, Math.min(holdMax, v)) / holdStep) * holdStep;
    if (next !== holdTarget) {
      callService('input_number', 'set_value', { value: Number(next.toFixed(2)) }, { entity_id: HOLD_TARGET_ID });
    }
  };
  const selectMode = (option: string) =>
    callService('input_select', 'select_option', { option }, { entity_id: MODE_ID });
  const allOff = () => callService('script', 'turn_on', undefined, { entity_id: OFF_SCRIPT_ID });

  const statusText =
    status?.state && status.state !== 'unknown' && status.state !== 'unavailable' ? status.state : null;
  const warning = statusText ? WARNINGS.find((w) => statusText.includes(w)) : undefined;
  const until = statusText?.match(/until (\d{1,2}:\d{2})/)?.[1];
  // What the room is being taken to: the hold target in Auto, the program's
  // own (night / wake) target otherwise.
  const aim = auto ? (holdEnt ? holdTarget : null) : target;

  // What is happening now, in one sentence. HA's full line is its tooltip.
  const now = ((): { text: string; tone: Tone } => {
    const running = [heating && 'heater', cooling && 'A/C', fanArmed && 'roof fan'].filter(Boolean).join(' + ');
    const tail = warning ? ` · ${warning}` : '';
    if (!known) return { text: 'Climate program not reachable', tone: 'warn' };
    if (mode === 'Off') {
      return somethingOn
        ? { text: `${running} on from its own card · Off turns it off`, tone: 'warn' }
        : { text: 'Everything off · Auto heats or cools to a target', tone: 'idle' };
    }
    if (mode === 'Fan all night') {
      return { text: fanArmed ? `Roof fan on${until ? ` until ${until}` : ''}` : 'Roof fan starting', tone: 'cool' };
    }
    if (heating) return { text: `▲ Heating to ${deg(aim)} · ${running}${tail}`, tone: 'heat' };
    if (cooling || fanArmed) return { text: `▼ Cooling to ${deg(aim)} · ${running}${tail}`, tone: 'cool' };
    const tone: Tone = warning ? 'warn' : 'idle';
    if (mode === 'A/C all night') return { text: `A/C all night · not running${tail}`, tone };
    if (aim == null || room == null) return { text: `Waiting for a reading${tail}`, tone };
    if (room > aim + AT_TARGET) {
      const why = warning ?? (outside != null && outside >= room - 1 ? 'not cooler outside for the fan' : 'cooling next');
      return { text: `Warmer than ${deg(aim)} · ${why}`, tone };
    }
    if (room < aim - AT_TARGET) return { text: `Cooler than ${deg(aim)} · ${warning ?? 'heater next'}`, tone };
    return { text: `At target ${deg(aim)}${tail}`, tone: warning ? 'warn' : 'ok' };
  })();

  return (
    <Card>
      <CardHeader className="pb-2 max-sm:pt-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <Thermometer className={cn('h-4 w-4', active ? 'text-indigo-400' : 'text-muted-foreground')} />
          Living Space
          <span className="ml-auto flex items-center gap-1.5" data-testid="living-space-running">
            {heating && (
              <RunningPill label="Heat" icon={Flame} className="bg-amber-500/10 text-amber-500" />
            )}
            {cooling && (
              <RunningPill label="A/C" icon={Snowflake} className="bg-cyan-500/10 text-cyan-500" />
            )}
            {fanArmed && (
              <RunningPill label="Fan" icon={Fan} className="bg-cyan-500/10 text-cyan-500" spin={fanTurning} />
            )}
            {active && !ownMode && (
              <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-xs font-medium text-indigo-400">
                {BADGE[mode] ?? mode}
              </span>
            )}
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-2 sm:pt-4">
        {/* Reading and target share a row even on a phone, where this card sits
            under the trip card and all of them have to fit one screen. On a
            wide screen the buttons join the same strip. */}
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 sm:justify-start">
          {/* What it is back there */}
          <div className="flex items-baseline gap-2">
            <p className={cn('text-4xl font-bold leading-none tabular-nums', roomTempColor(room))}>
              {room != null ? `${room.toFixed(1)}°` : '—'}
            </p>
            <p className="text-[11px] text-muted-foreground tabular-nums">
              {outside != null ? `Outside ${outside.toFixed(0)}°` : 'Outside —'}
            </p>
          </div>

          {/* What it should be, only where there is a target. In Auto turn it
              up and the heater runs, down and the roof fan or the A/C does.
              Night and Heater show theirs read-only; Off and Fan have none. */}
          {auto ? (
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-muted-foreground">Target</span>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline" size="icon" className="h-9 w-9 shrink-0 rounded-full"
                  onClick={() => setHold(holdTarget - holdStep)}
                  disabled={!holdEnt || holdTarget <= holdMin}
                  aria-label="Decrease target"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-16 text-center text-2xl font-bold leading-none tabular-nums">
                  {holdEnt ? deg(holdTarget) : '—'}
                </span>
                <Button
                  variant="outline" size="icon" className="h-9 w-9 shrink-0 rounded-full"
                  onClick={() => setHold(holdTarget + holdStep)}
                  disabled={!holdEnt || holdTarget >= holdMax}
                  aria-label="Increase target"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            active && !ownMode && target != null && (
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-muted-foreground">Target</span>
                <p className="text-2xl font-bold leading-none tabular-nums text-indigo-400">{deg(target)}</p>
              </div>
            )
          )}

          {/* Three targets big enough to hit on a bumpy road, each saying what
              it does */}
          <div className="grid w-full grid-cols-3 gap-2 sm:ml-auto sm:w-auto sm:min-w-[21rem]">
            {MODES.map((m) => {
              const Icon = m.icon;
              const isOff = m.key === 'Off';
              const selected = mode === m.key && !(isOff && offByHand);
              return (
                <Button
                  key={m.key}
                  variant={selected ? 'default' : 'outline'}
                  className="h-11 gap-2 px-1"
                  aria-pressed={selected}
                  aria-label={m.label}
                  disabled={isOff ? !offScript : !modeEnt}
                  title={m.title}
                  onClick={() => (isOff ? allOff() : selectMode(m.key))}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="flex flex-col items-start leading-none">
                    <span className="text-sm font-semibold">{m.label}</span>
                    <span
                      className={cn(
                        'mt-0.5 text-[10px] font-normal',
                        selected ? 'opacity-80' : 'text-muted-foreground',
                      )}
                    >
                      {m.caption}
                    </span>
                  </span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* One line, so its height on a phone is known */}
        <p
          className={cn('mt-2 truncate text-xs font-medium leading-snug sm:mt-3', TONE[now.tone])}
          title={statusText ?? undefined}
          data-testid="living-space-status"
        >
          {now.text}
        </p>
      </CardContent>
    </Card>
  );
}
