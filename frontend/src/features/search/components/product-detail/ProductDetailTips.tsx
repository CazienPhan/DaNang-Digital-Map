import React, { useState } from 'react';

interface ProductDetailTipsProps {
  huong_dan_su_dung: string[];
  cong_dung: string[];
}

type TipsTab = 'usage' | 'use-cases';

/**
 * ProductDetailTips — Section 7.
 *
 * Two-tab section:
 *   Tab 1: "Hướng dẫn sử dụng"  ← huong_dan_su_dung array
 *   Tab 2: "Công dụng"           ← cong_dung array
 *
 * Content switches without leaving the page.
 * Never hardcodes list items — all content is dynamic from Supabase.
 */
export const ProductDetailTips: React.FC<ProductDetailTipsProps> = ({
  huong_dan_su_dung,
  cong_dung,
}) => {
  const [activeTab, setActiveTab] = useState<TipsTab>('usage');

  const hasUsage = huong_dan_su_dung.length > 0;
  const hasCongDung = cong_dung.length > 0;

  if (!hasUsage && !hasCongDung) return null;

  const activeItems: string[] = activeTab === 'usage' ? huong_dan_su_dung : cong_dung;

  return (
    <div className="px-6 py-6">
      <h2 className="text-sm font-bold uppercase tracking-normal text-muted-foreground mb-3">
        Tips
      </h2>

      {/* Tab row */}
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => setActiveTab('usage')}
          className={[
            'px-4 py-1.5 rounded-full text-xs font-medium tracking-normal transition-colors',
            activeTab === 'usage'
              ? 'bg-foreground text-background'
              : 'text-muted-foreground hover:bg-muted',
          ].join(' ')}
          aria-selected={activeTab === 'usage'}
          role="tab"
        >
          Hướng dẫn sử dụng
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('use-cases')}
          className={[
            'px-4 py-1.5 rounded-full text-xs font-medium tracking-normal transition-colors',
            activeTab === 'use-cases'
              ? 'bg-foreground text-background'
              : 'text-muted-foreground hover:bg-muted',
          ].join(' ')}
          aria-selected={activeTab === 'use-cases'}
          role="tab"
        >
          Công dụng
        </button>
      </div>

      {/* Content */}
      <ul className="list-disc list-outside pl-5 space-y-2" role="tabpanel">
        {activeItems.length > 0 ? (
          activeItems.map((item, index) => (
            <li
              key={index}
              className="text-xs text-foreground/80 leading-relaxed"
            >
              {item}
            </li>
          ))
        ) : (
          <li className="text-xs text-muted-foreground italic">
            Chưa có thông tin.
          </li>
        )}
      </ul>
    </div>
  );
};

export default ProductDetailTips;
