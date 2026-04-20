import { useState, useCallback, useEffect } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardContent } from '@/components/ui/card';
import { useHassStore } from '@/context/HomeAssistantContext';
import { cn } from '@/lib/utils';
import {
  Clock,
  Plus,
  Trash2,
  Pencil,
  X,
  RefreshCw,
  Play,
  CalendarDays,
  Repeat2,
  CheckCircle2,
  Timer,
  Sparkles,
  BellRing,
  PauseCircle,
  Radio,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────

interface SchedulerAction {
  service: string;
  entity_id: string;
  service_data: Record<string, any>;
}

interface Timeslot {
  start: string; // "HH:MM:SS"
  stop: string | null;
  actions: SchedulerAction[];
  conditions: any[];
  condition_type: string | null;
  track_conditions: boolean;
}

interface ScheduleEntry {
  schedule_id: string;
  weekdays: string[];
  timeslots: Timeslot[];
  repeat_type: 'pause' | 'repeat' | 'single';
  name: string | null;
  enabled: boolean;
  next_entries: number[];
  timestamps: string[];
  entity_id: string;
  tags: string[];
}

interface ActionDef {
  service: string;
  label: string;
  dataField?: {
    key: string;
    type: 'number' | 'text';
    min?: number;
    max?: number;
    step?: number;
    placeholder?: string;
    unit?: string;
  };
}

interface EditorState {
  name: string;
  time: string;
  daily: boolean;
  selectedDays: string[];
  repeatType: 'pause' | 'repeat' | 'single';
  domain: string;
  entityId: string;
  service: string;
  serviceDataValue: string;
}

// ─── Constants ────────────────────────────────────────────────────────────

const DAYS_ORDER = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;

const DAY_LABELS: Record<string, string> = {
  mon: 'Mo', tue: 'Tu', wed: 'We', thu: 'Th', fri: 'Fr', sat: 'Sa', sun: 'Su',
};

const DOMAIN_ACTIONS: Record<string, ActionDef[]> = {
  switch: [
    { service: 'switch.turn_on', label: 'Turn On' },
    { service: 'switch.turn_off', label: 'Turn Off' },
  ],
  light: [
    { service: 'light.turn_on', label: 'Turn On' },
    { service: 'light.turn_off', label: 'Turn Off' },
  ],
  fan: [
    { service: 'fan.turn_on', label: 'Turn On' },
    { service: 'fan.turn_off', label: 'Turn Off' },
    {
      service: 'fan.set_percentage',
      label: 'Set Speed',
      dataField: { key: 'percentage', type: 'number', min: 0, max: 100, step: 10, unit: '%' },
    },
  ],
  climate: [
    {
      service: 'climate.set_temperature',
      label: 'Set Temp',
      dataField: { key: 'temperature', type: 'number', min: 5, max: 35, step: 0.5, unit: '°C' },
    },
    { service: 'climate.turn_off', label: 'Turn Off' },
  ],
  cover: [
    { service: 'cover.open_cover', label: 'Open' },
    { service: 'cover.close_cover', label: 'Close' },
  ],
  script: [{ service: 'script.turn_on', label: 'Run' }],
  input_boolean: [
    { service: 'input_boolean.turn_on', label: 'Turn On' },
    { service: 'input_boolean.turn_off', label: 'Turn Off' },
  ],
  media_player: [
    { service: 'media_player.turn_on', label: 'Turn On' },
    { service: 'media_player.turn_off', label: 'Turn Off' },
  ],
};

const SUPPORTED_DOMAINS = Object.keys(DOMAIN_ACTIONS);

const DEFAULT_EDITOR: EditorState = {
  name: '',
  time: '08:00',
  daily: true,
  selectedDays: [],
  repeatType: 'repeat',
  domain: 'switch',
  entityId: '',
  service: 'switch.turn_on',
  serviceDataValue: '',
};

// ─── Helpers ──────────────────────────────────────────────────────────────

function formatDays(weekdays: string[]): string {
  if (weekdays.includes('daily')) return 'Daily';
  const sorted = [...weekdays].sort(
    (a, b) => DAYS_ORDER.indexOf(a as any) - DAYS_ORDER.indexOf(b as any),
  );
  const wdDays = ['mon', 'tue', 'wed', 'thu', 'fri'];
  const weDays = ['sat', 'sun'];
  if (sorted.length === 5 && wdDays.every((d) => sorted.includes(d))) return 'Weekdays';
  if (sorted.length === 2 && weDays.every((d) => sorted.includes(d))) return 'Weekends';
  return sorted.map((d) => DAY_LABELS[d] ?? d).join(' · ');
}

function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

function formatRepeatType(type: string): { label: string; Icon: typeof Clock } {
  switch (type) {
    case 'repeat': return { label: 'Repeats', Icon: Repeat2 };
    case 'pause':  return { label: 'Once', Icon: CheckCircle2 };
    default:       return { label: 'Single use', Icon: Timer };
  }
}

function summarizeAction(action: SchedulerAction): string {
  const name = (action.entity_id || '').split('.').pop()?.replace(/_/g, ' ') ?? '?';
  if (action.service.endsWith('turn_on'))  return `Turn on • ${name}`;
  if (action.service.endsWith('turn_off')) return `Turn off • ${name}`;
  if (action.service === 'fan.set_percentage')
    return `Fan ${action.service_data?.percentage ?? 0}% • ${name}`;
  if (action.service === 'climate.set_temperature')
    return `${action.service_data?.temperature ?? '?'}°C • ${name}`;
  if (action.service === 'cover.open_cover')  return `Open • ${name}`;
  if (action.service === 'cover.close_cover') return `Close • ${name}`;
  if (action.service === 'script.turn_on')    return `Run • ${name}`;
  return `${action.service} • ${name}`;
}

function formatNextTrigger(timestamps: string[]): string | null {
  const dt = getNextTriggerDate(timestamps);
  if (!dt) return null;
  const diffMs = dt.getTime() - Date.now();
  if (diffMs < 0) return null;
  const h = Math.floor(diffMs / 3_600_000);
  const m = Math.floor((diffMs % 3_600_000) / 60_000);
  if (h > 24) return `in ${Math.floor(h / 24)}d`;
  if (h > 0)  return `in ${h}h ${m}m`;
  if (m > 0)  return `in ${m}m`;
  return 'soon';
}

function getNextTriggerDate(timestamps: string[]): Date | null {
  if (!timestamps?.length) return null;
  const now = Date.now();
  const next = timestamps
    .map((t) => new Date(t))
    .filter((d) => Number.isFinite(d.getTime()) && d.getTime() >= now)
    .sort((a, b) => a.getTime() - b.getTime())[0];
  return next ?? null;
}

function formatNextAbsolute(date: Date | null): string | null {
  if (!date) return null;
  return date.toLocaleString([], {
    weekday: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function editorFromSchedule(s: ScheduleEntry): EditorState {
  const ts = s.timeslots[0];
  const action = ts?.actions[0];
  const domain = action?.service?.split('.')?.[0] ?? 'switch';
  const def = DOMAIN_ACTIONS[domain]?.find((a) => a.service === action?.service);
  return {
    name: s.name ?? '',
    time: ts?.start?.substring(0, 5) ?? '08:00',
    daily: s.weekdays.includes('daily'),
    selectedDays: s.weekdays.includes('daily') ? [] : [...s.weekdays],
    repeatType: s.repeat_type,
    domain,
    entityId: action?.entity_id ?? '',
    service: action?.service ?? `${domain}.turn_on`,
    serviceDataValue: def?.dataField
      ? String(action?.service_data?.[def.dataField.key] ?? '')
      : '',
  };
}

function editorToPayload(e: EditorState) {
  const def = DOMAIN_ACTIONS[e.domain]?.find((a) => a.service === e.service);
  const serviceData: Record<string, any> = {};
  if (def?.dataField && e.serviceDataValue !== '') {
    serviceData[def.dataField.key] =
      def.dataField.type === 'number' ? Number(e.serviceDataValue) : e.serviceDataValue;
  }
  if (e.service === 'climate.set_temperature') serviceData.hvac_mode = 'heat';
  return {
    weekdays: e.daily ? ['daily'] : e.selectedDays,
    timeslots: [
      {
        start: e.time + ':00',
        stop: null,
        actions: [{ service: e.service, entity_id: e.entityId, service_data: serviceData }],
        conditions: [],
        condition_type: null,
        track_conditions: false,
      },
    ],
    repeat_type: e.repeatType,
    name: e.name.trim() || null,
  };
}

// ─── API Hook ─────────────────────────────────────────────────────────────

function useSchedulerApi() {
  const store = useHassStore();

  const getToken = useCallback(() => {
    const token = store.hass?.auth?.data?.access_token;
    if (!token) throw new Error('Not authenticated');
    return token;
  }, [store]);

  const listSchedules = useCallback(async (): Promise<ScheduleEntry[]> => {
    const res = await fetch('/api/scheduler/list', {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!res.ok) throw new Error(`Scheduler API ${res.status}`);
    return res.json();
  }, [getToken]);

  const addSchedule = useCallback(
    async (data: object) => {
      const res = await fetch('/api/scheduler/add', {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`Add failed: ${res.status}`);
    },
    [getToken],
  );

  const editSchedule = useCallback(
    async (scheduleId: string, data: object) => {
      const res = await fetch('/api/scheduler/edit', {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ schedule_id: scheduleId, ...data }),
      });
      if (!res.ok) throw new Error(`Edit failed: ${res.status}`);
    },
    [getToken],
  );

  const removeSchedule = useCallback(
    async (scheduleId: string) => {
      const res = await fetch('/api/scheduler/remove', {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ schedule_id: scheduleId }),
      });
      if (!res.ok) throw new Error(`Remove failed: ${res.status}`);
    },
    [getToken],
  );

  const toggleSchedule = useCallback(
    async (entityId: string, enable: boolean) => {
      await store.callService('switch', enable ? 'turn_on' : 'turn_off', undefined, {
        entity_id: entityId,
      });
    },
    [store],
  );

  const runNow = useCallback(
    async (entityId: string) => {
      await store.callService('scheduler', 'run_action', { entity_id: entityId });
    },
    [store],
  );

  return { listSchedules, addSchedule, editSchedule, removeSchedule, toggleSchedule, runNow };
}

// ─── ScheduleEditor (modal) ───────────────────────────────────────────────

function ScheduleEditor({
  initial,
  scheduleId,
  onSave,
  onClose,
}: {
  initial: EditorState;
  scheduleId?: string;
  onSave: (payload: object, scheduleId?: string) => Promise<void>;
  onClose: () => void;
}) {
  const store = useHassStore();
  const [form, setForm] = useState<EditorState>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Entities in the selected domain
  const domainEntities = store.hass
    ? Object.values(store.hass.states)
        .filter((e) => e.entity_id.startsWith(form.domain + '.'))
        .sort((a, b) => a.entity_id.localeCompare(b.entity_id))
    : [];

  const actions = DOMAIN_ACTIONS[form.domain] ?? [];
  const selectedActionDef = actions.find((a) => a.service === form.service);

  const setDomain = (domain: string) => {
    const firstAction = DOMAIN_ACTIONS[domain]?.[0];
    setForm((f) => ({
      ...f,
      domain,
      entityId: '',
      service: firstAction?.service ?? '',
      serviceDataValue: '',
    }));
  };

  const setService = (service: string) =>
    setForm((f) => ({ ...f, service, serviceDataValue: '' }));

  const toggleDay = (day: string) =>
    setForm((f) => ({
      ...f,
      selectedDays: f.selectedDays.includes(day)
        ? f.selectedDays.filter((d) => d !== day)
        : [...f.selectedDays, day],
    }));

  const handleSave = async () => {
    if (!form.entityId) { setError('Select an entity'); return; }
    if (!form.daily && form.selectedDays.length === 0) { setError('Select at least one day'); return; }
    setSaving(true);
    setError(null);
    try {
      await onSave(editorToPayload(form), scheduleId);
      onClose();
    } catch (err: any) {
      setError(err?.message ?? 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const friendlyName = (entityId: string) => {
    const s = store.hass?.states[entityId];
    return s?.attributes?.friendly_name ?? entityId.split('.').pop()?.replace(/_/g, ' ') ?? entityId;
  };

  return (
    // fixed inset-0: covers full viewport regardless of overflow containers
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-[min(95vw,440px)] max-h-[90vh] overflow-y-auto rounded-xl border bg-card text-foreground shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-base font-semibold">
            {scheduleId ? 'Edit Schedule' : 'New Schedule'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-muted text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4 space-y-5">
          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Name (optional)
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Morning heat"
              className="w-full rounded-md border bg-muted/50 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Time */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Time
            </label>
            <input
              type="time"
              value={form.time}
              onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
              className="w-full rounded-md border bg-muted/50 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Days */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Days
            </label>
            <div className="flex gap-2">
              {(['Daily', 'Custom'] as const).map((opt) => {
                const isDaily = opt === 'Daily';
                const active = isDaily ? form.daily : !form.daily;
                return (
                  <button
                    key={opt}
                    onClick={() => setForm((f) => ({ ...f, daily: isDaily }))}
                    className={cn(
                      'flex-1 rounded-md py-1.5 text-sm font-medium border transition-colors',
                      active
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-border hover:bg-muted',
                    )}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
            {!form.daily && (
              <div className="flex gap-1.5 flex-wrap pt-1">
                {DAYS_ORDER.map((day) => (
                  <button
                    key={day}
                    onClick={() => toggleDay(day)}
                    className={cn(
                      'w-9 h-9 rounded-full text-xs font-medium border transition-colors',
                      form.selectedDays.includes(day)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-border hover:bg-muted text-muted-foreground',
                    )}
                  >
                    {DAY_LABELS[day]}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* After running */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              After running
            </label>
            <div className="flex gap-2">
              {(['repeat', 'pause', 'single'] as const).map((rt) => (
                <button
                  key={rt}
                  onClick={() => setForm((f) => ({ ...f, repeatType: rt }))}
                  className={cn(
                    'flex-1 rounded-md py-1.5 text-xs font-medium border transition-colors',
                    form.repeatType === rt
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border hover:bg-muted',
                  )}
                >
                  {rt === 'repeat' ? 'Repeat' : rt === 'pause' ? 'Once' : 'Single use'}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t" />

          {/* Action */}
          <div className="space-y-3">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Action
            </label>

            {/* Domain */}
            <div>
              <p className="text-[11px] text-muted-foreground mb-1">Domain</p>
              <select
                value={form.domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full rounded-md border bg-muted/50 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {SUPPORTED_DOMAINS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Entity */}
            <div>
              <p className="text-[11px] text-muted-foreground mb-1">Entity</p>
              <select
                value={form.entityId}
                onChange={(e) => setForm((f) => ({ ...f, entityId: e.target.value }))}
                className="w-full rounded-md border bg-muted/50 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Select entity…</option>
                {domainEntities.map((e) => (
                  <option key={e.entity_id} value={e.entity_id}>
                    {friendlyName(e.entity_id)}
                  </option>
                ))}
              </select>
            </div>

            {/* Service */}
            <div>
              <p className="text-[11px] text-muted-foreground mb-1">Action</p>
              <div className="flex gap-2 flex-wrap">
                {actions.map((a) => (
                  <button
                    key={a.service}
                    onClick={() => setService(a.service)}
                    className={cn(
                      'rounded-md px-3 py-1.5 text-xs font-medium border transition-colors',
                      form.service === a.service
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-border hover:bg-muted',
                    )}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Service data value */}
            {selectedActionDef?.dataField && (
              <div>
                <p className="text-[11px] text-muted-foreground mb-1">
                  {selectedActionDef.dataField.key.replace(/_/g, ' ')}
                  {selectedActionDef.dataField.unit ? ` (${selectedActionDef.dataField.unit})` : ''}
                </p>
                <input
                  type="number"
                  value={form.serviceDataValue}
                  onChange={(e) => setForm((f) => ({ ...f, serviceDataValue: e.target.value }))}
                  min={selectedActionDef.dataField.min}
                  max={selectedActionDef.dataField.max}
                  step={selectedActionDef.dataField.step}
                  placeholder={selectedActionDef.dataField.placeholder}
                  className="w-full rounded-md border bg-muted/50 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            )}
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md text-sm border hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded-md text-sm bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── ScheduleCard ─────────────────────────────────────────────────────────

function ScheduleCard({
  schedule,
  onToggle,
  onEdit,
  onDelete,
  onRun,
}: {
  schedule: ScheduleEntry;
  onToggle: (enabled: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
  onRun: () => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const action = schedule.timeslots[0]?.actions[0];
  const time = schedule.timeslots[0]?.start;
  const nextDate = getNextTriggerDate(schedule.timestamps);
  const nextTrigger = formatNextTrigger(schedule.timestamps);
  const nextAbsolute = formatNextAbsolute(nextDate);
  const diffMs = nextDate ? nextDate.getTime() - Date.now() : null;
  const isSoon = schedule.enabled && diffMs !== null && diffMs >= 0 && diffMs <= 2 * 60 * 60 * 1000;
  const { label: repeatLabel, Icon: RepeatIcon } = formatRepeatType(schedule.repeat_type);
  const title = schedule.name ?? `Schedule #${schedule.schedule_id}`;

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border bg-card/90 p-4 transition-all',
        'hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10',
        schedule.enabled ? 'border-primary/25' : 'border-border',
        !schedule.enabled && 'opacity-75',
      )}
    >
      <div
        className={cn(
          'absolute left-0 top-0 h-full w-1',
          schedule.enabled ? (isSoon ? 'bg-amber-400' : 'bg-primary') : 'bg-muted-foreground/30',
        )}
      />

      <div className="flex items-start gap-3 pl-2">
        {/* Enable toggle */}
        <button
          onClick={() => onToggle(!schedule.enabled)}
          className={cn(
            'mt-0.5 w-10 h-6 rounded-full transition-all flex-shrink-0 relative',
            schedule.enabled ? 'bg-primary' : 'bg-muted',
          )}
          title={schedule.enabled ? 'Disable' : 'Enable'}
        >
          <span
            className={cn(
              'absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow',
              schedule.enabled ? 'right-1' : 'left-1',
            )}
          />
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{title}</p>
              <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <RepeatIcon className="h-3 w-3" />
                <span>{repeatLabel}</span>
                <span>•</span>
                <span>{formatDays(schedule.weekdays)}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-1.5">
              {isSoon && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-300">
                  <BellRing className="h-3 w-3" />
                  Soon
                </span>
              )}
              {schedule.enabled ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-300">
                  <Radio className="h-3 w-3" />
                  Armed
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  <PauseCircle className="h-3 w-3" />
                  Paused
                </span>
              )}
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-lg border border-border/70 bg-background/40 px-2.5 py-2">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">At</p>
              <p className="mt-1 flex items-center gap-1.5 font-semibold text-foreground">
                <Clock className="h-3.5 w-3.5" />
                {time ? formatTime(time) : '—'}
              </p>
            </div>

            <div className="rounded-lg border border-border/70 bg-background/40 px-2.5 py-2">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Next</p>
              <p className="mt-1 truncate font-semibold text-foreground">
                {schedule.enabled ? (nextTrigger ?? 'No upcoming run') : 'Disabled'}
              </p>
              {schedule.enabled && nextAbsolute && (
                <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{nextAbsolute}</p>
              )}
            </div>
          </div>

          {action && (
            <p className="mt-2.5 rounded-md bg-muted/40 px-2 py-1.5 text-[11px] text-muted-foreground">
              {summarizeAction(action)}
            </p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-0.5 flex-shrink-0">
          <button
            onClick={onRun}
            title="Run now"
            className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <Play className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onEdit}
            title="Edit"
            className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          {confirmDelete ? (
            <div className="flex items-center gap-1">
              <button
                onClick={() => { onDelete(); setConfirmDelete(false); }}
                className="px-2 py-1 rounded bg-destructive text-destructive-foreground text-xs"
              >
                Delete
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="p-1 rounded hover:bg-muted text-muted-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              title="Delete"
              className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-red-400 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
  count,
}: {
  icon: typeof Clock;
  title: string;
  subtitle: string;
  count: number;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Icon className="h-4 w-4 text-muted-foreground" />
          {title}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
      </div>
      <span className="rounded-full border border-border/70 bg-muted/40 px-2.5 py-1 text-xs font-semibold text-muted-foreground">
        {count}
      </span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────

export default function Schedule() {
  const [schedules, setSchedules] = useState<ScheduleEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editor, setEditor] = useState<{
    initial: EditorState;
    scheduleId?: string;
  } | null>(null);

  const api = useSchedulerApi();

  const loadSchedules = useCallback(async () => {
    try {
      setError(null);
      const data = await api.listSchedules();
      data.sort((a, b) => {
        const at = a.timeslots[0]?.start ?? '';
        const bt = b.timeslots[0]?.start ?? '';
        return at.localeCompare(bt);
      });
      setSchedules(data);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load schedules');
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    loadSchedules();
    const id = setInterval(loadSchedules, 30_000);
    return () => clearInterval(id);
  }, [loadSchedules]);

  const handleToggle = async (schedule: ScheduleEntry, enabled: boolean) => {
    setSchedules((prev) =>
      prev.map((s) => (s.schedule_id === schedule.schedule_id ? { ...s, enabled } : s)),
    );
    await api.toggleSchedule(schedule.entity_id, enabled);
    setTimeout(loadSchedules, 600);
  };

  const handleDelete = async (schedule: ScheduleEntry) => {
    setSchedules((prev) => prev.filter((s) => s.schedule_id !== schedule.schedule_id));
    await api.removeSchedule(schedule.schedule_id);
  };

  const handleSave = async (payload: object, scheduleId?: string) => {
    if (scheduleId) {
      await api.editSchedule(scheduleId, payload);
    } else {
      await api.addSchedule(payload);
    }
    await loadSchedules();
  };

  const enabledCount = schedules.filter((s) => s.enabled).length;
  const soonCount = schedules.filter((s) => {
    if (!s.enabled) return false;
    const dt = getNextTriggerDate(s.timestamps);
    if (!dt) return false;
    const diff = dt.getTime() - Date.now();
    return diff >= 0 && diff <= 2 * 60 * 60 * 1000;
  }).length;
  const soonSchedules = schedules.filter((s) => {
    if (!s.enabled) return false;
    const dt = getNextTriggerDate(s.timestamps);
    if (!dt) return false;
    const diff = dt.getTime() - Date.now();
    return diff >= 0 && diff <= 2 * 60 * 60 * 1000;
  });
  const armedSchedules = schedules.filter(
    (s) => s.enabled && !soonSchedules.some((soon) => soon.schedule_id === s.schedule_id),
  );
  const pausedSchedules = schedules.filter((s) => !s.enabled);

  return (
    <PageContainer title="Schedules">
      <div className="space-y-4">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/15 via-card to-card p-4">
          <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/20 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-10 left-10 h-24 w-24 rounded-full bg-amber-400/15 blur-2xl" />

          <div className="relative flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="flex items-center gap-2 text-base font-semibold text-foreground">
                <Sparkles className="h-4 w-4 text-primary" />
                Daily Agenda
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {schedules.length} schedule{schedules.length !== 1 ? 's' : ''} • {enabledCount} active • {soonCount} soon
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={loadSchedules}
                title="Refresh"
                className="rounded-md border border-border/70 bg-background/50 p-2 text-muted-foreground transition-colors hover:bg-muted"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
              <button
                onClick={() => setEditor({ initial: DEFAULT_EDITOR })}
                className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <Plus className="h-4 w-4" />
                Add
              </button>
            </div>
          </div>

          <div className="relative mt-3 grid grid-cols-3 gap-2 text-xs">
            <div className="rounded-lg border border-border/70 bg-background/45 p-2">
              <p className="text-muted-foreground">Total</p>
              <p className="mt-0.5 text-lg font-semibold text-foreground">{schedules.length}</p>
            </div>
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2">
              <p className="text-emerald-200/90">Armed</p>
              <p className="mt-0.5 text-lg font-semibold text-emerald-100">{enabledCount}</p>
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-2">
              <p className="text-amber-200/90">Soon</p>
              <p className="mt-0.5 text-lg font-semibold text-amber-100">{soonCount}</p>
            </div>
          </div>
        </div>

        {/* States */}
        {loading && (
          <p className="text-center text-muted-foreground py-8 text-sm">Loading…</p>
        )}
        {!loading && error && (
          <Card>
            <CardContent className="py-6 text-center text-sm text-destructive">{error}</CardContent>
          </Card>
        )}
        {!loading && !error && schedules.length === 0 && (
          <Card>
            <CardContent className="py-10 text-center">
              <p className="text-muted-foreground text-sm">No schedules yet.</p>
              <p className="text-muted-foreground text-xs mt-1">Tap + Add to create one.</p>
            </CardContent>
          </Card>
        )}

        {/* Schedule list */}
        {!loading && schedules.length > 0 && (
          <div className="space-y-5">
            {soonSchedules.length > 0 && (
              <div className="space-y-2">
                <SectionHeader
                  icon={BellRing}
                  title="Coming Up"
                  subtitle="Scheduled within the next two hours"
                  count={soonSchedules.length}
                />
                <div className="space-y-2">
                  {soonSchedules.map((s) => (
                    <ScheduleCard
                      key={s.schedule_id}
                      schedule={s}
                      onToggle={(enabled) => handleToggle(s, enabled)}
                      onEdit={() => setEditor({ initial: editorFromSchedule(s), scheduleId: s.schedule_id })}
                      onDelete={() => handleDelete(s)}
                      onRun={() => api.runNow(s.entity_id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {armedSchedules.length > 0 && (
              <div className="space-y-2">
                <SectionHeader
                  icon={CalendarDays}
                  title="Armed"
                  subtitle="Enabled schedules outside the near window"
                  count={armedSchedules.length}
                />
                <div className="space-y-2">
                  {armedSchedules.map((s) => (
                    <ScheduleCard
                      key={s.schedule_id}
                      schedule={s}
                      onToggle={(enabled) => handleToggle(s, enabled)}
                      onEdit={() => setEditor({ initial: editorFromSchedule(s), scheduleId: s.schedule_id })}
                      onDelete={() => handleDelete(s)}
                      onRun={() => api.runNow(s.entity_id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {pausedSchedules.length > 0 && (
              <div className="space-y-2">
                <SectionHeader
                  icon={PauseCircle}
                  title="Paused"
                  subtitle="Disabled schedules kept around for later"
                  count={pausedSchedules.length}
                />
                <div className="space-y-2">
                  {pausedSchedules.map((s) => (
                    <ScheduleCard
                      key={s.schedule_id}
                      schedule={s}
                      onToggle={(enabled) => handleToggle(s, enabled)}
                      onEdit={() => setEditor({ initial: editorFromSchedule(s), scheduleId: s.schedule_id })}
                      onDelete={() => handleDelete(s)}
                      onRun={() => api.runNow(s.entity_id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Editor modal */}
      {editor && (
        <ScheduleEditor
          initial={editor.initial}
          scheduleId={editor.scheduleId}
          onSave={handleSave}
          onClose={() => setEditor(null)}
        />
      )}
    </PageContainer>
  );
}
