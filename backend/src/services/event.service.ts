import sql from '../db';

export interface EventRecord {
  id: string;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string;
  location_text: string | null;
  ticket_url: string | null;
  cover_image_url: string | null;
  banner_image: string | null;
  website_url: string | null;
  organizer: string | null;
  is_active: boolean | null;
  is_recurring: boolean | null;
  recurrence_note: string | null;
  time_period_raw: string | null;
  gia_ve: string | null;
}

export class EventService {
  /**
   * Returns all non-ended events linked to a given POI via the
   * events.event_pois junction table, ordered by start date ascending.
   * "Ended" (end_date < now) events are excluded here so callers never
   * need to re-filter for that.
   */
  static async getEventsByPoiId(poiId: string): Promise<EventRecord[]> {
    try {
      const result = await sql`
        SELECT
          e.id,
          e.name,
          e.description,
          e.start_date,
          e.end_date,
          e.location_text,
          e.ticket_url,
          e.cover_image_url,
          e.banner_image,
          e.website_url,
          e.organizer,
          e.is_active,
          e.is_recurring,
          e.recurrence_note,
          e.time_period_raw,
          e.gia_ve
        FROM events.event_pois ep
        JOIN events.events e ON e.id = ep.event_id
        WHERE ep.poi_id = ${poiId}
          AND e.is_active = true
          AND e.end_date >= NOW()
        ORDER BY e.start_date ASC
      `;

      return result.map((raw: any): EventRecord => ({
        id: raw.id,
        name: raw.name,
        description: raw.description || null,
        start_date: raw.start_date,
        end_date: raw.end_date,
        location_text: raw.location_text || null,
        ticket_url: raw.ticket_url || null,
        cover_image_url: raw.cover_image_url || null,
        banner_image: raw.banner_image || null,
        website_url: raw.website_url || null,
        organizer: raw.organizer || null,
        is_active: raw.is_active ?? null,
        is_recurring: raw.is_recurring ?? null,
        recurrence_note: raw.recurrence_note || null,
        time_period_raw: raw.time_period_raw || null,
        gia_ve: raw.gia_ve ?? null,
      }));
    } catch (err: any) {
      console.error(`Error fetching events for POI ${poiId}:`, err);
      throw new Error(`Database Query Failure: ${err.message || err}`);
    }
  }
}
