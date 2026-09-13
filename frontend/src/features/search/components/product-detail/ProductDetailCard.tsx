import React from 'react';
import { AlertCircle } from 'lucide-react';
import { useProductDetail } from '../../hooks/useProductDetail';
import { ProductDetailHeader } from './ProductDetailHeader';
import { ProductDetailBanner } from './ProductDetailBanner';
import { ProductDetailOverview } from './ProductDetailOverview';
import { ProductDetailAccordionPill } from './ProductDetailAccordionPill';
import { ProductHistorySection } from './ProductHistorySection';
import { ProductProcessSection } from './ProductProcessSection';
import { ProductCultureSection } from './ProductCultureSection';
import { ProductDetailDiscoverSection } from './ProductDetailDiscoverSection';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ProductDetailCardProps {
  productId: string | null;
  onClose: () => void;
  onBack?: () => void;
  /**
   * Called with the product's id + name when the user taps "Khám phá nhà
   * sản xuất". SearchBar handles switching to Place Search and populating
   * the listing with the real manufacturer POIs.
   */
  onDiscoverManufacturers?: (productId: string, productName: string) => void;
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
 * Composes sections in order:
 *   1. Header (back/close)
 *   2. Overview   (thumbnail + name + overview text, white bg)
 *   3. Banner image
 *   4. Pill 1 — Câu chuyện lịch sử (gallery + title + body), open by default
 *   5. Pill 2 — Quy trình sản xuất (image + title + body)
 *   6. Pill 3 — Văn hóa & truyền thống (image + body)
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
  onDiscoverManufacturers,
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

  // --- Success ---
  return (
    <div className="flex-1 flex flex-col overflow-hidden h-full text-foreground" style={{ backgroundColor: '#ffffff' }}>
      {/* Fixed header */}
      <div className="shrink-0">
        <ProductDetailHeader onClose={onClose} onBack={onBack} />
      </div>

      {/* Scrollable body — px-2.5 here is the single place controlling the
          tab's left/right content margin; all child sections rely on it. */}
      <div className="flex-1 overflow-y-auto scrollbar-hidden px-6" style={{ backgroundColor: '#ffffff' }}>

        {/* Overview — thumbnail + name + overview */}
        <ProductDetailOverview
          name={data.name}
          overview={data.overview}
          thumbnailUrl={data.thumbnail_url}
        />

        {/* Banner image */}
        <ProductDetailBanner url={data.banner_image_url} productName={data.name} />

        {/* Pill 1 — Câu chuyện lịch sử (open by default) */}
        <ProductDetailAccordionPill
          index={1}
          title="Câu chuyện lịch sử"
          defaultOpen
          className="mt-10"
        >
          <ProductHistorySection
            productName={data.name}
            galleryImageUrls={data.gallery_image_urls}
            title={data.cau_chuyen_lich_su_title}
            body={data.cau_chuyen_lich_su}
          />
        </ProductDetailAccordionPill>

        {/* Pill 2 — Quy trình sản xuất */}
        <ProductDetailAccordionPill index={2} title="Quy trình sản xuất">
          <ProductProcessSection
            productName={data.name}
            imageUrl={data.process_image_url}
            videoUrl={data.process_video_url}
            title={data.quy_trinh_sx_title}
            body={data.quy_trinh_sx}
          />
        </ProductDetailAccordionPill>

        {/* Pill 3 — Văn hóa & truyền thống */}
        <ProductDetailAccordionPill index={3} title="Văn hóa & truyền thống">
          <ProductCultureSection
            productName={data.name}
            imageUrl={data.van_hoa_image_url}
            body={data.van_hoa}
          />
        </ProductDetailAccordionPill>

        {/* Discover more — manufacturers / where-to-eat cards */}
        <ProductDetailDiscoverSection
          productName={data.name}
          onDiscoverManufacturers={
            onDiscoverManufacturers ? () => onDiscoverManufacturers(data.id, data.name) : undefined
          }
        />

        {/* Bottom padding */}
        <div className="h-6" />
      </div>
    </div>
  );
};

export default ProductDetailCard;
