import { useEffect, useState } from 'react';
import EventClientService, { type EventItem, classifyEvents } from '@/services/supabase/event.service';

export interface UseEventsByPoiResult {
  today: EventItem[];
  upcoming: EventItem[];
  loading: boolean;
  error: string | null;
}

/**
 * Fetches all events linked to a POI once and classifies them into
 * "today" / "upcoming" buckets. Shared by PoiDetailCard's header banner
 * and its "Sự kiện" tab so both read from a single network request.
 */
export function useEventsByPoi(poiId: string | undefined | null): UseEventsByPoiResult {
  const [today, setToday] = useState<EventItem[]>([]);
  const [upcoming, setUpcoming] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!poiId) return;

    let cancelled = false;

    setLoading(true);
    setError(null);

    EventClientService.getEventsByPoiId(poiId)
      .then((data) => {
        if (cancelled) return;
        const { today: todayEvents, upcoming: upcomingEvents } = classifyEvents(data);
        setToday(todayEvents);
        setUpcoming(upcomingEvents);
        setLoading(false);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        console.error('[useEventsByPoi] Failed to load events:', err);
        setError(err.message || 'Không thể kết nối đến máy chủ.');
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [poiId]);

  return { today, upcoming, loading, error };
}
