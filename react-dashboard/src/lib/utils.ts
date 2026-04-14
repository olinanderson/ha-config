import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Parse entity state as number, returning fallback for unavailable/unknown */
export function numState(
  state: string | undefined,
  fallback = 0,
): number {
  if (!state || state === 'unknown' || state === 'unavailable') return fallback;
  const n = Number(state);
  return Number.isFinite(n) ? n : fallback;
}

/** Format number with configurable decimals. Shows — for null/undefined/non-finite. */
export function fmt(n: number | null | undefined, decimals = 1): string {
  return n != null && Number.isFinite(n) ? n.toFixed(decimals) : '—';
}

/** Human-readable duration from seconds */
export function formatDuration(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const parts: string[] = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  parts.push(`${m}m`);
  return parts.join(' ');
}

/** Relative time string from an ISO timestamp ("just now", "3m ago", "2h ago", etc.) */
export function timeAgo(isoString: string | undefined | null): string {
  if (!isoString) return '';
  const diff = Date.now() - new Date(isoString).getTime();
  if (diff < 0) return 'just now';
  const secs = Math.floor(diff / 1000);
  if (secs < 10) return 'just now';
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

/** Time remaining / time to full estimate.
 *  Accounts for LiFePO4 absorption taper above 80% SOC and 10% floor. */
export function batteryEstimate(
  current: number | null,
  power: number | null,
  stored: number | null,
  capacity = 8700,
  soc: number | null = null,
  voltage: number | null = null,
): string {
  if (current == null || stored == null) return '';
  if (Math.abs(current) < 0.05) return '';
  // Use power if valid, otherwise approximate from current × voltage
  let absPower = power != null && Number.isFinite(power) && Math.abs(power) > 0
    ? Math.abs(power)
    : null;
  if (!absPower && voltage != null && voltage > 0) {
    absPower = Math.abs(current) * voltage;
  }
  if (!absPower || !Number.isFinite(stored)) return '';
  let hours: number;
  if (current > 0) {
    // Charging — LiFePO4 tapers in absorption phase above ~80% SOC
    const remaining = capacity - stored;
    const pct = soc ?? (stored / capacity) * 100;
    const taper = pct > 80 ? 1 + (pct - 80) * 0.03 : 1;
    hours = (remaining / absPower) * taper;
  } else {
    // Discharging — usable energy down to ~10% SOC (LiFePO4 knee)
    const floor = capacity * 0.10;
    const usable = Math.max(stored - floor, 0);
    hours = usable / absPower;
  }
  if (!Number.isFinite(hours) || hours > 48 || hours < 0) return '';
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return current > 0 ? `~${h}h ${m}m to full` : `~${h}h ${m}m left`;
}

/** Check if an entity's last_updated is within maxAgeSec seconds of now */
export function isFresh(
  lastUpdated: string | undefined | null,
  maxAgeSec = 300,
): boolean {
  if (!lastUpdated) return false;
  return (Date.now() - new Date(lastUpdated).getTime()) / 1000 < maxAgeSec;
}
