import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type StoryMediaItem } from '@/services/supabase/poiStory.service';
import { StorySection } from './StorySection';
import { StoryMedia } from './StoryMedia';
import { StoryExpandableText } from './StoryExpandableText';

interface StoryExperienceSectionProps {
  /** pois.name — used by the experience headline. */
  poiName: string;
  /** The tham_quan_story row flagged is_primary = true, when one exists. */
  primaryImage: StoryMediaItem | null;
  /** Up to three further tham_quan_story rows. */
  secondaryImages: StoryMediaItem[];
  /** poi_story.founder_info.experience_description */
  description: string | null;
  /** Opens the application's existing experience-registration form. */
  onRegisterExperience?: () => void;
}

/**
 * Section 06 — Trải nghiệm tham quan.
 *
 * Featured image (the record actually flagged is_primary) above a row of equal
 * thumbnails, then the headline built from pois.name, the configured
 * description and the registration call to action. The thumbnail row divides
 * the available width by the number of images that exist, so a business with
 * one or two experience photos still gets a filled, balanced row.
 */
export const StoryExperienceSection: React.FC<StoryExperienceSectionProps> = React.memo(
  ({ poiName, primaryImage, secondaryImages, description, onRegisterExperience }) => {
    const handleRegister = () => {
      if (onRegisterExperience) {
        onRegisterExperience();
      } else {
        // Same convention as PoiActions: UI entry-point only, no second form.
        console.warn(
          '[StoryExperienceSection] Experience registration handler not wired. ' +
            'Pass onRegisterExperience to open the existing registration flow.'
        );
      }
    };

    return (
      <StorySection title="Trải nghiệm tham quan">
        {primaryImage && (
          <StoryMedia
            src={primaryImage.url}
            alt={primaryImage.caption || `Trải nghiệm tham quan tại ${poiName}`}
            title={primaryImage.caption || undefined}
            ratio={16 / 9}
          />
        )}

        {secondaryImages.length > 0 && (
          <div
            className="grid gap-2"
            style={{ gridTemplateColumns: `repeat(${secondaryImages.length}, minmax(0, 1fr))` }}
          >
            {secondaryImages.map((img, i) => (
              <StoryMedia
                key={img.id}
                src={img.url}
                alt={img.caption || `Hình ảnh trải nghiệm ${i + 1}`}
                title={img.caption || undefined}
                ratio={4 / 3}
                radius="lg"
              />
            ))}
          </div>
        )}

        <div className="mt-5 flex flex-col gap-3">
          {/* Headline — the business name always comes from pois.name */}
          <h4 className="text-sm font-bold leading-normal tracking-normal text-foreground">
            Trải nghiệm thực tế quy trình sản xuất tại {poiName}
          </h4>

          {description && (
            <StoryExpandableText
              text={description}
              clampClass="line-clamp-5"
              className="text-[11px] leading-normal text-muted-foreground text-justify"
            />
          )}

          <Button
            id="story-register-experience"
            variant="outline"
            size="sm"
            onClick={handleRegister}
            className="mt-1 h-8 self-start rounded-full border-[#fd9401]/70 px-4 text-[11px] font-semibold text-[#fd9401] hover:bg-[#fd9401] hover:text-white"
            aria-label="Đăng ký trải nghiệm"
            title="Đăng ký trải nghiệm"
          >
            Đăng ký trải nghiệm
            <ChevronRight className="size-3.5" />
          </Button>
        </div>
      </StorySection>
    );
  }
);
