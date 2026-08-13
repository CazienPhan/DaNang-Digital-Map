import React, { useState, useEffect } from 'react';
import { Award, Star, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type ProductItem } from '@/services/supabase/product.service';

// Colors lifted from the approved mockup — keep in sync with it, not with
// the app's generic theme tokens.
const MAROON = '#7A0C0C';
const ORANGE = '#FFA700';
const CREAM = '#FFF8EB';
const CREAM_BORDER = '#E7D9BC';

interface ProductDetailPanelProps {
  /** The product to display. Panel is hidden (but stays mounted for the
   * closing animation) when null. */
  product: ProductItem | null;
  /** Called when the user dismisses the panel via its close button. */
  onClose: () => void;
  /**
   * Actual rendered width (px) of the POI Sheet the panel floats beside, on
   * desktop (>= sm breakpoint). Measured at runtime by the caller so the
   * panel stays flush against the Sheet's real edge regardless of its
   * responsive width classes. Falls back to 480px until measured.
   */
  anchorLeft?: number;
}

type Tab = 'info' | 'cert' | 'review';

const TABS: { key: Tab; label: string }[] = [
  { key: 'info', label: 'Thông tin' },
  { key: 'cert', label: 'Chứng nhận' },
  { key: 'review', label: 'Đánh giá' },
];

function TabIcon({ tab, active }: { tab: (typeof TABS)[number]; active: boolean }) {
  const circleStyle = active
    ? { background: MAROON }
    : { background: '#fff', border: `1.5px solid ${MAROON}` };

  const Icon = tab.key === 'cert' ? Award : tab.key === 'review' ? Star : null;

  return (
    <span className="flex h-10 w-10 items-center justify-center rounded-full shrink-0" style={circleStyle}>
      {Icon ? (
        <Icon size={18} strokeWidth={2.2} color={active ? '#fff' : MAROON} />
      ) : (
        <span
          className="text-[17px] font-black italic leading-none"
          style={{ color: active ? '#fff' : MAROON, fontFamily: 'Georgia, serif' }}
        >
          i
        </span>
      )}
    </span>
  );
}

function EmptyState({ icon: Icon, title, description }: { icon: typeof Award; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-10 text-center" style={{ color: `${MAROON}99` }}>
      <Icon size={26} strokeWidth={1.5} />
      <p className="text-[13px]">{title}</p>
      <p className="text-[11px]">{description}</p>
    </div>
  );
}

/**
 * Floating rounded card (desktop) / bottom sheet (mobile) showing the full
 * detail of a product selected from a POI's "Sản phẩm" tab. Rendered as a
 * sibling of the POI detail Sheet, floating beside it with a gap — never
 * covers it.
 */
export const ProductDetailPanel: React.FC<ProductDetailPanelProps> = ({ product, onClose, anchorLeft }) => {
  const [activeTab, setActiveTab] = useState<Tab>('info');
  const open = !!product;

  // Reset to the "Thông tin" tab whenever a new product is opened.
  useEffect(() => {
    if (product) setActiveTab('info');
  }, [product?.id]);

  // Keep rendering the last product while the panel animates closed.
  const [displayed, setDisplayed] = useState<ProductItem | null>(product);
  useEffect(() => {
    if (product) setDisplayed(product);
  }, [product]);

  if (!displayed) return null;

  return (
    <div
      style={{ ['--panel-left' as string]: `${(anchorLeft ?? 480) + 16}px` }}
      className={cn(
        'fixed z-40 flex flex-col bg-white shadow-xl transition-transform duration-300 ease-in-out',
        'inset-x-0 bottom-0 max-h-[75vh] rounded-t-3xl',
        'sm:inset-x-auto sm:left-[var(--panel-left)] sm:top-[70px] sm:bottom-15 sm:max-h-none sm:w-[380px] sm:rounded-[28px] sm:border sm:border-neutral-200',
        // Closed state flies fully off-screen with a large fixed offset — not
        // relative to the panel's own width — so it stays hidden even when
        // the POI Sheet it would otherwise hide behind has also closed.
        open ? 'translate-y-0 sm:translate-x-0' : 'translate-y-full sm:translate-y-0 sm:-translate-x-[2000px]'
      )}
      aria-hidden={!open}
    >
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden p-4">
        {/* Header: image — its own rounded card, layered above the name/price card */}
        <div className="relative z-10 pt-8 shrink-0">
          <button
            onClick={onClose}
            aria-label="Đóng"
            className="absolute -top-1.5 -right-1.5 flex h-8 w-8 items-center justify-center text-neutral-900 hover:opacity-60 transition-opacity"
          >
            <X size={20} strokeWidth={2.2} />
          </button>
          <div className="h-44 w-full rounded-[20px] bg-neutral-100 overflow-hidden">
            {displayed.img ? (
              <img src={displayed.img} alt={displayed.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-neutral-300">
                <span className="text-4xl">📦</span>
              </div>
            )}
          </div>
        </div>

        {/* Name + price — sits underneath the image, which overlaps into its
            squared-off top so only the image's rounded corners show there. */}
        <div
          className="relative z-0 -mt-6 flex items-center justify-between gap-3 rounded-b-2xl px-4 pt-10 pb-3 shrink-0"
          style={{
            background: CREAM,
            borderLeft: `1px solid ${CREAM_BORDER}`,
            borderRight: `1px solid ${CREAM_BORDER}`,
            borderBottom: `1px solid ${CREAM_BORDER}`,
          }}
        >
          <h2 className="text-[15px] font-extrabold tracking-tight leading-snug" style={{ color: MAROON }}>
            {displayed.name}
          </h2>
          {displayed.price && (
            <span className="text-[15px] font-extrabold whitespace-nowrap" style={{ color: MAROON }}>
              {displayed.price}
            </span>
          )}
        </div>

        {/* Tab bar — its own rounded card, layered above the content card */}
        <div
          className="relative z-10 mt-3 flex items-start justify-around px-3 pb-3 pt-4 rounded-[22px] shrink-0"
          style={{ background: ORANGE }}
        >
          {TABS.map((tab) => {
            const active = activeTab === tab.key;
            return (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} className="flex flex-col items-center gap-1.5">
                <TabIcon tab={tab} active={active} />
                <span className="text-[10px] font-extrabold uppercase tracking-tight" style={{ color: MAROON }}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Content — sits underneath the tab bar, which overlaps ~12px into its
            squared-off top so only the tab bar's rounded corners show there. */}
        <div
          className="relative z-0 -mt-6 flex-1 min-h-0 overflow-y-auto px-4 pt-10 pb-4 rounded-b-[22px] border border-neutral-200"
          style={{ background: CREAM }}
        >
          {activeTab === 'info' &&
            (displayed.detailSections.length > 0 ? (
              displayed.detailSections.map((section, i) => (
                <div key={i} className={i === 0 ? '' : 'mt-4'}>
                  <h3 className="mb-1.5 text-[13px] font-extrabold uppercase tracking-tight" style={{ color: MAROON }}>
                    {section.title}
                  </h3>
                  <p className="text-[13px] leading-snug text-neutral-800 whitespace-pre-line">{section.item}</p>
                </div>
              ))
            ) : (
              <EmptyState
                icon={Award}
                title="Chưa có thông tin chi tiết"
                description="Thông tin sản phẩm sẽ được cập nhật trong thời gian tới."
              />
            ))}

          {activeTab === 'cert' &&
            (displayed.certificateImageUrl ? (
              <img
                src={displayed.certificateImageUrl}
                alt={`Chứng nhận OCOP — ${displayed.name}`}
                className="w-full rounded-[16px] object-cover"
              />
            ) : (
              <EmptyState
                icon={Award}
                title="Chưa có chứng nhận OCOP đính kèm"
                description="Chứng nhận sẽ được cập nhật trong thời gian tới."
              />
            ))}

          {activeTab === 'review' && (
            <EmptyState icon={Star} title="Chưa có đánh giá nào" description="Hãy quay lại sau nhé." />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPanel;
