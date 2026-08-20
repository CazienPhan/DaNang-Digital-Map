import React, { useState, useEffect } from 'react';
import { type EventItem } from '@/services/supabase/event.service';

// Matches the "Thông tin sự kiện" badge color used in EventDetailPanel.tsx.
const GOLD = '#FFD666';

interface EventBannerProps {
  events: EventItem[];
  onClick?: (event: EventItem) => void;
}

/**
 * Banner shown above the tab row on the "Tổng quan" tab when the POI has events
 * running today. If there is 1 event, it shows a static banner. If there are
 * 2 or more, it automatically slides between them every 3s, pausing on hover.
 */
export const EventBanner: React.FC<EventBannerProps> = React.memo(({ events, onClick }) => {
  // Append the first event at the end of the array to achieve a seamless loop sliding from right to left.
  const displayEvents = events.length > 1 ? [...events, events[0]] : events;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(true);

  // Reset index when events change
  useEffect(() => {
    setCurrentIndex(0);
    setIsTransitioning(true);
  }, [events]);

  useEffect(() => {
    if (events.length <= 1 || isHovered) return;

    const timer = setInterval(() => {
      setIsTransitioning(true);
      setCurrentIndex((prev) => prev + 1);
    }, 3000);

    return () => clearInterval(timer);
  }, [events.length, isHovered]);

  const handleTransitionEnd = () => {
    // If we reached the cloned first element at the end of displayEvents
    if (currentIndex === displayEvents.length - 1) {
      setIsTransitioning(false); // disable transition animation
      setCurrentIndex(0); // jump back to index 0 instantly
    }
  };

  if (events.length === 0) return null;

  return (
    <div
      className="relative mx-4 mb-3 w-[calc(100%-2rem)] rounded-xl overflow-hidden h-28 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Slider track wrapper */}
      <div
        className="flex h-full w-full"
        style={{
          transform: `translateX(-${currentIndex * 100}%)`,
          transition: isTransitioning ? 'transform 500ms ease-out' : 'none',
        }}
        onTransitionEnd={handleTransitionEnd}
      >
        {displayEvents.map((event, index) => {
          const imageUrl = event.bannerImageUrl || event.coverImageUrl;
          return (
            <button
              key={`${event.id}-${index}`}
              type="button"
              onClick={() => onClick?.(event)}
              className="relative w-full h-full shrink-0 text-left focus-visible:outline-none"
              style={{
                backgroundImage: imageUrl ? `url(${imageUrl})` : undefined,
                backgroundColor: imageUrl ? undefined : '#1f1730',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <span
                className="absolute top-2.5 left-2.5 rounded-full px-3 py-1 text-[10px] tracking-tight text-black z-10"
                style={{ background: GOLD }}
              >
                Sự kiện
              </span>
            </button>
          );
        })}
      </div>

      {/* Slide indicators (dots) */}
      {events.length > 1 && (
        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
          {events.map((_, idx) => {
            // Map the dot highlight to the actual active index
            const isActive = idx === currentIndex || (currentIndex === displayEvents.length - 1 && idx === 0);
            return (
              <button
                key={idx}
                type="button"
                aria-label={`Go to slide ${idx + 1}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsTransitioning(true);
                  setCurrentIndex(idx);
                }}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  isActive ? 'w-4 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/80'
                }`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
});
