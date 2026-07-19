// ---------------------------------------------------------------------------
// openingHoursParser.ts
//
// Responsible for:
//   - Validating and normalising the raw gio_mo_cua JSON
//   - Detecting special values: 24-hour, closed, invalid
//   - Splitting time-range strings safely
//
// No React, no side effects, no date/time logic.
// ---------------------------------------------------------------------------

/** Special-value detectors — order matters: check 24h before closed */

const TWENTY_FOUR_PATTERNS = [
  /^\s*24\s*\/?\s*7\s*$/i,
  /^\s*24\s*h(ours?)?\s*$/i,
  /^\s*00:00\s*[-–]\s*23:59\s*$/i,
];

const CLOSED_PATTERNS = [
  /^\s*closed\s*$/i,
  /^\s*n\/?a\s*$/i,
  /^\s*-\s*$/,
];

/**
 * Returns true if the time-range string means "open all day every day".
 */
export function is24Hours(value: string): boolean {
  return TWENTY_FOUR_PATTERNS.some((re) => re.test(value));
}

/**
 * Returns true if the value indicates the business is closed on that day.
 */
export function isClosed(value: string): boolean {
  return CLOSED_PATTERNS.some((re) => re.test(value));
}

/**
 * Splits a time-range string into open and close parts.
 * Handles all spacing variants:
 *   "07:00 - 17:00"
 *   "07:00-17:00"
 *   "07:00 -17:00"
 *   "07:00- 17:00"
 *
 * Returns null if the string cannot be parsed.
 */
export function parseTimeRange(
  value: string,
): { open: string; close: string } | null {
  // Split on a dash that is surrounded by optional whitespace,
  // but NOT on dashes that are part of an en-dash/em-dash sequence already
  const parts = value.split(/\s*[-–—]\s*/);
  if (parts.length !== 2) return null;

  const open = (parts[0] ?? '').trim();
  const close = (parts[1] ?? '').trim();

  // Basic HH:MM validation
  const timeRe = /^\d{1,2}:\d{2}$/;
  if (!timeRe.test(open) || !timeRe.test(close)) return null;

  return { open, close };
}

/**
 * Normalises and validates the raw gio_mo_cua record.
 *
 * - Lowercases all keys to match the database canonical format
 *   (guards against any future casing inconsistency)
 * - Skips entries whose value is empty, null, undefined, or whitespace-only
 * - Returns null for null input, empty objects, or objects where every
 *   value is blank — preventing ghost rows when no schedule data exists
 * - Never throws
 */
export function parseSchedule(
  raw: Record<string, string> | null | undefined,
): Record<string, string> | null {
  if (!raw || typeof raw !== 'object') return null;

  const normalised: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw)) {
    // Skip non-string keys, and values that are not strings, null,
    // undefined, or contain only whitespace characters.
    if (typeof key !== 'string') continue;
    if (value == null) continue;
    if (typeof value !== 'string') continue;
    const trimmed = value.trim();
    if (trimmed === '') continue;
    normalised[key.toLowerCase()] = trimmed;
  }

  return Object.keys(normalised).length > 0 ? normalised : null;
}

// ---------------------------------------------------------------------------
// Multi-interval parsing
// ---------------------------------------------------------------------------

/**
 * Parses a day-value that may contain one or more comma-separated time ranges.
 *
 * Examples:
 *   "08:00 - 17:00"                     → [{ open: "08:00", close: "17:00" }]
 *   "08:00 - 11:30, 13:30 - 16:30"     → [{ open: "08:00", close: "11:30" },
 *                                          { open: "13:30", close: "16:30" }]
 *
 * Returns null when:
 *   - The value is a 24-hour marker (caller must check is24Hours first)
 *   - The value is a closed marker  (caller must check isClosed first)
 *   - No segment can be parsed as a valid HH:MM – HH:MM range
 *
 * Invalid individual segments are silently skipped; as long as at least one
 * segment parses, the result is returned.  This makes the function tolerant
 * of trailing commas or minor formatting irregularities.
 *
 * Never throws.
 */
export function parseMultipleRanges(
  value: string,
): { open: string; close: string }[] | null {
  const segments = value.split(',');
  const ranges: { open: string; close: string }[] = [];

  for (const segment of segments) {
    const trimmed = segment.trim();
    if (!trimmed) continue;
    const range = parseTimeRange(trimmed);
    if (range) ranges.push(range);
  }

  return ranges.length > 0 ? ranges : null;
}

