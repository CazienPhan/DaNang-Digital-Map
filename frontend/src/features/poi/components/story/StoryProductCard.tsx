import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { type StoryProductItem } from '@/services/supabase/poiStory.service';
import { StoryMedia } from './StoryMedia';

/** Fixed image column — every card keeps the same picture size and card height. */
const IMAGE_WIDTH_CLASS = 'w-[140px]';

interface StoryProductCardProps {
  item: StoryProductItem;
  /** Opens the existing Product Detail flow for this product. */
  onLearnMore: (item: StoryProductItem) => void;
}

/**
 * One highlighted product: fixed square image on the left, then label, name,
 * short story and the call to action on the right. The image column has a fixed
 * width and ratio, so products whose source images differ in size can never
 * change the card's proportions.
 */
export const StoryProductCard: React.FC<StoryProductCardProps> = React.memo(
  ({ item, onLearnMore }) => (
    <Card size="sm" className="flex-row items-start gap-6 border-0 ring-0">
      <div className={`${IMAGE_WIDTH_CLASS} shrink-0`}>
        {item.img ? (
          <StoryMedia src={item.img} alt={item.name} ratio={1} radius="lg" />
        ) : (
          <div className="aspect-square w-full rounded-lg bg-muted" aria-hidden="true" />
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        {item.productLabel && (
          <p className="text-[10px] font-semibold leading-none tracking-normal text-[#00793f]">
            {item.productLabel}
          </p>
        )}

        <h4 className="text-xs font-bold uppercase leading-normal text-foreground">
          {item.name}
        </h4>

        {item.storyContent && (
          <p className="line-clamp-3 text-[11px] leading-normal text-muted-foreground">
            {item.storyContent}
          </p>
        )}

        <Button
          id={`story-product-detail-${item.id}`}
          variant="outline"
          size="sm"
          onClick={() => onLearnMore(item)}
          className="mt-1 h-7 self-start rounded-full border-[#fd9401]/70 px-3 text-[11px] font-semibold text-[#fd9401] hover:bg-[#fd9401] hover:text-white"
          aria-label={`Tìm hiểu thêm về ${item.name}`}
          title={`Tìm hiểu thêm về ${item.name}`}
        >
          Tìm hiểu thêm
          <ChevronRight className="size-3.5" />
        </Button>
      </div>
    </Card>
  )
);
