import React from 'react';
import { cn } from '@/lib/utils';

interface StorySectionProps {
  /**
   * Static UI title of the section. Omitted where the section's own content
   * already carries the heading (e.g. the business introduction).
   */
  title?: string;
  /**
   * Renders the title in the brand orange — used by sections that sit on an
   * accent surface so the heading keeps its contrast.
   */
  accent?: boolean;
  className?: string;
  children: React.ReactNode;
}

/**
 * One block of the "Câu chuyện" tab.
 *
 * Every section is built from this wrapper so all six share the same title
 * typography, the same title→content gap and the same content grid — the page
 * reads as one document instead of six stacked widgets.
 */
export const StorySection: React.FC<StorySectionProps> = React.memo(
  ({ title, accent = false, className, children }) => (
    <section className={cn('flex w-full flex-col gap-3', className)}>
      {title && (
        <h3
          className={cn(
            'text-base font-extrabold uppercase leading-tight tracking-normal',
            accent ? 'text-[#fd9401]' : 'text-foreground'
          )}
        >
          {title}
        </h3>
      )}
      {children}
    </section>
  )
);
