import React from 'react';
import { type EventItem } from '@/services/supabase/event.service';
import { EventTodayCard } from './EventTodayCard';
import { EventUpcomingCard } from './EventUpcomingCard';

interface PoiEventSectionProps {
  today: EventItem[];
  upcoming: EventItem[];
  loading: boolean;
  error: string | null;
  onSelectEvent?: (event: EventItem) => void;
}

/**
 * "Sự kiện" tab content — renders the "Sự kiện hôm nay" and "Sắp diễn ra"
 * sections. Data is fetched once by the parent (PoiDetailCard, via
 * useEventsByPoi) and passed in, so the header banner and this tab always
 * agree and never trigger duplicate requests.
 */
export const PoiEventSection: React.FC<PoiEventSectionProps> = React.memo(
  ({ today, upcoming, loading, error, onSelectEvent }) => {
    // ── Loading skeleton ──────────────────────────────────────────────────────
    if (loading) {
      return (
        <div className="flex flex-col gap-3 px-4 py-3">
          <div className="h-[104px] bg-muted rounded-2xl animate-pulse" />
          <div className="h-16 bg-muted rounded-2xl animate-pulse" />
          <div className="h-16 bg-muted rounded-2xl animate-pulse" />
        </div>
      );
    }

    // ── Error state ───────────────────────────────────────────────────────────
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center px-6">
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <p className="text-sm font-semibold text-foreground mb-1">Không thể tải sự kiện</p>
          <p className="text-xs text-muted-foreground">{error}</p>
        </div>
      );
    }

    // ── Empty state ───────────────────────────────────────────────────────────
    if (today.length === 0 && upcoming.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center px-6">
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
            <span className="text-2xl">🎉</span>
          </div>
          <p className="text-sm font-semibold text-foreground mb-1">Chưa có sự kiện</p>
          <p className="text-xs text-muted-foreground">
            Thông tin sự kiện sẽ được cập nhật trong thời gian tới.
          </p>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-5 px-4 py-3">
        {today.length > 0 && (
          <div className="flex flex-col gap-2">
            <h2 className="text-sm font-bold text-foreground">Sự kiện hôm nay</h2>
            <div className="flex flex-col gap-2.5">
              {today.map((event) => (
                <EventTodayCard key={event.id} event={event} onClick={onSelectEvent} />
              ))}
            </div>
          </div>
        )}

        {upcoming.length > 0 && (
          <div className="flex flex-col gap-2">
            <h2 className="text-sm font-bold text-foreground">Sắp diễn ra</h2>
            <div className="flex flex-col gap-2.5">
              {upcoming.map((event) => (
                <EventUpcomingCard key={event.id} event={event} onClick={onSelectEvent} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
);
