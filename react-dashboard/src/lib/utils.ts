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

/** Time remaining / time to full estimate */
export function batteryEstimate(
  current: number | null,
  power: number | null,
  stored: number | null,
  capacity = 8700,
): string {
  if (current == null || power == null || stored == null) return '';
  if (Math.abs(current) < 0.5 || !Number.isFinite(power) || !Number.isFinite(stored)) return '';
  const hours =
    current > 0
      ? (capacity - stored) / Math.abs(power)
      : stored / Math.abs(power);
  if (!Number.isFinite(hours) || hours > 48) return '';
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return current > 0 ? `${h}h ${m}m to full` : `${h}h ${m}m left`;
}
