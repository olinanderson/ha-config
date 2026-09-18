import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useEntity } from '@/hooks/useEntity';
import { useService } from '@/hooks/useService';
import { cn } from '@/lib/utils';
import { Moon, Fan, Snowflake, Flame, Power, Minus, Plus, Thermometer } from 'lucide-react';

// Night Climate: what runs tonight and the targets it holds. The logic lives in
// HA (automations night_climate_*, template/night_climate.yaml); this card only
// edits the helpers and shows the status line the template builds.
export const MODE_ID = 'input_select.night_climate_mode';
export const FAN_DIRECTION_ID = 'input_select.night_climate_fan_direction';
export const NIGHT_TARGET_ID = 'input_number.night_climate_night_target';
export const HOLD_TARGET_ID = 'input_number.night_climate_hold_target';
export const WAKE_TARGET_ID = 'input_number.night_climate_wake_target';
export const WARMUP_ID = 'input_number.night_climate_warmup_minutes';
export const COOL_ABOVE_ID = 'input_number.night_climate_cool_above';
export const FAN_SPEED_ID = 'input_number.night_climate_fan_speed';
export const USE_HEATER_ID = 'input_boolean.night_climate_use_heater';
export const USE_AC_ID = 'input_boolean.night_climate_use_ac';
export const USE_FAN_ID = 'input_boolean.night_climate_use_fan';
export const WAKE_TIME_ID = 'input_datetime.night_climate_wake_time';
export const STATUS_ID = 'sensor.night_climate_status';
export const ROOM_ID = 'sensor.living_space_temperature';
// The charger drew power within the last 3 h (template/night_climate.yaml). Its
// live draw is no use here: it reads 0 W whenever the battery is full.
export const SHORE_ID = 'binary_sensor.shore_power_present';
export const SLEEP_MODE_ID = 'input_boolean.sleep_mode';

const MODES = [
  { key: 'Off', label: 'Off', icon: Power },
  { key: 'Hold', label: 'Hold', icon: Thermometer },
  { key: 'Program', label: 'Night', icon: Moon },
  { key: 'Fan all night', label: 'Fan', icon: Fan },
  { key: 'A/C all night', label: 'A/C', icon: Snowflake },
  { key: 'Heater', label: 'Heater', icon: Flame },
] as const;

const num = (raw: string | undefined, fallback: number) => {
  if (raw == null || raw === '' || raw === 'unknown' || raw === 'unavailable') return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
};

/** "07:30:00" (input_datetime, time only) → "07:30" for the time input. */
export function wakeTimeValue(raw: string | undefined): string {
  if (!raw || raw === 'unknown' || raw === 'unavailable') return '07:30';
  return raw.slice(0, 5);
}

function Stepper({
  label, entityId, unit, fallback, decimals = 0, onChange,
}: {
  label: string; entityId: string; unit: string; fallback: number; decimals?: number;
  onChange: (entityId: string, value: number) => void;
}) {
  const ent = useEntity(entityId);
  const a = ent?.attributes ?? {};
  const value = num(ent?.state, fallback);
  const min = num(a.min != null ? String(a.min) : undefined, -Infinity);
  const max = num(a.max != null ? String(a.max) : undefined, Infinity);
  const step = num(a.step != null ? String(a.step) : undefined, 1);
  const set = (v: number) => {
    const next = Math.round(Math.max(min, Math.min(max, v)) / step) * step;
    if (next !== value) onChange(entityId, Number(next.toFixed(3)));
  };
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1.5">
        <Button
          variant="outline" size="icon" className="h-7 w-7 rounded-full"
          onClick={() => set(value - step)} disabled={!ent || value <= min}
          aria-label={`Decrease ${label.toLowerCase()}`}
        >
          <Minus className="h-3.5 w-3.5" />
        </Button>
        <span className="w-16 text-center text-sm font-semibold tabular-nums">
          {ent ? `${value.toFixed(decimals)}${unit}` : '—'}
        </span>
        <Button
          variant="outline" size="icon" className="h-7 w-7 rounded-full"
          onClick={() => set(value + step)} disabled={!ent || value >= max}
          aria-label={`Increase ${label.toLowerCase()}`}
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

export function TonightCard() {
  const callService = useService();
  const modeEnt = useEntity(MODE_ID);
  const fanDirEnt = useEntity(FAN_DIRECTION_ID);
  const useHeater = useEntity(USE_HEATER_ID);
  const useAc = useEntity(USE_AC_ID);
  const useFan = useEntity(USE_FAN_ID);
  const wakeTime = useEntity(WAKE_TIME_ID);
  const status = useEntity(STATUS_ID);
  const room = useEntity(ROOM_ID);
  const shore = useEntity(SHORE_ID);
  const sleep = useEntity(SLEEP_MODE_ID);

  if (!modeEnt) return null;

  const mode = modeEnt.state;
  const active = mode !== 'Off' && mode !== 'unknown' && mode !== 'unavailable';
  const onShore = shore?.state === 'on';
  const roomTemp = num(room?.state, NaN);
  const fanDirection = fanDirEnt?.state ?? 'Intake';
  const statusText =
    status?.state && status.state !== 'unknown' && status.state !== 'unavailable' ? status.state : 'Running';

  const selectMode = (option: string) =>
    callService('input_select', 'select_option', { option }, { entity_id: MODE_ID });
  const setNumber = (entityId: string, value: number) =>
    callService('input_number', 'set_value', { value }, { entity_id: entityId });
  const setAllowed = (entityId: string, on: boolean) =>
    callService('input_boolean', on ? 'turn_on' : 'turn_off', undefined, { entity_id: entityId });
  const setWakeTime = (hhmm: string) => {
    if (!/^\d{2}:\d{2}$/.test(hhmm)) return;
    callService('input_datetime', 'set_datetime', { time: `${hhmm}:00` }, { entity_id: WAKE_TIME_ID });
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Moon className={cn('h-4 w-4', active ? 'text-indigo-400' : 'text-muted-foreground')} />
          Climate Program
          <span className="ml-auto flex items-center gap-1.5">
            {Number.isFinite(roomTemp) && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full tabular-nums bg-muted text-muted-foreground">
                Room {roomTemp.toFixed(1)}°
              </span>
            )}
            <span
              className={cn(
                'text-xs font-medium px-2 py-0.5 rounded-full',
                active ? 'bg-indigo-500/10 text-indigo-400' : 'bg-muted text-muted-foreground',
              )}
            >
              {active ? mode : 'Off'}
            </span>
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Mode */}
        <div className="grid grid-cols-6 gap-1">
          {MODES.map((m) => {
            const Icon = m.icon;
            const selected = mode === m.key;
            const needsShore = m.key === 'A/C all night' && !onShore;
            return (
              <Button
                key={m.key}
                variant={selected ? 'default' : 'outline'}
                size="sm"
                className="flex-col h-auto py-2 gap-1 px-1"
                aria-pressed={selected}
                disabled={needsShore}
                title={needsShore ? 'Needs shore power' : undefined}
                onClick={() => selectMode(m.key)}
              >
                <Icon className="h-4 w-4" />
                <span className="text-[11px] leading-none">{m.label}</span>
              </Button>
            );
          })}
        </div>

        {/* Status line from HA */}
        <p className="text-xs text-muted-foreground leading-snug" data-testid="tonight-status">
          {active
            ? statusText
            : sleep?.state === 'on'
              ? 'Sleep Mode is on. Pick a mode to run tonight.'
              : 'Hold keeps the hold target now. The Night schedule or Sleep Mode starts the night program.'}
        </p>

        {/* Targets */}
        <div className="space-y-2">
          <Stepper label="Hold target (now)" entityId={HOLD_TARGET_ID} unit="°" fallback={22} decimals={1} onChange={setNumber} />
          <Stepper label="Night target" entityId={NIGHT_TARGET_ID} unit="°" fallback={15} decimals={1} onChange={setNumber} />
          <Stepper label="Wake target" entityId={WAKE_TARGET_ID} unit="°" fallback={23} decimals={1} onChange={setNumber} />
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground">Wake time</span>
            <input
              type="time"
              aria-label="Wake time"
              value={wakeTimeValue(wakeTime?.state)}
              disabled={!wakeTime}
              onChange={(e) => setWakeTime(e.target.value)}
              className="rounded-md border bg-muted/50 px-2 py-1 text-sm tabular-nums focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <Stepper label="Warm-up before wake" entityId={WARMUP_ID} unit=" min" fallback={45} onChange={setNumber} />
        </div>

        {/* What the Program may use */}
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground">Hold and Night may use</p>
          <div className="grid grid-cols-3 gap-2">
            <label className="flex items-center gap-2 text-sm">
              <Switch
                aria-label="Program may use heater"
                checked={useHeater?.state === 'on'}
                disabled={!useHeater}
                onCheckedChange={(v) => setAllowed(USE_HEATER_ID, v)}
              />
              Heater
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Switch
                aria-label="Program may use A/C"
                checked={useAc?.state === 'on'}
                disabled={!useAc}
                onCheckedChange={(v) => setAllowed(USE_AC_ID, v)}
              />
              A/C
            </label>
            <label className="flex items-center gap-2 text-sm" title="Roof fan on its own thermostat while it is cooler outside">
              <Switch
                aria-label="Program may use roof fan"
                checked={useFan?.state === 'on'}
                disabled={!useFan}
                onCheckedChange={(v) => setAllowed(USE_FAN_ID, v)}
              />
              Fan
            </label>
          </div>
          {/* Hold and Night cool with the roof fan; the A/C only joins above this */}
          <Stepper label="A/C above" entityId={COOL_ABOVE_ID} unit="°" fallback={24} decimals={1} onChange={setNumber} />
          {!onShore && (
            <p className="text-[11px] text-muted-foreground">A/C only runs on shore power.</p>
          )}
        </div>

        {/* Fan all night settings */}
        <div className="space-y-2">
          <Stepper label="Fan speed" entityId={FAN_SPEED_ID} unit="%" fallback={30} onChange={setNumber} />
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground">Fan direction</span>
            <div className="grid grid-cols-2 gap-1.5">
              {(['Intake', 'Exhaust'] as const).map((d) => (
                <Button
                  key={d}
                  variant={fanDirection === d ? 'default' : 'outline'}
                  size="sm"
                  className="h-7 px-3"
                  aria-pressed={fanDirection === d}
                  disabled={!fanDirEnt}
                  onClick={() =>
                    callService('input_select', 'select_option', { option: d }, { entity_id: FAN_DIRECTION_ID })
                  }
                >
                  {d}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
