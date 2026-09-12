import React from 'react';
import { type StoryMediaItem } from '@/services/supabase/poiStory.service';
import { StorySection } from './StorySection';
import { StoryMedia } from './StoryMedia';
import { StoryExpandableText } from './StoryExpandableText';

/**
 * Frame of each stacked introduction image. Two of them plus the gap add up to
 * roughly the height of the text column, which is what keeps the 50/50
 * composition balanced instead of one side towering over the other.
 */
const INTRO_IMAGE_RATIO = 1;

interface StoryIntroSectionProps {
  /** pois.name */
  name: string;
  /** poi_story.gioi_thieu — null hides the description block entirely. */
  description: string | null;
  /** poi_media rows with media_category = 'business_story'. */
  images: StoryMediaItem[];
}

/**
 * Section 01 — business introduction.
 *
 * Name and introduction on the left, the business images stacked on the right,
 * each half of the row the same width. The section carries no separate heading:
 * the business name is the heading. Either column drops out cleanly when its
 * data is missing, and the remaining one then spans the full width.
 */
export const StoryIntroSection: React.FC<StoryIntroSectionProps> = React.memo(
  ({ name, description, images }) => {
    // The composition is a two-image stack; only images that exist are drawn.
    const stacked = images.slice(0, 2);
    const hasImages = stacked.length > 0;

    return (
      <StorySection>
        <div
          className={
            hasImages
              ? 'grid grid-cols-1 items-start gap-3 @min-[320px]/story:grid-cols-[minmax(0,1fr)_var(--story-frame)]'
              : ''
          }
        >
          {/* Text column */}
          <div className="flex min-w-0 flex-col gap-1.5">
            <h4 className="text-[15px] font-bold leading-normal text-foreground">{name}</h4>

            {description && (
              <StoryExpandableText
                text={description}
                clampClass="line-clamp-8"
                className="text-[11px] leading-relaxed text-muted-foreground text-justify"
              />
            )}
          </div>

          {/* Image column — equal widths, equal heights, one shared radius */}
          {hasImages && (
            <div className="flex flex-col gap-2">
              {stacked.map((img, idx) => (
                <StoryMedia
                  key={img.id}
                  src={img.url}
                  alt={img.caption || `${name} — ảnh ${idx + 1}`}
                  title={img.caption || undefined}
                  ratio={INTRO_IMAGE_RATIO}
                />
              ))}
            </div>
          )}
        </div>
      </StorySection>
    );
  }
);
