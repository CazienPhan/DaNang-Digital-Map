import React from 'react';
import { ArrowLeft, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProductDetailHeaderProps {
  onClose: () => void;
  onBack?: () => void;
}

/**
 * ProductDetailHeader — Navigation row for Product Info Detail.
 *
 * Layout: [Back Button (left)] ... [Close Button (right)]
 * Mirrors PoiHeader layout exactly.
 */
export const ProductDetailHeader: React.FC<ProductDetailHeaderProps> = React.memo(({
  onClose,
  onBack,
}) => {
  return (
    <div className="shrink-0">
      <div className="flex items-center justify-between px-2 pt-0 pb-2">
        {/* Left slot — Back button or spacer */}
        {onBack ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
            aria-label="Back to search results"
            title="Quay lại kết quả tìm kiếm"
          >
            <ArrowLeft size={18} />
          </Button>
        ) : (
          <div className="h-8 w-8" aria-hidden="true" />
        )}

        {/* Right slot — Close button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
          title="Đóng chi tiết sản phẩm"
          aria-label="Close product detail"
        >
          <X size={18} />
        </Button>
      </div>
    </div>
  );
});

ProductDetailHeader.displayName = 'ProductDetailHeader';
export default ProductDetailHeader;
