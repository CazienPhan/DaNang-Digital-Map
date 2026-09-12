import React, { useEffect, useRef, useState } from 'react';
import { type StoryCertification } from '@/services/supabase/poiStory.service';
import { StorySection } from './StorySection';
import { StoryMedia } from './StoryMedia';
import { StoryGallery } from './StoryGallery';
import { CertificateLightbox } from './CertificateLightbox';

/**
 * Thumbnail frame size — NOT an independent constant. Every thumbnail is
 * `var(--story-frame)` square, the same custom property the Story Intro
 * image column reads (declared once in PoiStorySection), so the two are
 * pixel-identical at every container width with no JS measurement involved.
 */
const THUMB_FRAME_CLASS = 'w-[var(--story-frame)]';

/** Matches StoryGallery's own `gap-3` — the gap between thumbnails. */
const GALLERY_GAP_PX = 12;

/** Used only before the first thumbnail has been measured. */
const FALLBACK_STEP = 132 + GALLERY_GAP_PX;

interface StoryCertificationsSectionProps {
  /** certifications rows of this POI that carry a certificate_file_url. */
  certifications: StoryCertification[];
}

/**
 * Section 04 — Danh hiệu và chứng nhận.
 *
 * A light accent band holding a swipeable strip of the real certificate images.
 * Certificates are documents, so each thumbnail shows the whole image on a
 * white surface inside a fixed frame: consistent card sizes without cropping
 * away the content. Clicking one opens it full size.
 */
export const StoryCertificationsSection: React.FC<StoryCertificationsSectionProps> = React.memo(
  ({ certifications }) => {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [step, setStep] = useState(FALLBACK_STEP);
    const firstThumbRef = useRef<HTMLButtonElement>(null);

    // The frame is sized by `--story-frame` (see PoiStorySection), which
    // changes with the container's own width. Re-measure it so one arrow
    // click always moves exactly one thumbnail, at any width.
    useEffect(() => {
      const el = firstThumbRef.current;
      if (!el) return;

      const sync = () => setStep(el.getBoundingClientRect().width + GALLERY_GAP_PX);
      sync();

      const observer = new ResizeObserver(sync);
      observer.observe(el);
      return () => observer.disconnect();
    }, [certifications.length]);

    return (
      <StorySection
        title="Danh hiệu và chứng nhận"
        accent
        className=" !gap-5 rounded-xl border border-amber-200/70 bg-[#F5EFE3] p-3.5"
      >
        <StoryGallery
          prevLabel="Xem chứng nhận trước"
          nextLabel="Xem thêm chứng nhận"
          step={step}
        >
          {certifications.map((cert, i) => (
            <button
              key={cert.id}
              ref={i === 0 ? firstThumbRef : undefined}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={`shrink-0 snap-start rounded-xl p-0 transition-transform duration-200 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fd9401] ${THUMB_FRAME_CLASS}`}
              aria-label={cert.name ? `Xem chứng nhận: ${cert.name}` : 'Xem chứng nhận'}
              title={cert.name || undefined}
            >
              <StoryMedia
                src={cert.imageUrl}
                alt={cert.name || 'Chứng nhận'}
                ratio={1}
                radius="lg"
                fit="contain"
                className="bg-transparent"
              />
            </button>
          ))}
        </StoryGallery>

        <CertificateLightbox
          certifications={certifications}
          activeIndex={activeIndex}
          onClose={() => setActiveIndex(null)}
          onNavigate={setActiveIndex}
        />
      </StorySection>
    );
  }
);
