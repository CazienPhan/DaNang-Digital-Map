import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StoryExpandableTextProps {
  /** Database text. Rendered as-is — never trimmed of meaning, only clamped. */
  text: string;
  /** Typography classes for the paragraph. */
  className?: string;
  /**
   * Tailwind line-clamp utility used while collapsed, e.g. "line-clamp-6".
   * Passed as a literal by each call site so the class is statically known.
   */
  clampClass: string;
  /** Above this many characters the text is collapsed behind a toggle. */
  threshold?: number;
}

/**
 * Long database copy inside the narrow POI sidebar: clamped to a few lines with
 * a "Xem thêm / Thu gọn" toggle. Short text is rendered in full with no toggle.
 */
export const StoryExpandableText: React.FC<StoryExpandableTextProps> = ({
  text,
  className,
  clampClass,
  threshold = 220,
}) => {
  const [expanded, setExpanded] = useState(false);
  const isLong = text.length > threshold;

  return (
    <div className="flex w-full flex-col items-start gap-1">
      <p className={cn('whitespace-pre-line', className, isLong && !expanded && clampClass)}>
        {text}
      </p>

      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          aria-expanded={expanded}
          className="flex items-center gap-0.5 rounded-sm text-[11px] font-semibold text-[#fd9401] transition-colors hover:text-amber-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fd9401]/50"
        >
          {expanded ? (
            <>
              Thu gọn
              <ChevronUp size={12} strokeWidth={2.5} aria-hidden="true" />
            </>
          ) : (
            <>
              Xem thêm
              <ChevronDown size={12} strokeWidth={2.5} aria-hidden="true" />
            </>
          )}
        </button>
      )}
    </div>
  );
};
