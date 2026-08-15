import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { type ProductItem, formatPrice } from '@/services/supabase/product.service';

// ─── Cart item ────────────────────────────────────────────────────────────────

/** A single cart line. Identity = product.id. Quantity ≥ 1. */
export interface CartItem {
  /** The real ProductItem added by the user. */
  product: ProductItem;
  /** Current quantity (always ≥ 1 while the item is in the cart). */
  quantity: number;
}

// ─── Context value ────────────────────────────────────────────────────────────

interface CartContextValue {
  /** All cart items, keyed internally by product.id. */
  items: CartItem[];

  /** Total number of product *units* in the cart (sum of all quantities). */
  totalItems: number;

  /** Total price as a raw number (sum of priceNumeric × quantity). null when
   *  no item in the cart has a known price. */
  totalPriceNumeric: number | null;

  /** Formatted total price string for display. null when totalPriceNumeric is null. */
  totalPriceFormatted: string | null;

  /** Add a product to the cart. If it already exists, increment quantity. */
  addItem: (product: ProductItem) => void;

  /** Remove a product entirely from the cart by its real product ID. */
  removeItem: (productId: string) => void;

  /** Increase the quantity of an existing cart item by one. */
  increaseQuantity: (productId: string) => void;

  /** Decrease the quantity of an existing cart item by one.
   *  If quantity would reach 0, the item is removed from the cart. */
  decreaseQuantity: (productId: string) => void;

  /** Remove all items from the cart. */
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  // ── Mutations ──────────────────────────────────────────────────────────────

  const addItem = useCallback((product: ProductItem) => {
    setItems((prev) => {
      const idx = prev.findIndex((ci) => ci.product.id === product.id);
      if (idx >= 0) {
        // Product already in cart — increment quantity.
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
        return next;
      }
      // New product — add with quantity 1.
      return [...prev, { product, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((ci) => ci.product.id !== productId));
  }, []);

  const increaseQuantity = useCallback((productId: string) => {
    setItems((prev) =>
      prev.map((ci) =>
        ci.product.id === productId ? { ...ci, quantity: ci.quantity + 1 } : ci
      )
    );
  }, []);

  const decreaseQuantity = useCallback((productId: string) => {
    setItems((prev) => {
      const result: CartItem[] = [];
      for (const ci of prev) {
        if (ci.product.id === productId) {
          if (ci.quantity > 1) {
            result.push({ ...ci, quantity: ci.quantity - 1 });
          }
          // quantity === 1 → item is removed (not pushed).
        } else {
          result.push(ci);
        }
      }
      return result;
    });
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  // ── Derived ────────────────────────────────────────────────────────────────

  const totalItems = useMemo(
    () => items.reduce((sum, ci) => sum + ci.quantity, 0),
    [items]
  );

  const totalPriceNumeric = useMemo(() => {
    let total = 0;
    let hasAny = false;
    for (const ci of items) {
      if (ci.product.priceNumeric != null) {
        total += ci.product.priceNumeric * ci.quantity;
        hasAny = true;
      }
    }
    return hasAny ? total : null;
  }, [items]);

  const totalPriceFormatted = useMemo(
    () => (totalPriceNumeric != null ? formatPrice(totalPriceNumeric, totalPriceNumeric) : null),
    [totalPriceNumeric]
  );

  // ── Value ──────────────────────────────────────────────────────────────────

  const value: CartContextValue = useMemo(
    () => ({
      items,
      totalItems,
      totalPriceNumeric,
      totalPriceFormatted,
      addItem,
      removeItem,
      increaseQuantity,
      decreaseQuantity,
      clearCart,
    }),
    [items, totalItems, totalPriceNumeric, totalPriceFormatted, addItem, removeItem, increaseQuantity, decreaseQuantity, clearCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Access the shared cart state from any component inside `<CartProvider>`.
 * Throws if used outside the provider — this is intentional so missing
 * providers are caught during development, not silently ignored.
 */
export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error(
      '[useCart] Must be used inside <CartProvider>. ' +
      'Wrap your application root with <CartProvider> in App.tsx or main.tsx.'
    );
  }
  return ctx;
}
