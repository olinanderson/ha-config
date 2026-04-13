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

/** Time remaining / time to full estimate */
export function batteryEstimate(
  current: number | null,
  power: number | null,
  stored: number | null,
  capacity = 8700,
): string {
  if (current == null || power == null || stored == null) return '';
  if (Math.abs(current) < 0.1 || !Number.isFinite(power) || !Number.isFinite(stored)) return '';
  const hours =
    current > 0
      ? (capacity - stored) / Math.abs(power)
      : stored / Math.abs(power);
  if (!Number.isFinite(hours) || hours > 48) return '';
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return current > 0 ? `${h}h ${m}m to full` : `${h}h ${m}m left`;
}

/** Check if an entity's last_updated is within maxAgeSec seconds of now */
export function isFresh(
  lastUpdated: string | undefined | null,
  maxAgeSec = 300,
): boolean {
  if (!lastUpdated) return false;
  return (Date.now() - new Date(lastUpdated).getTime()) / 1000 < maxAgeSec;
}
