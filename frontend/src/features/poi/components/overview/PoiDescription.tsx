import React, { useState, useCallback, useMemo } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/**
 * Maximum number of characters shown in the collapsed preview.
 * Truncation always ends on a complete word boundary so no Vietnamese
 * syllable or Latin word is ever cut in half.
 */
const PREVIEW_CHAR_LIMIT = 200;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns a preview string that is at most `limit` characters long and
 * always ends on a complete word boundary (space or punctuation).
 * If the original text fits within the limit, returns it unchanged.
 */
function buildPreview(text: string, limit: number): string {
  if (text.length <= limit) return text;

  // Walk back from the limit until we find a safe break point.
  let cutAt = limit;
  while (cutAt > 0 && !/[\s,;.!?]/.test(text[cutAt]!)) {
    cutAt--;
  }

  // If we couldn't find any break point at all, fall back to the hard limit.
  if (cutAt === 0) cutAt = limit;

  return text.slice(0, cutAt).trimEnd();
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface PoiDescriptionProps {
  description?: string;
  name?: string;
}

export const PoiDescription: React.FC<PoiDescriptionProps> = React.memo(
  ({ description, name }) => {
    // Reset to collapsed whenever description changes (i.e. different POI selected).
    const [isExpanded, setIsExpanded] = useState(false);

    const toggle = useCallback(() => setIsExpanded((prev) => !prev), []);

    // Derived values — memoised so they are not recomputed on every render.
    const isLong = useMemo(
      () => (description?.length ?? 0) > PREVIEW_CHAR_LIMIT,
      [description]
    );

    const preview = useMemo(
      () => (description ? buildPreview(description, PREVIEW_CHAR_LIMIT) : ''),
      [description]
    );

    if (!description) return null;

    const displayedText = isExpanded ? description : preview;
    const showEllipsis = isLong && !isExpanded;

    return (
      <div className="bg-[#F5EFE3] font-normal rounded-2xl border border-amber-200/60 p-5">
        {/* Title — unchanged */}
        <h2 className="text-base font-bold text-stone-800 leading-tight mb-1.5">
          {name}
        </h2>

        {/* Description text with smooth height transition */}
        <div
          className="overflow-hidden transition-all duration-300 ease-in-out"
          style={{ willChange: 'max-height' }}
        >
          <p className="text-xs whitespace-pre-line leading-relaxed text-stone-700 text-justify">
            {displayedText}
            {showEllipsis && (
              <span aria-hidden="true" className="text-stone-500">
                …
              </span>
            )}
          </p>
        </div>

        {/* Read more / Show less — only shown when description is long */}
        {isLong && (
          <button
            type="button"
            onClick={toggle}
            aria-expanded={isExpanded}
            aria-label={isExpanded ? 'Show less' : 'Read more'}
            className="
              mt-2 flex items-center gap-0.5
              text-xs font-semibold text-amber-700
              hover:text-amber-900 focus-visible:outline-none
              focus-visible:ring-2 focus-visible:ring-amber-500
              focus-visible:ring-offset-1 rounded
              transition-colors duration-150
              cursor-pointer select-none
            "
          >
            {isExpanded ? (
              <>
                Show less
                <ChevronUp size={13} strokeWidth={2.5} aria-hidden="true" />
              </>
            ) : (
              <>
                Read more
                <ChevronDown size={13} strokeWidth={2.5} aria-hidden="true" />
              </>
            )}
          </button>
        )}
      </div>
    );
  }
);
