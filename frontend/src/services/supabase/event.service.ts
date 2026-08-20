import { MAP4D_CONFIG } from '@/config/map.config';

// ─── Event UI contract ─────────────────────────────────────────────────────

export interface EventItem {
  id: string;
  name: string;
  description: string | null;
  startDate: Date;
  endDate: Date;
  locationText: string | null;
  ticketUrl: string | null;
  coverImageUrl: string | null;
  bannerImageUrl: string | null;
  websiteUrl: string | null;
  organizer: string | null;
  giaVe: string | null;
  /** Pre-formatted per the "DD/MM/YYYY · HH:mm – HH:mm" rules. */
  timeRangeLabel: string;
}

// ─── Time formatting ────────────────────────────────────────────────────────

function pad2(n: number): string {
  return n.toString().padStart(2, '0');
}

function formatDatePart(d: Date): string {
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`;
}

function formatTimePart(d: Date): string {
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/**
 * Formats an event's start/end into the display string:
 *   Same day:   DD/MM/YYYY · HH:mm            (start time only)
 *   Multi-day:  DD/MM/YYYY – DD/MM/YYYY · HH:mm – HH:mm
 */
export function formatEventRange(start: Date, end: Date): string {
  if (isSameDay(start, end)) {
    return `${formatDatePart(start)} · ${formatTimePart(start)}`;
  }
  const timeRange = `${formatTimePart(start)} – ${formatTimePart(end)}`;
  return `${formatDatePart(start)} – ${formatDatePart(end)} · ${timeRange}`;
}

// ─── Classification ─────────────────────────────────────────────────────────

/**
 * Splits events (already filtered to exclude ended ones by the backend)
 * into "today" (happening today, whether or not it has started yet — its
 * date range overlaps today's calendar date) and "upcoming" (starts on a
 * future calendar date).
 */
export function classifyEvents(items: EventItem[]): { today: EventItem[]; upcoming: EventItem[] } {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  const today: EventItem[] = [];
  const upcoming: EventItem[] = [];

  for (const item of items) {
    if (item.startDate <= todayEnd && item.endDate >= todayStart) {
      today.push(item);
    } else if (item.startDate > todayEnd) {
      upcoming.push(item);
    }
  }

  return { today, upcoming };
}

// ─── Mapper ─────────────────────────────────────────────────────────────────

/**
 * Some event rows have their description stored with literal "\n" escape
 * sequences (backslash + n) rather than real newline characters — normalize
 * both so whitespace-pre-line renders line breaks either way.
 */
function normalizeDescription(description: unknown): string | null {
  if (typeof description !== 'string' || description.trim().length === 0) return null;
  return description.replace(/\\n/g, '\n');
}

/**
 * gia_ve of "0" (or 0) means the event is free — display "Miễn phí" instead
 * of the literal zero. Any other non-empty value passes through as-is.
 */
function normalizeGiaVe(giaVe: unknown): string | null {
  if (giaVe === null || giaVe === undefined) return null;
  const str = String(giaVe).trim();
  if (str.length === 0) return null;
  if (Number(str) === 0) return 'Miễn phí';
  return str;
}

function mapEventRecord(raw: any): EventItem {
  const startDate = new Date(raw.start_date);
  const endDate = new Date(raw.end_date);

  return {
    id: raw.id,
    name: raw.name,
    description: normalizeDescription(raw.description),
    startDate,
    endDate,
    locationText: raw.location_text || null,
    ticketUrl: raw.ticket_url || null,
    coverImageUrl: raw.cover_image_url || null,
    bannerImageUrl: raw.banner_image || null,
    websiteUrl: raw.website_url || null,
    organizer: raw.organizer || null,
    giaVe: normalizeGiaVe(raw.gia_ve),
    timeRangeLabel: formatEventRange(startDate, endDate),
  };
}

// ─── Service ────────────────────────────────────────────────────────────────

export class EventClientService {
  /**
   * Fetches all active, non-ended events associated with a given POI ID
   * via the events.event_pois junction table.
   */
  static async getEventsByPoiId(poiId: string): Promise<EventItem[]> {
    try {
      const response = await fetch(
        `${MAP4D_CONFIG.backendUrl}/api/events/by-poi/${encodeURIComponent(poiId)}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.status === 'OK' && Array.isArray(data.events)) {
        return data.events.map(mapEventRecord);
      }

      throw new Error(data.message || 'Malformed events response from server');
    } catch (error) {
      console.error(`Failed to load events for POI ${poiId}:`, error);
      throw error;
    }
  }
}

export default EventClientService;
