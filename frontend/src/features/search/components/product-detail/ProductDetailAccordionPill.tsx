import React from 'react';
import { ChevronDown } from 'lucide-react';
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/components/ui/collapsible';

interface ProductDetailAccordionPillProps {
  index: number;
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

/**
 * ProductDetailAccordionPill — one "viên thuốc" section: a standalone
 * capsule-shaped header (numbered title + chevron, cream #fff8eb, bordered)
 * that always keeps its pill shape whether open or closed, followed by a
 * separate white content box with no fill/border. Each pill toggles
 * independently — multiple pills may be open at the same time.
 */
export const ProductDetailAccordionPill: React.FC<ProductDetailAccordionPillProps> = ({
  index,
  title,
  defaultOpen = false,
  children,
}) => {
  return (
    <Collapsible defaultOpen={defaultOpen} className="mt-4">
      <CollapsibleTrigger
        className="group flex w-full items-center justify-between rounded-full border-2 border-foreground px-6 py-3 text-left font-bold text-foreground"
        style={{ backgroundColor: '#fff8eb' }}
      >
        <span className="text-sm uppercase">
          {String(index).padStart(2, '0')}. {title}
        </span>
        <ChevronDown
          size={18}
          className="shrink-0 transition-transform duration-250 group-data-[panel-open]:rotate-180"
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="bg-white px-2">
        <div className="pb-4 pt-3">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default ProductDetailAccordionPill;
