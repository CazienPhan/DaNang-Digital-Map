import React from 'react';
import { Navigation2, ShoppingBag, CalendarCheck, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type POIDetailData } from '@/services/supabase/poi.service';

interface PoiActionsProps {
  onGetDirections?: () => void;
  /** Full POI detail data — used by the Chia sẻ and Giỏ hàng actions. */
  poi?: POIDetailData | null;
  /** Optional callback when user opens the cart. Falls back to console.warn
   * when no cart architecture is available yet. */
  onOpenCart?: () => void;
  /** Optional callback when user taps "Đăng ký trải nghiệm". Falls back to
   * console.warn when no registration architecture is available yet. */
  onRegisterExperience?: () => void;
  /** Total number of product units currently in the cart. Drives the badge.
   *  When 0 or undefined, no badge is shown. */
  cartItemCount?: number;
}

export const PoiActions: React.FC<PoiActionsProps> = React.memo(({
  onGetDirections,
  poi,
  onOpenCart,
  onRegisterExperience,
  cartItemCount = 0,
}) => {
  if (!onGetDirections) return null;

  // ── Chia sẻ ──────────────────────────────────────────────────────────────
  const handleShare = async () => {
    const title = poi?.name ?? 'Địa điểm';
    const text = poi?.dia_chi ? `${poi.name} — ${poi.dia_chi}` : poi?.name ?? 'Địa điểm';
    // Use the canonical POI permalink if the app ever exposes a public URL;
    // for now derive a share URL from the current browser location + poi id.
    const url = poi?.id
      ? `${window.location.origin}${window.location.pathname}?poi=${encodeURIComponent(poi.id)}`
      : window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch (err) {
        // User cancelled the share sheet — not an error.
        if ((err as DOMException)?.name !== 'AbortError') {
          console.error('[PoiActions] Share failed:', err);
        }
      }
    } else {
      // Fallback: copy URL to clipboard.
      try {
        await navigator.clipboard.writeText(url);
        // A toast/notification system does not currently exist in this codebase.
        // The fallback is silent — callers may surface this via a toast if/when
        // a notification system is added.
        console.info('[PoiActions] URL copied to clipboard:', url);
      } catch {
        console.warn('[PoiActions] Clipboard write failed.');
      }
    }
  };

  // ── Giỏ hàng ─────────────────────────────────────────────────────────────
  const handleOpenCart = () => {
    if (onOpenCart) {
      onOpenCart();
    } else {
      console.warn(
        '[PoiActions] Cart system not yet implemented. ' +
        'Wire onOpenCart to a CartContext or CartDrawer when available.'
      );
    }
  };

  // ── Đăng ký trải nghiệm ──────────────────────────────────────────────────
  const handleRegisterExperience = () => {
    if (onRegisterExperience) {
      onRegisterExperience();
    } else {
      console.warn(
        '[PoiActions] Experience registration not yet implemented. ' +
        'Wire onRegisterExperience to the real registration flow when available.'
      );
    }
  };

  return (
    <div
      className="px-4 py-3 border-t"
      style={{ borderColor: '#fd9401' }}
    >
      <div className="flex items-center gap-2">
        {/* ── PRIMARY: Chỉ đường ─────────────────────────────────────────── */}
        <Button
          id="poi-action-directions"
          onClick={onGetDirections}
          className="flex-1 gap-2 font-semibold text-sm h-9"
          style={{ backgroundColor: '#fd9401' }}
          aria-label="Chỉ đường"
          title="Chỉ đường"
        >
          <Navigation2 size={15} />
          Chỉ đường
        </Button>

        {/* ── SECONDARY: Giỏ hàng (with badge) ──────────────────────────── */}
        <div className="relative shrink-0">
          <Button
            id="poi-action-cart"
            variant="outline"
            size="icon"
            onClick={handleOpenCart}
            className="h-9 w-9 border-1 border-black/50 hover:border-[#fd9401] hover:text-[#fd9401] transition-colors"
            aria-label="Giỏ hàng"
            title="Giỏ hàng"
          >
            <ShoppingBag size={16} />
          </Button>
          {/* Cart badge — only shown when cart has items */}
          {cartItemCount > 0 && (
            <span
              className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold leading-none text-white pointer-events-none"
              style={{ backgroundColor: '#e11d48' }}
              aria-label={`${cartItemCount} sản phẩm trong giỏ hàng`}
            >
              {cartItemCount > 99 ? '99+' : cartItemCount}
            </span>
          )}
        </div>

        {/* ── SECONDARY: Đăng ký trải nghiệm ────────────────────────────── */}
        <Button
          id="poi-action-experience"
          variant="outline"
          size="icon"
          onClick={handleRegisterExperience}
          className="h-9 w-9 shrink-0 border-1 border-black/50 hover:border-[#fd9401] hover:text-[#fd9401] transition-colors"
          aria-label="Đăng ký trải nghiệm"
          title="Đăng ký trải nghiệm"
        >
          <CalendarCheck size={16} />
        </Button>

        {/* ── SECONDARY: Chia sẻ ─────────────────────────────────────────── */}
        <Button
          id="poi-action-share"
          variant="outline"
          size="icon"
          onClick={handleShare}
          className="h-9 w-9 shrink-0 border-1 border-black/50 hover:border-[#fd9401] hover:text-[#fd9401] transition-colors"
          aria-label="Chia sẻ"
          title="Chia sẻ"
        >
          <Share2 size={16} />
        </Button>
      </div>
    </div>
  );
});
