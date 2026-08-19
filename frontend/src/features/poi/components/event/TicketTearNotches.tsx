import React from 'react';
import { cn } from '@/lib/utils';

interface TicketTearNotchesProps {
  /** Tailwind text-color class resolved via currentColor for the notch fill
   * (e.g. "text-background" to reveal the page background behind the card). */
  colorClassName?: string;
  /** Tailwind border-color class for the connecting dotted line between the
   * two notches. Omit to render notches only, with no line. */
  lineColorClassName?: string;
  /**
   * Tailwind text-color class for a smaller notch layered on top of the main
   * one (e.g. "text-[#7A0C0C]" to match a card's border color). Simulates a
   * border that "follows" the notch curve: card border (straight edges) +
   * this inset notch (curved edges) read as one continuous outline, without
   * needing a true responsive SVG-clipped card shape.
   */
  borderColorClassName?: string;
}

const NOTCH_PATH = 'M0,0 C6,0 10,13 16,13 C22,13 26,0 32,0 Z';

/**
 * Two smooth bite notches (top + bottom), optionally joined by a dotted
 * line, positioned to sit exactly on the true edges of a `-my-3` divider
 * wrapper. Each notch is a single cubic bezier path — not a circle clipped
 * against a straight edge — so its shoulders ease into the flat edge with
 * zero slope (no pinch corners). Pair with a divider wrapper that has
 * `relative self-stretch -my-3 mx-1 shrink-0`.
 */
export const TicketTearNotches: React.FC<TicketTearNotchesProps> = ({
  colorClassName = 'text-background',
  lineColorClassName,
  borderColorClassName,
}) => (
  <>
    {/* Inset well past the notch's rendered height (11px) so the dashed
        line never shares a pixel row with the notch fill — relying purely
        on stacking/z-order to hide the overlap leaves a visible seam at
        some zoom levels due to sub-pixel rounding differences between the
        DOM layout and the SVG's internal scaling. */}
    {lineColorClassName && (
      <div
        className={cn('absolute left-1/2 border-l-2 border-dotted', lineColorClassName)}
        style={{ top: 18, bottom: 18 }}
      />
    )}

    <svg
      className={cn('absolute top-0 left-1/2 -translate-x-1/2', colorClassName)}
      width="26" height="11" viewBox="0 0 32 13" fill="currentColor" aria-hidden="true"
    >
      <path d={NOTCH_PATH} />
    </svg>
    <svg
      className={cn('absolute bottom-0 left-1/2 -translate-x-1/2 rotate-180', colorClassName)}
      width="26" height="11" viewBox="0 0 32 13" fill="currentColor" aria-hidden="true"
    >
      <path d={NOTCH_PATH} />
    </svg>

    {/* Inset "border" notch — smaller, layered on top of the notch above —
        so the card's straight border and this curved bite read as one
        continuous outline instead of the border ignoring the cutout. */}
    {borderColorClassName && (
      <>
        <svg
          className={cn('absolute top-0 left-1/2 -translate-x-1/2', borderColorClassName)}
          width="20" height="7" viewBox="0 0 32 13" fill="currentColor" aria-hidden="true"
        >
          <path d={NOTCH_PATH} />
        </svg>
        <svg
          className={cn('absolute bottom-0 left-1/2 -translate-x-1/2 rotate-180', borderColorClassName)}
          width="20" height="7" viewBox="0 0 32 13" fill="currentColor" aria-hidden="true"
        >
          <path d={NOTCH_PATH} />
        </svg>
      </>
    )}
  </>
);
