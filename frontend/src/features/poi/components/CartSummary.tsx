import React, { useState } from 'react';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { formatPrice } from '@/services/supabase/product.service';

interface CartSummaryProps {
  /**
   * Called when the user clicks the header X.
   * Must navigate back to the SAME STORE'S PRODUCT LIST — not to Overview.
   */
  onClose: () => void;
}

/**
 * CartSummary — dedicated cart/order-summary view.
 *
 * Structure:
 *   HEADER  — "Tóm tắt đơn hàng" + X (returns to store product list)
 *   CONTENT — scrollable cart items: image, name, price, quantity controls
 *   FOOTER  — dynamic total + "Đặt hàng ngay"
 *
 * Product removal flow:
 *   quantity > 1  → "-" decreases immediately
 *   quantity = 1  → "-" opens confirmation dialog; cart unchanged until confirmed
 *   "Tôi đồng ý"  → product removed from real cart state
 *   "Tôi không đồng ý" → dialog closes, product stays at quantity 1
 *
 * All data is from the shared useCart() context. Zero mock data.
 */
export const CartSummary: React.FC<CartSummaryProps> = ({ onClose }) => {
  const {
    items,
    totalItems,
    totalPriceFormatted,
    increaseQuantity,
    decreaseQuantity,
    removeItem,
  } = useCart();

  // The real product.id of the item pending confirmation removal.
  // null = no confirmation dialog open.
  const [pendingRemovalId, setPendingRemovalId] = useState<string | null>(null);

  const isEmpty = items.length === 0;

  // ── Quantity decrease handler ───────────────────────────────────────────────
  const handleDecrease = (productId: string, currentQuantity: number) => {
    if (currentQuantity > 1) {
      // Safe to decrement immediately.
      decreaseQuantity(productId);
    } else {
      // quantity = 1 → ask for confirmation before removing.
      // Cart state is NOT modified here.
      setPendingRemovalId(productId);
    }
  };

  // ── Confirmation dialog handlers ───────────────────────────────────────────
  const handleConfirmRemoval = () => {
    if (pendingRemovalId != null) {
      removeItem(pendingRemovalId); // Acts on real cart state.
    }
    setPendingRemovalId(null);
  };

  const handleCancelRemoval = () => {
    // Keep product; keep quantity = 1; close dialog.
    setPendingRemovalId(null);
  };

  // ── Order button ───────────────────────────────────────────────────────────
  const handlePlaceOrder = () => {
    // No order/checkout architecture currently exists in this codebase.
    // This is a UI entry-point only — it does NOT fabricate a fake order.
    // When a real checkout flow is implemented, wire this handler to it.
    console.warn(
      '[CartSummary] Order flow not yet implemented. ' +
      `Cart contains ${totalItems} item(s). ` +
      'Connect this handler to the real checkout/order service when available.'
    );
  };

  // ── Pending product name (for dialog accessibility) ────────────────────────
  const pendingProduct = pendingRemovalId != null
    ? items.find((ci) => ci.product.id === pendingRemovalId)?.product
    : null;

  return (
    <div className="flex flex-col h-full bg-background text-foreground relative">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div
        className="shrink-0 flex items-center justify-between px-6 py-2"
        style={{ backgroundColor: '#fd9401' }}
      >
        <h2
          id="cart-summary-title"
          className="text-base font-bold text-white tracking-normal"
        >
          Tóm tắt đơn hàng
        </h2>
        {/*
          X in the header → return to SAME STORE's PRODUCT LIST.
          Does NOT delete products. Does NOT reset cart.
        */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8 text-white hover:bg-white/20 hover:text-white rounded-full"
          aria-label="Quay lại danh sách sản phẩm"
          title="Quay lại danh sách sản phẩm"
        >
          <X size={17} />
        </Button>
      </div>

      {/* ── Scrollable Content ───────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        {isEmpty ? (
          /* ── Empty state ──────────────────────────────────────────────────── */
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
              <ShoppingBag size={24} className="text-muted-foreground/40" />
            </div>
            <p className="text-sm font-semibold text-foreground mb-1">
              Giỏ hàng của bạn đang trống
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Quay lại danh sách sản phẩm để thêm vào giỏ.
            </p>
          </div>
        ) : (
          /* ── Cart items ───────────────────────────────────────────────────── */
          <div className="px-6 pt-4 pb-3">
            {/* <p className="text-sm font-bold text-muted-foreground tracking-normal mb-3">
              Thông tin sản phẩm
            </p> */}

            <div className="flex flex-col">
              {items.map((ci, idx) => {
                const unitPriceFormatted =
                  ci.product.priceNumeric != null
                    ? formatPrice(ci.product.priceNumeric, ci.product.priceNumeric)
                    : ci.product.price;

                const isLast = idx === items.length - 1;

                return (
                  <div key={ci.product.id}>
                    <div className="flex gap-3 py-3.5">
                      {/* Product image */}
                      <div className="w-[80px] h-[80px] border-1 shrink-0 rounded-xl overflow-hidden bg-muted">
                        {ci.product.img ? (
                          <img
                            src={ci.product.img}
                            alt={ci.product.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                              const t = e.currentTarget as HTMLImageElement;
                              t.style.display = 'none';
                              const fb = t.nextElementSibling as HTMLElement | null;
                              if (fb) fb.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        {/* Fallback icon when image is missing or fails to load */}
                        <div
                          className="w-full h-full items-center justify-center text-muted-foreground/30"
                          style={{ display: ci.product.img ? 'none' : 'flex' }}
                        >
                          <ShoppingBag size={20} />
                        </div>
                      </div>

                      {/* Product info + quantity controls */}
                      <div className="flex-1 min-w-0 flex flex-col gap-1">
                        {/* Name */}
                        <p className="text-sm font-semibold text-foreground leading-snug line-clamp-2">
                          {ci.product.name}
                        </p>

                        {/* Price + Quantity on the same row */}
                        <div className="flex items-center justify-between gap-3 mt-1">
                          {/* Price — left */}
                          {unitPriceFormatted ? (
                            <p className="text-sm font-bold text-[#fd9401] shrink-0">
                              {unitPriceFormatted}
                            </p>
                          ) : (
                            <span />
                          )}

                          {/* Quantity controls — right, never compressed */}
                          <div className="flex items-center gap-2 shrink-0">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleDecrease(ci.product.id, ci.quantity)}
                              className="h-7 w-7 rounded-full border-border/70 hover:border-[#fd9401] hover:text-[#fd9401] transition-colors"
                              aria-label={
                                ci.quantity === 1
                                  ? `Xóa ${ci.product.name} khỏi giỏ hàng`
                                  : `Giảm số lượng ${ci.product.name}`
                              }
                              title={ci.quantity === 1 ? 'Xóa sản phẩm' : 'Giảm số lượng'}
                            >
                              <Minus size={12} />
                            </Button>

                            <span className="text-xs font-bold text-foreground min-w-[1.5rem] text-center tabular-nums">
                              {ci.quantity}
                            </span>

                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => increaseQuantity(ci.product.id)}
                              className="h-7 w-7 rounded-full border-border/70 hover:border-[#fd9401] hover:text-[#fd9401] transition-colors"
                              aria-label={`Tăng số lượng ${ci.product.name}`}
                              title="Tăng số lượng"
                            >
                              <Plus size={12} />
                            </Button>
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Divider between items — not after the last one */}
                    {!isLast && (
                      <div className="h-px bg-border/40" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <div className="shrink-0 border-t border-border/50 px-4 py-4">
        {/* Total row */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-normal text-foreground">Tổng cộng</span>
          <span className="text-base font-bold text-foreground tabular-nums">
            {totalPriceFormatted ?? (isEmpty ? '—' : 'Liên hệ')}
          </span>
        </div>

        {/* Place order button */}
        <Button
          onClick={handlePlaceOrder}
          disabled={isEmpty}
          className="w-full font-semibold h-10 text-sm rounded-xl"
          style={isEmpty ? undefined : { backgroundColor: '#fd9401' }}
          aria-label="Đặt hàng ngay"
        >
          Đặt hàng ngay
        </Button>
      </div>

      {/* ── Confirmation Dialog Overlay ─────────────────────────────────────── */}
      {pendingRemovalId != null && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="removal-dialog-title"
        >
          <div
            className="relative bg-background rounded-2xl shadow-xl mx-5 w-full max-w-[300px] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal close (cancel) button — top-right */}
            <button
              onClick={handleCancelRemoval}
              className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full text-muted-foreground hover:bg-muted transition-colors"
              aria-label="Đóng hộp thoại xác nhận"
              title="Đóng"
            >
              <X size={15} />
            </button>

            {/* Modal body */}
            <div className="px-6 pt-8 pb-6 text-center">
              {/* Icon */}
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                <ShoppingBag size={22} className="text-red-400" />
              </div>

              {/* Heading */}
              <p
                id="removal-dialog-title"
                className="text-sm font-bold text-foreground leading-snug mb-2"
              >
                Xóa sản phẩm
              </p>

              {/* Message */}
              <p className="text-xs text-muted-foreground leading-relaxed mb-6">
                {pendingProduct
                  ? `Bạn có chắc chắn muốn xóa "${pendingProduct.name}" khỏi giỏ hàng không?`
                  : 'Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng không?'}
              </p>

              {/* Actions */}
              <div className="flex gap-2">
                {/* Cancel */}
                <Button
                  variant="outline"
                  onClick={handleCancelRemoval}
                  className="flex-1 h-9 text-xs font-semibold rounded-xl border-border/60"
                  aria-label="Giữ lại sản phẩm"
                >
                  Tôi không đồng ý
                </Button>

                {/* Confirm removal */}
                <Button
                  onClick={handleConfirmRemoval}
                  className="flex-1 h-9 text-xs font-semibold rounded-xl bg-red-500 hover:bg-red-600 text-white"
                  aria-label={`Xác nhận xóa${pendingProduct ? ` ${pendingProduct.name}` : ''} khỏi giỏ hàng`}
                >
                  Tôi đồng ý
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartSummary;
