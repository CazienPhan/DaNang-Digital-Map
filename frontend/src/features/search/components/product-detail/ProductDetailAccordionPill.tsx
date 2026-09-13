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
  className?: string;
}

export const ProductDetailAccordionPill: React.FC<ProductDetailAccordionPillProps> = ({
  index,
  title,
  defaultOpen = false,
  children,
  className = '',
}) => {
  return (
    <Collapsible
      defaultOpen={defaultOpen}
      className={`mt-3 ${className}`}
    >
      <CollapsibleTrigger
        className="group flex w-full items-center justify-between rounded-full border-1 border-foreground px-6 py-2 text-left font-bold text-foreground"
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

      <CollapsibleContent className="bg-white">
        <div className="pb-4 pt-3">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default ProductDetailAccordionPill;