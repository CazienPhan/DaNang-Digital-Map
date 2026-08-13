import React from 'react';
import { Store, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * ProductFindStoreButton — Section 3.
 *
 * UI-only component. No business logic, no click handler.
 * Store search will be implemented in a future phase.
 */
export const ProductFindStoreButton: React.FC = () => {
  return (
    <div className="px-4 py-2 flex justify-center mt-8 mb-8">
      <Button
        size={"sm"}
        variant="outline"
        className="border-1 w-fit flex items-center justify-between gap-2 px-4 rounded-xl border-primary"
        aria-label="Find stores selling this product (coming soon)"
        disabled
      >
        <div className="flex items-center gap-2 text-black">
          <Store size={18} className="shrink-0" />
          <span className="text-xs font-medium !text-black">Tìm cửa hàng</span>
        </div>
        <ChevronRight size={16} className="text-black" />
      </Button>
    </div>
  );
};

export default ProductFindStoreButton;
