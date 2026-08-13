import React from 'react';
import { AlertCircle } from 'lucide-react';
import { useProductDetail } from '../../hooks/useProductDetail';
import { ProductDetailHeader } from './ProductDetailHeader';
import { ProductDetailBanner } from './ProductDetailBanner';
import { ProductDetailOverview } from './ProductDetailOverview';
import { ProductFindStoreButton } from './ProductFindStoreButton';
import { ProductDetailHistory } from './ProductDetailHistory';
import { ProductDetailProcess } from './ProductDetailProcess';
import { ProductDetailTips } from './ProductDetailTips';
import { ProductImageGallery } from './ProductImageGallery';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ProductDetailCardProps {
  productId: string | null;
  onClose: () => void;
  onBack?: () => void;
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

const ProductDetailSkeleton: React.FC = () => (
  <div className="flex flex-col flex-1 overflow-hidden h-full animate-pulse">
    <div className="shrink-0 h-[60px]" /> {/* header placeholder */}
    <div className="w-full h-48 bg-muted" />
    <div className="px-4 pt-4 space-y-3">
      <div className="h-6 w-2/3 bg-muted rounded" />
      <div className="h-20 bg-muted rounded-lg" />
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Error state
// ---------------------------------------------------------------------------

interface ProductDetailErrorProps {
  error: string | null;
  onClose: () => void;
  onBack?: () => void;
}

const ProductDetailError: React.FC<ProductDetailErrorProps> = ({ error, onClose, onBack }) => (
  <div className="flex-1 flex flex-col overflow-hidden h-full text-foreground">
    <div className="shrink-0">
      <ProductDetailHeader onClose={onClose} onBack={onBack} />
    </div>
    <div className="flex-1 flex flex-col items-center justify-center gap-3 px-4 text-center">
      <AlertCircle className="h-8 w-8 text-destructive/60" />
      <p className="text-sm font-medium text-foreground">Không thể tải thông tin sản phẩm</p>
      <p className="text-xs text-muted-foreground">{error ?? 'Đã có lỗi xảy ra.'}</p>
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

/**
 * ProductDetailCard — Top-level Product Info Detail container.
 *
 * Composes all seven sections in the specified order:
 *   1. Video Banner   (poi_media: media_category='banner', media_type='VIDEO')
 *   2. Product Name + Overview  (bg #720000, name #ffc14c, text white)
 *   3. Image Gallery  (poi_media: media_category='Quy trinh', media_type='Image')
 *   4. Find Store Button
 *   5. Lịch sử hình thành (header #720000, content #fff8eb)
 *   6. Quy trình            (header #720000, content #fff8eb)
 *   7. Công dụng            (header #720000, content #fff8eb)
 *
 * Data flows exclusively through useProductDetail → GET /api/products/:id → Supabase.
 * Meilisearch is never used here.
 *
 * Navigation:
 *   onBack  → returns to Product Listing (SearchBar handles view transition)
 *   onClose → clears all search state (SearchBar handles reset)
 */
export const ProductDetailCard: React.FC<ProductDetailCardProps> = ({
  productId,
  onClose,
  onBack,
}) => {
  const { data, loading, error } = useProductDetail(productId);

  // --- Loading ---
  if (loading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden h-full">
        <div className="shrink-0">
          <ProductDetailHeader onClose={onClose} onBack={onBack} />
        </div>
        <ProductDetailSkeleton />
      </div>
    );
  }

  // --- Error / Not Found ---
  if (error || !data) {
    return (
      <ProductDetailError
        error={error}
        onClose={onClose}
        onBack={onBack}
      />
    );
  }

  // --- Success: render all 6 sections ---
  return (
    <div className="flex-1 flex flex-col overflow-hidden h-full text-foreground">
      {/* Fixed header */}
      <div className="shrink-0">
        <ProductDetailHeader onClose={onClose} onBack={onBack} />
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto scrollbar-hidden">

        {/* Section 1 — Video Banner */}
        <ProductDetailBanner url={data.video_url} productName={data.name} />

        {/* Section 2 — Name + Overview (dark-red bg) */}
        <ProductDetailOverview name={data.name} overview={data.overview} />

        {/* Section 3 — Image Gallery (poi_media: media_category='Quy trinh', media_type='Image') */}
        <ProductImageGallery
          imageUrls={data.gallery_image_urls}
          productName={data.name}
        />

        {/* Section 4 — Find Store (UI-only) */}
        <ProductFindStoreButton />

        {/* Section 4 — Lịch sử hình thành */}
        {data.lich_su_hinh_thanh.length > 0 && (
          <ProductDetailHistory items={data.lich_su_hinh_thanh} />
        )}

        {/* Section 5 — Quy trình */}
        {data.process_image_url && (
          <ProductDetailProcess
            url={data.process_image_url}
            productName={data.name}
          />
        )}

        {/* Section 6 — Công dụng */}
        <ProductDetailTips cong_dung={data.cong_dung} />

        {/* Bottom padding */}
        <div className="h-6" />
      </div>
    </div>
  );
};

export default ProductDetailCard;
