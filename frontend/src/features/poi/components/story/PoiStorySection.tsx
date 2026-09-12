import React, { Fragment } from 'react';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { type ProductItem } from '@/services/supabase/product.service';
import {
  type PoiStoryData,
  type StoryMediaItem,
} from '@/services/supabase/poiStory.service';
import { StoryIntroSection } from './StoryIntroSection';
import { StoryFounderSection } from './StoryFounderSection';
import { StoryProductsSection } from './StoryProductsSection';
import { StoryCertificationsSection } from './StoryCertificationsSection';
import { StoryProcessSection } from './StoryProcessSection';
import { StoryExperienceSection } from './StoryExperienceSection';

interface PoiStorySectionProps {
  /** pois.name of the POI being displayed. */
  poiName: string;
  /** Story bundle for this POI, or null while loading / on error. */
  story: PoiStoryData | null;
  loading: boolean;
  error: string | null;
  /** Opens the existing Product Detail flow. */
  onSelectProduct?: (item: ProductItem) => void;
  /** Opens the existing experience-registration form. */
  onRegisterExperience?: () => void;
}

/** Images only — a category should never render a video as a picture. */
const isImage = (m: StoryMediaItem) => m.mediaType !== 'VIDEO';

/**
 * PoiStorySection orchestrates the "Câu chuyện" tab.
 *
 * It renders the six business-story sections in order, and each section only
 * when the database actually holds content for it — a section with no data is
 * left out entirely rather than rendered empty. Nothing is defaulted or
 * fabricated: every value shown comes from the story bundle.
 *
 * Layout: the whole tab is one container query context (`@container/story`), so
 * the two-column sections respond to the real sidebar width rather than to the
 * viewport, and every section shares the same width, the same left/right edge
 * and the same vertical rhythm.
 */
export const PoiStorySection: React.FC<PoiStorySectionProps> = React.memo(
  ({ poiName, story, loading, error, onSelectProduct, onRegisterExperience }) => {
    // ── Loading skeleton — same grid and rhythm as the real content ───────────
    if (loading) {
      return (
        <div className="@container/story flex w-full flex-col gap-5">
          <div className="grid grid-cols-1 gap-3 @min-[320px]/story:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
            <div className="flex flex-col gap-2">
              <Skeleton className="aspect-2/1 w-full rounded-xl" />
              <Skeleton className="aspect-2/1 w-full rounded-xl" />
            </div>
          </div>
          <Separator className="bg-border/60" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Separator className="bg-border/60" />
          <Skeleton className="h-3.5 w-2/5" />
          <Skeleton className="aspect-video w-full rounded-xl" />
        </div>
      );
    }

    // ── Error state ───────────────────────────────────────────────────────────
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
          <div className="mb-4 flex h-1 w-14 items-center justify-center rounded-full bg-muted">
            <span className="text-2xl">⚠️</span>
          </div>
          <p className="mb-1 text-sm font-semibold text-foreground">Không thể tải câu chuyện</p>
          <p className="text-xs text-muted-foreground">{error}</p>
        </div>
      );
    }

    if (!story) return null;

    // ── Derived, database-only content ────────────────────────────────────────
    const businessImages = story.media.business_story.filter(isImage);
    const founderImage = story.media.founder_story.filter(isImage)[0] ?? null;

    // The process video is the process_story record that really is a video —
    // never "the first video in the database".
    const processVideo = story.media.process_story.find((m) => m.mediaType === 'VIDEO') ?? null;

    // The featured experience image is the one flagged is_primary, not the
    // first row returned.
    const experienceImages = story.media.tham_quan_story.filter(isImage);
    const primaryExperienceImage = experienceImages.find((m) => m.isPrimary) ?? null;
    const secondaryExperienceImages = experienceImages
      .filter((m) => m.id !== primaryExperienceImage?.id)
      .slice(0, 3);

    const founder = story.founder;
    const hasFounderContent = Boolean(
      founder &&
        (founder.founderName ||
          founder.foundedYear !== null ||
          founder.founderRole ||
          founder.founderStory ||
          founder.founderQuote)
    );

    const hasIntro = Boolean(story.gioiThieu) || businessImages.length > 0;
    const hasProducts = story.products.length > 0;
    const hasCertifications = story.certifications.length > 0;
    const hasProcess = Boolean(processVideo) || story.processSteps.length > 0;
    const hasExperience =
      experienceImages.length > 0 || Boolean(founder?.experienceDescription);

    // Only the sections with content take part in the page rhythm; a hidden one
    // leaves no gap and no divider behind.
    const sections: { key: string; node: React.ReactNode }[] = [];
    const push = (key: string, node: React.ReactNode) => sections.push({ key, node });

    if (hasIntro) {
      push(
        'intro',
        <StoryIntroSection
          name={poiName}
          description={story.gioiThieu}
          images={businessImages}
        />
      );
    }

    if (hasFounderContent && founder) {
      push('founder', <StoryFounderSection founder={founder} image={founderImage} />);
    }

    if (hasProducts) {
      push(
        'products',
        <StoryProductsSection products={story.products} onSelectProduct={onSelectProduct} />
      );
    }

    if (hasCertifications) {
      push(
        'certifications',
        <StoryCertificationsSection certifications={story.certifications} />
      );
    }

    if (hasProcess) {
      push('process', <StoryProcessSection video={processVideo} steps={story.processSteps} />);
    }

    if (hasExperience) {
      push(
        'experience',
        <StoryExperienceSection
          poiName={poiName}
          primaryImage={primaryExperienceImage}
          secondaryImages={secondaryExperienceImages}
          description={founder?.experienceDescription ?? null}
          onRegisterExperience={onRegisterExperience}
        />
      );
    }

    // ── Empty state — no story content configured for this business ───────────
    if (sections.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <span className="text-2xl">📖</span>
          </div>
          <p className="mb-1 text-sm font-semibold text-foreground">Chưa có câu chuyện</p>
          <p className="text-xs text-muted-foreground">
            Câu chuyện doanh nghiệp sẽ được cập nhật trong thời gian tới.
          </p>
        </div>
      );
    }

    return (
      <div className="@container/story flex w-full flex-col pl-2">
        {/*
          `--story-frame`: single source of truth for the square image-frame
          size shared by the Story Intro image column and the Certifications
          thumbnails. Below the two-column breakpoint the Intro image column
          is the full container width; at/above it, it is one of two equal
          tracks in a 12px-gap grid — i.e. (100cqw - gap) / 2. Both sections
          read this one variable instead of each computing their own frame
          size, so they can never drift apart.

          This must live on a CHILD of `@container/story`, not the container
          element itself — a container cannot query its own size to style
          itself, so the conditional override silently no-ops when placed
          there. `contents` keeps this wrapper invisible to layout.
        */}
        <div className="contents [--story-frame:100cqw] @min-[320px]/story:[--story-frame:calc((100cqw-0.75rem)/2)]">
          {sections.map((section, i) => (
            <Fragment key={section.key}>
              {i > 0 && <Separator className="my-8 bg-border/60" />}
              {section.node}
            </Fragment>
          ))}
        </div>
      </div>
    );
  }
);
