import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PoiHeaderProps {
  tagColor: string;
  categoryName?: string;
  poiType?: string;
  onClose?: () => void;
}

export const PoiHeader: React.FC<PoiHeaderProps> = React.memo(({ tagColor, categoryName, poiType, onClose }) => {
  return (
    <div className="shrink-0">
      {/* Nav row: close button aligned to the right */}
      <div className="flex items-center justify-end px-2 pt-0 pb-2">
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
