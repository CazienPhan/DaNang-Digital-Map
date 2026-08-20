import React from 'react';
import { Clock, MapPin, Ticket, CalendarDays } from 'lucide-react';
import { type EventItem } from '@/services/supabase/event.service';

// Matches the event name color used in EventDetailPanel.tsx — keep in sync.
const GOLD = '#FFD666';

interface EventTodayCardProps {
  event: EventItem;
  onClick?: (event: EventItem) => void;
}

/**
 * "Sự kiện hôm nay" card — background is the event's own cover image with a
 * dark blurred overlay so text stays readable. Falls back to a flat dark
 * background when no cover image is set. Left column shows a framed sharp
 * thumbnail of the same cover image; right column shows the info, separated
 * by a ticket-tear style dotted divider.
 */
export const EventTodayCard: React.FC<EventTodayCardProps> = React.memo(({ event, onClick }) => {
  return (
    <button
      type="button"
      onClick={() => onClick?.(event)}
      className="relative w-full text-left rounded-2xl overflow-hidden border-0 min-h-[104px] shadow-sm transition-[transform,box-shadow] duration-200 ease-out will-change-transform hover:-translate-y-0.5 hover:scale-[1.005] hover:shadow-[0_10px_24px_rgba(0,0,0,0.22)] active:translate-y-0 active:scale-[0.995] active:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      style={{
        backgroundImage: event.coverImageUrl ? `url(${event.coverImageUrl})` : undefined,
        backgroundColor: event.coverImageUrl ? undefined : '#1f1730',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
      <div className="relative flex items-stretch gap-3 p-3">
        {/* Left: framed sharp thumbnail of the cover image */}
        <div className="shrink-0 w-20 self-stretch rounded-xl overflow-hidden bg-black/20">
          {event.coverImageUrl ? (
            <img src={event.coverImageUrl} alt={event.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/40">
              <CalendarDays size={26} />
            </div>
          )}
        </div>

        {/* Right: info wrapper centering the content, with the divider inside it to match text height */}
        <div className="flex flex-col justify-center min-w-0 flex-1">
          <div className="flex items-stretch gap-3">
            {/* Dotted divider matching the text block height */}
            <div className="w-0 shrink-0 border-l-2 border-dotted border-white/40" />

            {/* Text details */}
            <div className="flex flex-col gap-1.5 min-w-0 flex-1 py-0.5">
              <h3 className="text-sm font-bold leading-snug" style={{ color: GOLD }}>{event.name}</h3>

              <div className="flex items-center gap-1.5 text-[11px] text-white/90">
                <Clock size={12} className="shrink-0" />
                <span className="min-w-0 truncate leading-snug">{event.timeRangeLabel}</span>
              </div>

              {event.locationText && (
                <div className="flex items-center gap-1.5 text-[11px] text-white/90">
                  <MapPin size={12} className="shrink-0" />
                  <span className="min-w-0 line-clamp-2 leading-snug">{event.locationText}</span>
                </div>
              )}

              {event.giaVe && (
                <div className="flex items-center gap-1.5 text-[11px] text-white/90">
                  <Ticket size={12} className="shrink-0" />
                  <span className="min-w-0 truncate leading-snug">Giá vé: {event.giaVe}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </button>
  );
});

