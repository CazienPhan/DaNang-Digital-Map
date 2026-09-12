import React from 'react';
import { User, CalendarDays, Briefcase} from 'lucide-react';
import { Card } from '@/components/ui/card';
import {
  type StoryFounderInfo,
  type StoryMediaItem,
} from '@/services/supabase/poiStory.service';
import { StorySection } from './StorySection';
import { StoryMetaRow } from './StoryMetaRow';
import { StoryExpandableText } from './StoryExpandableText';

interface StoryFounderSectionProps {
  /** poi_story.founder_info */
  founder: StoryFounderInfo;
  /** First poi_media row with media_category = 'founder_story', when one exists. */
  image: StoryMediaItem | null;
}

/**
 * Section 02 — founder story.
 *
 * One accented card holding the whole story: founder portrait on the left,
 * title and metadata on the right, quote as a highlight underneath. The
 * portrait stretches to the height of the metadata column, so the two halves
 * stay balanced no matter how long the role or the name turns out to be.
 */
export const StoryFounderSection: React.FC<StoryFounderSectionProps> = React.memo(
  ({ founder, image }) => {
    const { founderName, foundedYear, founderRole, founderStory, founderQuote } = founder;
    const hasMeta = Boolean(founderName || foundedYear !== null || founderRole);

    return (
      <StorySection>
        {/* Accented card — the founder story is the page's highlight block */}
        <Card size="sm" className="gap-6 p-3.5 pt-5 ring-[#fd9401]/35">
          <div
            className={
              image
                ? 'grid grid-cols-1 gap-5 @min-[320px]/story:grid-cols-2'
                : ''
            }
          >
            {/* Founder portrait — fills the height of the column beside it */}
            {image && (
              <div className="h-full min-h-[150px] w-full overflow-hidden rounded-xl bg-muted">
                <img
                  src={image.url}
                  alt={image.caption || founderName || 'Nhà sáng lập'}
                  title={image.caption || undefined}
                  loading="lazy"
                  className="h-full min-h-[150px] w-full object-cover"
                />
              </div>
            )}

            {/* Static UI title — never derived from business or product data */}
            <div className="flex min-w-0 flex-col gap-2.5">
              <h4 className="text-sm font-extrabold uppercase leading-tight tracking-normal text-[#ffa700]">
                Câu chuyện của nhà sáng lập
              </h4>

              {hasMeta && (
                <div className="flex flex-col gap-2">
                  {founderName && (
                    <StoryMetaRow
                      icon={<User className="size-3.5" />}
                      label="Nhà sáng lập"
                      value={founderName}
                    />
                  )}
                  {foundedYear !== null && (
                    <StoryMetaRow
                      icon={<CalendarDays className="size-3.5" />}
                      label="Năm thành lập"
                      value={foundedYear}
                    />
                  )}
                  {founderRole && (
                    <StoryMetaRow
                      icon={<Briefcase className="size-3.5" />}
                      label="Vai trò"
                      value={founderRole}
                    />
                  )}
                </div>
              )}
            </div>
          </div>

          {founderStory && (
            <StoryExpandableText
              text={founderStory}
              clampClass="line-clamp-6"
              className="text-[11px] leading-relaxed text-muted-foreground text-justify"
            />
          )}

          {/* Quote — a highlight block, rendered only when one is configured */}
            {founderQuote && (
              <div className="flex gap-5 rounded-xl border border-amber-200/70 bg-[#F5EFE3] px-3 py-2.5 text-justify">
                <div className="mx-1 my-1 w-full">
                  <StoryExpandableText
                    text={founderQuote}
                    clampClass="line-clamp-4"
                    className="text-[11px] leading-relaxed text-stone-700"
                  />
                </div>
              </div>
            )}
        </Card>
      </StorySection>
    );
  }
);
