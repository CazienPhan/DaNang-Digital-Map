import React, { useRef } from 'react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Separator } from '@/components/ui/separator';
import {
  type StoryMediaItem,
  type StoryProcessStep,
} from '@/services/supabase/poiStory.service';
import { StorySection } from './StorySection';

interface StoryProcessSectionProps {
  /**
   * The poi_media VIDEO row with media_category = 'process_story'.
   * null hides the video area completely — the steps still render.
   */
  video: StoryMediaItem | null;
  /** poi_story.quy_trinh_steps, already ordered by step_number ASC. */
  steps: StoryProcessStep[];
}

/**
 * Section 05 — Quy trình sản xuất.
 *
 * Full-width video above the production steps. The video keeps a fixed 16:9
 * frame so every business gets the same proportions, and the step rows share
 * one padding, radius and number column so different description lengths only
 * change a row's height, never its alignment.
 *
 * Playback behaviour is unchanged: pointer-in plays, pointer-out pauses, and
 * the native controls stay available.
 */
export const StoryProcessSection: React.FC<StoryProcessSectionProps> = React.memo(
  ({ video, steps }) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    const handleMouseEnter = () => {
      // Muted playback: browsers reject unmuted autoplay without a click, and a
      // rejected promise here must not surface as an unhandled rejection.
      videoRef.current?.play().catch(() => undefined);
    };

    const handleMouseLeave = () => {
      videoRef.current?.pause();
    };

    return (
      <StorySection title="Quy trình sản xuất">
        {video && (
          <AspectRatio ratio={16 / 9} className="w-full overflow-hidden bg-black">
            <video
              ref={videoRef}
              src={video.url}
              controls
              muted
              playsInline
              preload="metadata"
              className="absolute inset-0 h-full w-full object-cover"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            />
          </AspectRatio>
        )}

        {steps.length > 0 && (
          <ol className="flex flex-col gap-2">
            {steps.map((step) => (
              <li
                key={step.stepNumber}
                className="flex items-center gap-3 rounded-xl border border-border/60 bg-card px-3 py-2.5"
              >
                <span className="w-6 shrink-0 text-center text-base font-bold leading-none text-[#fd9401]">
                  {String(step.stepNumber).padStart(2, '0')}
                </span>
                <Separator orientation="vertical" className="h-auto self-stretch bg-border/70" />
                <p className="min-w-0 flex-1 text-[11px] leading-normal text-left">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        )}
      </StorySection>
    );
  }
);
