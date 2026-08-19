import React from 'react';
import { Clock, MapPin, Ticket, CalendarDays } from 'lucide-react';
import { type EventItem } from '@/services/supabase/event.service';

// Matches the palette used elsewhere for this "torn ticket" treatment —
// MAROON and CREAM mirror ProductDetailPanel.tsx's bespoke mockup colors.
const MAROON = '#7A0C0C';
const CREAM = '#FFF8EB';

interface EventUpcomingCardProps {
  event: EventItem;
  onClick?: (event: EventItem) => void;
}

/**
 * "Sắp diễn ra" card — same torn-ticket-stub layout as EventTodayCard
 * (framed image | notch bites | info), but two-tone instead of a blurred
 * photo backdrop: white on the image side, cream on the info side, with a
 * maroon border and maroon title/text — matching the approved mockup.
 */
export const EventUpcomingCard: React.FC<EventUpcomingCardProps> = React.memo(({ event, onClick }) => {
  return (
    <button
      type="button"
      onClick={() => onClick?.(event)}
      className="relative w-full text-left rounded-2xl overflow-hidden border-2 min-h-[104px] shadow-sm transition-[transform,box-shadow] duration-200 ease-out will-change-transform hover:-translate-y-0.5 hover:scale-[1.005] hover:shadow-[0_10px_24px_rgba(122,12,12,0.18)] active:translate-y-0 active:scale-[0.995] active:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7A0C0C]/35 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      style={{
        borderColor: MAROON,
        background: `linear-gradient(to right, #ffffff 104px, ${CREAM} 104px)`,
      }}
    >
      <div className="relative flex items-stretch gap-3 p-3">
        {/* Left: framed sharp thumbnail of the cover image */}
        <div className="shrink-0 w-20 self-stretch rounded-xl overflow-hidden bg-neutral-100 [transform:translateZ(0)]">
          {event.coverImageUrl ? (
            <img src={event.coverImageUrl} alt={event.name} className="w-full h-full object-cover rounded-xl" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-300">
              <CalendarDays size={26} />
            </div>
          )}
        </div>

        {/* Right: info wrapper centering the content, with the divider inside it to match text height */}
        <div className="flex flex-col justify-center min-w-0 flex-1">
          <div className="flex items-stretch gap-3">
            {/* Dotted divider matching the text block height */}
            <div className="w-0 shrink-0 border-l-2 border-dotted border-[#7A0C0C]/25" />

            {/* Text details */}
            <div className="flex flex-col gap-1.5 min-w-0 flex-1 py-0.5">
              <h3 className="text-sm font-bold leading-snug line-clamp-2" style={{ color: MAROON }}>
                {event.name}
              </h3>

              <div className="flex items-center gap-1.5 text-[11px]" style={{ color: MAROON }}>
                <Clock size={12} className="shrink-0" />
                <span className="min-w-0 truncate leading-snug">{event.timeRangeLabel}</span>
              </div>

              {event.locationText && (
                <div className="flex items-center gap-1.5 text-[11px]" style={{ color: MAROON }}>
                  <MapPin size={12} className="shrink-0" />
                  <span className="min-w-0 line-clamp-2 leading-snug">{event.locationText}</span>
                </div>
              )}

              {event.giaVe && (
                <div className="flex items-center gap-1.5 text-[11px]" style={{ color: MAROON }}>
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

