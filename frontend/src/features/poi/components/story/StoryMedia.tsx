import React from 'react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { cn } from '@/lib/utils';

interface StoryMediaProps {
  /** Image URL — always a real poi_media / products URL. */
  src: string;
  /** Alt text derived from actual data (caption, business or product name). */
  alt: string;
  /** Width / height of the frame, e.g. 16 / 9. */
  ratio: number;
  /** Tooltip text, normally the media caption when one exists. */
  title?: string;
  /** Frame radius. Large media use "xl", small thumbnails "lg". */
  radius?: 'lg' | 'large';
  /**
   * "cover" fills the frame (photos). "contain" shows the whole image on a
   * light surface — used for documents such as certificates, which must not be
   * cropped or distorted.
   */
  fit?: 'cover' | 'contain';
  className?: string;
}

/**
 * The single image primitive of the story tab.
 *
 * Every picture goes through it, so radius, cropping, background and the
 * fixed-frame behaviour are identical everywhere: source images of different
 * dimensions can never change a card's height or break the alignment grid.
 */
export const StoryMedia: React.FC<StoryMediaProps> = React.memo(
  ({ src, alt, ratio, title, radius = 'xl', fit = 'cover', className }) => (
    <AspectRatio
      ratio={ratio}
      className={cn(
        'w-full overflow-hidden bg-muted',
        radius === 'large' ? 'rounded-l' : 'rounded-lg',
        className
      )}
    >
      <img
        src={src}
        alt={alt}
        title={title}
        loading="lazy"
        className={cn(
          'absolute inset-0 h-full w-full',
          fit === 'cover' ? 'object-cover' : 'object-contain'
        )}
      />
    </AspectRatio>
  )
);
