import React, { useState, useEffect } from 'react';
import { X, Clock, MapPin, Ticket, Globe, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type EventItem } from '@/services/supabase/event.service';

// Colors estimated from the approved mockup — keep in sync with it, not with
// the app's generic theme tokens (mirrors ProductDetailPanel's bespoke palette).
const NAVY = '#241B3A';
const GOLD = '#FFD666';
const ORANGE = '#fd9401';
const CREAM_BORDER = '#E7D9BC';

interface EventDetailPanelProps {
  /** The event to display. Panel is hidden (but stays mounted for the
   * closing animation) when null. */
  event: EventItem | null;
  /** Called when the user dismisses the panel via its close button. */
  onClose: () => void;
  /**
   * Actual rendered width (px) of the POI Sheet the panel floats beside, on
   * desktop (>= sm breakpoint). Falls back to 480px until measured.
   */
  anchorLeft?: number;
}

/**
 * Floating rounded card (desktop) / bottom sheet (mobile) showing the full
 * detail of an event selected from a POI's "Sự kiện" tab or Overview banner.
 * Rendered as a sibling of the POI detail Sheet, floating beside it — never
 * covers it. Structurally mirrors ProductDetailPanel.
 */
export const EventDetailPanel: React.FC<EventDetailPanelProps> = ({ event, onClose, anchorLeft }) => {
  const open = !!event;

  // Keep rendering the last event while the panel animates closed.
  const [displayed, setDisplayed] = useState<EventItem | null>(event);
  useEffect(() => {
    if (event) setDisplayed(event);
  }, [event]);

  if (!displayed) return null;

  return (
    <div
      style={{ ['--panel-left' as string]: `${(anchorLeft ?? 480) + 16}px` }}
      className={cn(
        'fixed z-40 flex flex-col bg-white shadow-xl transition-transform duration-300 ease-in-out',
        'inset-x-0 bottom-0 max-h-[75vh] rounded-t-3xl',
        'sm:inset-x-auto sm:left-[var(--panel-left)] sm:top-[70px] sm:bottom-15 sm:max-h-none sm:w-[380px] sm:rounded-[28px] sm:border sm:border-neutral-200',
        open ? 'translate-y-0 sm:translate-x-0' : 'translate-y-full sm:translate-y-0 sm:-translate-x-[2000px]'
      )}
      aria-hidden={!open}
    >
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden p-4 pt-0">
        <div className="flex h-[52px] shrink-0 items-center justify-end">
        <button
          onClick={onClose}
          aria-label="Đóng"
          className="-mr-1 flex h-8 w-8 items-center justify-center text-neutral-700 hover:text-black hover:opacity-70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/25 focus-visible:ring-offset-2"
        >
          <X size={20} strokeWidth={1.8} />
        </button>
        </div>

        {/* One continuous dark block: blurred+darkened cover image as an
            ambient background spans the whole panel (image header through
            the description area). Content scrolls on top of it; the white
            "Thông tin sự kiện" box floats directly on the dark background. */}
        <div className="relative z-10 flex-1 min-h-0 rounded-2xl overflow-hidden">
          {/* Blurred ambient background layer — fixed, fills the whole block */}
          <div className="absolute inset-0">
            {displayed.coverImageUrl ? (
              <div
                className="absolute inset-[-24px] bg-cover bg-center blur-lg scale-110 brightness-[0.6]"
                style={{ backgroundImage: `url(${displayed.coverImageUrl})` }}
              />
            ) : (
              <div className="absolute inset-0" style={{ background: NAVY }} />
            )}
            <div className="absolute inset-0 bg-black/35" />
          </div>

          {/* Fixed header content — image + name/time/location + divider never scroll */}
          <div className="relative z-10 h-full flex flex-col gap-4.5 p-0">
            <div
              className="relative h-40 w-full rounded-xl overflow-hidden bg-black/20 shadow-lg shrink-0"
              style={{ clipPath: 'inset(0 round 12px)' }}
            >
              {displayed.coverImageUrl ? (
                <img
                  src={displayed.coverImageUrl}
                  alt={displayed.name}
                  className="block w-full h-full object-cover"
                  style={{ clipPath: 'inset(0 round 12px)' }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/40">
                  <CalendarDays size={40} />
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1.5 pl-4.5 pr-3 shrink-0 mt-2">
              <h2 className="text-[15px] font-extrabold tracking-tight leading-snug" style={{ color: GOLD }}>
                {displayed.name}
              </h2>
              <div className="flex items-center gap-1.5 text-[11px] text-white">
                <Clock size={12} className="shrink-0" />
                <span className="min-w-0 leading-snug">{displayed.timeRangeLabel}</span>
              </div>
              {displayed.locationText && (
                <div className="flex items-center gap-1.5 text-[11px] text-white">
                  <MapPin size={12} className="shrink-0" />
                  <span className="min-w-0 line-clamp-2 leading-snug">{displayed.locationText}</span>
                </div>
              )}
              {displayed.giaVe && (
                <div className="flex items-center gap-1.5 text-[11px] text-white">
                  <Ticket size={12} className="shrink-0" />
                  <span>Giá vé: {displayed.giaVe}</span>
                </div>
              )}
            </div>

            {/* Ticket-style dotted divider — tight "···" dots, not spaced-out
                punched holes. */}
            <div className="border-t-2 border-dotted border-white/40 mx-5 shrink-0" />

            {/* Badge + scrollable info box — only this part scrolls. The badge
                sits outside the box's own overflow so it never gets clipped. */}
            <div className="relative mx-3 mb-2 mt-3 flex-1 min-h-0 flex flex-col">
              <span
                className="absolute -top-4 left-3 z-20 inline-block rounded-full px-4 py-1.5 text-[12.5px] font-extrabold uppercase tracking-tight text-black"
                style={{ background: GOLD }}
              >
                Thông tin sự kiện
              </span>

              <div
                className="scrollbar-hidden flex-1 min-h-0 overflow-y-auto rounded-2xl border bg-white px-4 pb-4"
                style={{ borderColor: CREAM_BORDER }}
              >
                {/* Invisible mask — same size/position as the badge's dip into
                    the box, pinned to the top of the scroll viewport so
                    scrolled text is covered before it ever reaches the badge. */}
                <div className="sticky top-0 z-10 -mx-4 h-7 bg-white" />

                {displayed.description ? (
                  <p className="text-[13px] leading-relaxed text-neutral-800 whitespace-pre-line">
                    {displayed.description}
                  </p>
                ) : (
                  <p className="text-[13px] leading-relaxed text-neutral-500">
                    Chưa có mô tả cho sự kiện này.
                  </p>
                )}

                {(displayed.websiteUrl || displayed.ticketUrl) && (
                  <div className="mt-4 flex flex-col gap-2 border-t pt-3" style={{ borderColor: CREAM_BORDER }}>
                    {displayed.websiteUrl && (
                      <a
                        href={displayed.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-[12px] text-blue-600 hover:underline"
                      >
                        <Globe size={13} className="shrink-0" />
                        <span className="truncate">{displayed.websiteUrl}</span>
                      </a>
                    )}
                    {displayed.ticketUrl && (
                      <a
                        href={displayed.ticketUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-[12px] font-bold text-white"
                        style={{ background: ORANGE }}
                      >
                        <Ticket size={13} className="shrink-0" />
                        Mua vé
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPanel;
