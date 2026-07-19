// ---------------------------------------------------------------------------
// openingHoursCalculator.ts
//
// Responsible for:
//   - Open/Closed status calculation entirely on the client
//   - Multiple interval support  (e.g. "08:00 - 11:30, 13:30 - 16:30")
//   - Overnight schedule support  (e.g. 18:00 - 02:00)
//   - 24-hour schedule support    (24/7, 24 Hours, 00:00 - 23:59)
//   - Closed-day handling         (Closed, N/A, -)
//   - Next-open-time detection    (between intervals, or next operating day)
//
// No React, no side effects.
// ---------------------------------------------------------------------------

import { toMinutes, getTodayKey, ORDERED_DAYS, DAY_LABELS } from './timeUtils';
import { is24Hours, isClosed, parseMultipleRanges } from './openingHoursParser';

export type OpenStatus = 'open' | 'closed' | 'open_24h' | 'no_data';

export interface StatusResult {
  status: OpenStatus;
  /**
   * The display-ready label for the active interval, e.g. "08:00 – 11:30".
   * For 24h days: "Mở 24 giờ". For closed days: "Đóng cửa". null otherwise.
   */
  todayValue: string | null;
  /**
   * When closed between two intervals or before today's first interval,
   * contains the HH:MM of the next interval's open time (e.g. "13:30").
   * null when not applicable.
   */
  nextOpenTime: string | null;
  /**
   * Human-readable message shown when today's last interval has ended and
   * no later interval exists today. Null when the POI is open or between
   * intervals.
   */
  closedMessage: string | null;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Tests whether `currentMin` falls inside one interval [openMin, closeMin].
 * Handles overnight ranges (openMin > closeMin).
 */
function isInsideInterval(
  openMin: number,
  closeMin: number,
  currentMin: number,
): boolean {
  const isOvernight = openMin > closeMin;
  if (isOvernight) {
    return currentMin >= openMin || currentMin <= closeMin;
  }
  return currentMin >= openMin && currentMin <= closeMin;
}

/**
 * Formats an { open, close } range as "HH:MM – HH:MM".
 */
function fmtRange(r: { open: string; close: string }): string {
  return `${r.open} – ${r.close}`;
}

/**
 * Looks forward through the schedule (up to 7 days starting the day AFTER
 * `fromDayKey`) and returns the next day + opening time that has at least
 * one parseable interval, or null if none found.
 */
function findNextOpenDay(
  schedule: Record<string, string>,
  fromDayKey: string,
): { label: string; time: string } | null {
  const idx = ORDERED_DAYS.indexOf(fromDayKey as (typeof ORDERED_DAYS)[number]);
  for (let i = 1; i <= 7; i++) {
    const nextKey = ORDERED_DAYS[(idx + i) % 7];
    if (!nextKey) continue;
    const raw = schedule[nextKey];
    if (!raw) continue;
    if (isClosed(raw)) continue;
    if (is24Hours(raw)) {
      return { label: DAY_LABELS[nextKey] ?? nextKey, time: '00:00' };
    }
    const ranges = parseMultipleRanges(raw);
    if (ranges && ranges.length > 0 && ranges[0]) {
      return { label: DAY_LABELS[nextKey] ?? nextKey, time: ranges[0].open };
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Determines the Open/Closed status for a given moment using
 * the POI's schedule record and the browser's local time.
 *
 * Supports:
 *   - Single intervals:   "08:00 - 17:00"
 *   - Multiple intervals: "08:00 - 11:30, 13:30 - 16:30"
 *   - Overnight:          "22:00 - 02:00"
 *   - 24-hour:            "24 Hours" / "24/7" / "00:00 - 23:59"
 *   - Closed:             "Closed" / "N/A" / "-"
 */
export function calcStatus(
  schedule: Record<string, string>,
  now: Date,
): StatusResult {
  const todayKey = getTodayKey(now);
  const rawValue = schedule[todayKey] ?? null;

  const noResult: StatusResult = {
    status: 'no_data',
    todayValue: null,
    nextOpenTime: null,
    closedMessage: null,
  };

  if (!rawValue) return noResult;

  // ── Special: 24-hour ──────────────────────────────────────────────────────
  if (is24Hours(rawValue)) {
    return { status: 'open_24h', todayValue: 'Mở 24 giờ', nextOpenTime: null, closedMessage: null };
  }

  // ── Special: explicitly closed ────────────────────────────────────────────
  if (isClosed(rawValue)) {
    const next = findNextOpenDay(schedule, todayKey);
    return {
      status: 'closed',
      todayValue: 'Đóng cửa',
      nextOpenTime: next ? `${next.time} (${next.label})` : null,
      closedMessage: null,
    };
  }

  // ── Parse interval(s) ─────────────────────────────────────────────────────
  const ranges = parseMultipleRanges(rawValue);
  if (!ranges || ranges.length === 0) {
    // Unparseable — show raw value, don't crash
    return { ...noResult, todayValue: rawValue };
  }

  const currentMin = now.getHours() * 60 + now.getMinutes();

  // ── Check each interval: early-exit on first match ────────────────────────
  for (const range of ranges) {
    const openMin = toMinutes(range.open);
    const closeMin = toMinutes(range.close);
    if (isNaN(openMin) || isNaN(closeMin)) continue;

    if (isInsideInterval(openMin, closeMin, currentMin)) {
      return {
        status: 'open',
        todayValue: fmtRange(range),
        nextOpenTime: null,
        closedMessage: null,
      };
    }
  }

  // ── Closed — determine which closed-hint is appropriate ───────────────────

  // Find the next future interval start within today (currentMin < openMin,
  // ignoring overnight ranges whose open is in the past part of the day).
  let nextTodayOpen: string | null = null;
  for (const range of ranges) {
    const openMin = toMinutes(range.open);
    const closeMin = toMinutes(range.close);
    if (isNaN(openMin) || isNaN(closeMin)) continue;
    const isOvernight = openMin > closeMin;
    // For a non-overnight interval that hasn't started yet
    if (!isOvernight && openMin > currentMin) {
      // Take the earliest such interval
      if (
        nextTodayOpen === null ||
        toMinutes(nextTodayOpen) > openMin
      ) {
        nextTodayOpen = range.open;
      }
    }
  }

  if (nextTodayOpen !== null) {
    // Between two intervals — next session is still today
    return {
      status: 'closed',
      todayValue: null,
      nextOpenTime: nextTodayOpen,
      closedMessage: null,
    };
  }

  // All of today's intervals have ended (or only overnight intervals that
  // have already closed their morning side).
  const next = findNextOpenDay(schedule, todayKey);
  const nextInfo = next ? `Mở cửa vào ${next.label} lúc ${next.time}` : null;

  return {
    status: 'closed',
    todayValue: null,
    nextOpenTime: nextInfo,
    closedMessage: 'Hôm nay đã hết giờ mở cửa.',
  };
}

/**
 * Returns the display value for any given day in the schedule.
 * Multiple intervals are joined by "\n" so callers can split and render
 * each on its own line.
 * Returns null if the day is not present.
 */
export function getDayValue(
  schedule: Record<string, string>,
  dayKey: string,
): string | null {
  const raw = schedule[dayKey];
  if (!raw) return null;
  if (is24Hours(raw)) return 'Mở 24 giờ';
  if (isClosed(raw)) return 'Đóng cửa';

  const ranges = parseMultipleRanges(raw);
  if (!ranges || ranges.length === 0) return raw; // show as-is if unparseable

  return ranges.map(fmtRange).join('\n');
}
