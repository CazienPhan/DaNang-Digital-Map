// ---------------------------------------------------------------------------
// timeUtils.ts
//
// Pure time helpers — no React, no side effects.
// All functions are deterministic and unit-testable.
// ---------------------------------------------------------------------------

/** Maps JavaScript Date.getDay() → database key */
export const JS_DAY_TO_KEY: Record<number, string> = {
  0: 'sun',
  1: 'mon',
  2: 'tue',
  3: 'wed',
  4: 'thu',
  5: 'fri',
  6: 'sat',
};

/** Canonical weekly order stored in the database */
export const ORDERED_DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
export type DayKey = (typeof ORDERED_DAYS)[number];

/** Vietnamese display labels, keyed by database day key */
export const DAY_LABELS: Record<string, string> = {
  mon: 'Thứ Hai',
  tue: 'Thứ Ba',
  wed: 'Thứ Tư',
  thu: 'Thứ Năm',
  fri: 'Thứ Sáu',
  sat: 'Thứ Bảy',
  sun: 'Chủ Nhật',
};

/**
 * Converts an "HH:MM" string into total minutes since midnight.
 * Returns NaN if the input is not parseable.
 *
 * @example toMinutes("07:00") // 420
 * @example toMinutes("23:59") // 1439
 */
export function toMinutes(hhmm: string): number {
  const trimmed = hhmm.trim();
  const [hStr, mStr] = trimmed.split(':');
  const h = parseInt(hStr ?? '', 10);
  const m = parseInt(mStr ?? '', 10);
  if (isNaN(h) || isNaN(m)) return NaN;
  return h * 60 + m;
}

/**
 * Returns today's database day key using browser local time.
 * Never uses server time.
 */
export function getTodayKey(now: Date = new Date()): string {
  return JS_DAY_TO_KEY[now.getDay()] ?? 'mon';
}

/**
 * Rotates the canonical ORDERED_DAYS array so that `todayKey` is first.
 * Returns all 7 days; days missing from the schedule will be handled
 * by the caller (not filtered here).
 */
export function rotateDaysFromToday(todayKey: string): string[] {
  const idx = ORDERED_DAYS.indexOf(todayKey as DayKey);
  if (idx === -1) return [...ORDERED_DAYS];
  return [...ORDERED_DAYS.slice(idx), ...ORDERED_DAYS.slice(0, idx)];
}

/**
 * Normalises a time-range string's separator to an en-dash with spaces.
 * "07:00 - 17:00" → "07:00 – 17:00"
 * "07:00-17:00"   → "07:00 – 17:00"
 */
export function formatTimeRange(raw: string): string {
  return raw.replace(/\s*-\s*/, ' – ');
}
