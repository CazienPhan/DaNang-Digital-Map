import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface StoryGalleryProps {
  /** Accessible label of the previous / next controls. */
  prevLabel: string;
  nextLabel: string;
  /** Pixels scrolled per arrow click — normally one thumbnail plus its gap. */
  step: number;
  className?: string;
  children: React.ReactNode;
}

/**
 * Horizontal, swipeable strip with compact arrow controls.
 *
 * The arrows only appear when the content really overflows, and each one is
 * disabled at its end of the strip, so the controls never promise navigation
 * that is not possible. Scrolling stays inside the strip: the sidebar itself
 * never scrolls sideways.
 */
export const StoryGallery: React.FC<StoryGalleryProps> = ({
  prevLabel,
  nextLabel,
  step,
  className,
  children,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [overflows, setOverflows] = useState(false);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const sync = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setOverflows(maxScroll > 1);
    setAtStart(el.scrollLeft <= 1);
    setAtEnd(el.scrollLeft >= maxScroll - 1);
  }, []);

  // Re-measure when the strip, its content or the sidebar width changes.
  const itemCount = React.Children.count(children);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    sync();

    const observer = new ResizeObserver(sync);
    observer.observe(el);
    Array.from(el.children).forEach((child) => observer.observe(child));

    return () => observer.disconnect();
  }, [sync, itemCount]);

  const scroll = (direction: 'left' | 'right') => {
    scrollRef.current?.scrollBy({
      left: direction === 'right' ? step : -step,
      behavior: 'smooth',
    });
  };

  return (
    <div className={cn('relative', className)}>
      <div
        ref={scrollRef}
        onScroll={sync}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain pb-0.5"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {children}
      </div>

      {overflows && (
        <>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={() => scroll('left')}
            disabled={atStart}
            aria-label={prevLabel}
            className="absolute left-1 top-1/2 -translate-y-1/2 rounded-full bg-background/90 shadow-sm backdrop-blur-sm disabled:opacity-0"
          >
            <ChevronLeft className="size-4" strokeWidth={2.5} />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={() => scroll('right')}
            disabled={atEnd}
            aria-label={nextLabel}
            className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-background/90 shadow-sm backdrop-blur-sm disabled:opacity-0"
          >
            <ChevronRight className="size-4" strokeWidth={2.5} />
          </Button>
        </>
      )}
    </div>
  );
};
