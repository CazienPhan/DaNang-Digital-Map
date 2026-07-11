// ---------------------------------------------------------------------------
// useOpeningHours.ts
//
// Responsible for:
//   - Owning `currentTime` state + setInterval (60 000 ms)
//   - Deriving all UI data via useMemo (no business logic in the component)
//   - Exposing a stable, typed result object
//
// Rules:
//   - Never fetches from Supabase or any backend
//   - Uses browser local time only
//   - Timer is cleaned up on unmount — no memory leaks
// ---------------------------------------------------------------------------

import { useState, useEffect, useMemo } from 'react';
import { parseSchedule } from '../utils/openingHoursParser';
import { calcStatus, getDayValue, type OpenStatus } from '../utils/openingHoursCalculator';
import {
  getTodayKey,
  rotateDaysFromToday,
  DAY_LABELS,
} from '../utils/timeUtils';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface DayScheduleRow {
  key: string;
  label: string;
  /** Raw "\n"-joined display string — kept for backward compatibility */
  value: string | null;
  /** Pre-split array of formatted interval strings for the expanded view */
  intervals: string[];
  isToday: boolean;
}

export interface UseOpeningHoursResult {
  /** Parsed, normalised schedule — null if missing or invalid */
  schedule: Record<string, string> | null;
  /** Current open/closed status */
  status: OpenStatus;
  /** Vietnamese label for today, e.g. "Thứ Tư" */
  todayLabel: string;
  /**
   * Formatted time range of the currently active interval, e.g. "08:00 – 11:30".
   * For 24h: "Mở 24 giờ". Null when closed or no data.
   */
  todayValue: string | null;
  /** Full week starting from today, for the expanded table */
  weekRows: DayScheduleRow[];
  /** Whether any schedule data exists to render */
  hasSchedule: boolean;
  /**
   * When closed between two intervals (or before the first interval):
   * the opening time of the next interval, e.g. "13:30".
   * When closed after today's last interval and a future day exists:
   * a formatted string like "Mở cửa vào Thứ Hai lúc 08:00".
   * Null when open or when no future opening can be found.
   */
  nextOpenTime: string | null;
  /**
   * Set to "Hôm nay đã hết giờ mở cửa." when today's last interval has
   * ended and the POI is closed for the rest of the day.
   * Null in all other states.
   */
  closedMessage: string | null;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Provides all UI data for the Opening Hours card.
 * Recalculates once per minute from browser local time.
 *
 * @param raw - The raw `gio_mo_cua` value from POIDetailData
 */
export function useOpeningHours(
  raw: Record<string, string> | null | undefined,
): UseOpeningHoursResult {
  // --- 1. Live clock (browser time, 1-minute precision) ---
  const [currentTime, setCurrentTime] = useState<Date>(() => new Date());

  useEffect(() => {
    const id = setInterval(() => {
      setCurrentTime(new Date());
    }, 60_000);
    return () => clearInterval(id); // cleanup — no memory leaks
  }, []);

  // --- 2. Normalise the raw schedule (stable between ticks if raw unchanged) ---
  const schedule = useMemo(() => parseSchedule(raw), [raw]);

  // --- 3. Derive all UI data ---
  const todayKey = useMemo(() => getTodayKey(currentTime), [currentTime]);
  const todayLabel = useMemo(() => DAY_LABELS[todayKey] ?? todayKey, [todayKey]);

  const {
    status,
    todayValue,
    nextOpenTime,
    closedMessage,
  } = useMemo(
    () =>
      schedule
        ? calcStatus(schedule, currentTime)
        : {
            status: 'no_data' as OpenStatus,
            todayValue: null,
            nextOpenTime: null,
            closedMessage: null,
          },
    [schedule, currentTime],
  );

  const weekRows = useMemo<DayScheduleRow[]>(() => {
    if (!schedule) return [];
    const rotated = rotateDaysFromToday(todayKey);
    return rotated
      .filter((key) => key in schedule) // only show days present in the data
      .map((key) => {
        const raw = getDayValue(schedule, key);
        // Split "\n"-joined multi-interval strings into an array for the view
        const intervals = raw ? raw.split('\n') : ['—'];
        return {
          key,
          label: DAY_LABELS[key] ?? key,
          value: raw,
          intervals,
          isToday: key === todayKey,
        };
      });
  }, [schedule, todayKey]);

  return {
    schedule,
    status,
    todayLabel,
    todayValue,
    weekRows,
    hasSchedule: schedule !== null,
    nextOpenTime,
    closedMessage,
  };
}
