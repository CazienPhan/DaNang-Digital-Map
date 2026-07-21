import React from 'react';
import { ArrowLeft, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PoiHeaderProps {
  tagColor: string;
  categoryName?: string;
  poiType?: string;
  onClose?: () => void;
  /** When provided, renders a Back (←) button in the top-left corner */
  onBack?: () => void;
}

export const PoiHeader: React.FC<PoiHeaderProps> = React.memo(({
  tagColor: _tagColor,
  categoryName: _categoryName,
  poiType: _poiType,
  onClose,
  onBack,
}) => {
  return (
    <div className="shrink-0">
      {/* Nav row: back button (left) + close button (right) */}
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
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
            title="Đóng chi tiết"
          >
            <X size={18} />
          </Button>
        )}
      </div>

      {/* Category pill tag
      {(categoryName || poiType) && (
        <div className="px-4 pb-1">
          <span
            className="inline-flex items-center text-[0.68rem] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
            style={{
              color: tagColor,
              background: `${tagColor}18`,
              border: `1px solid ${tagColor}30`,
            }}
          >
            {categoryName || poiType}
          </span>
        </div> */}
      {/* )} */}
    </div>
  );
});
