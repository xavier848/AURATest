import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getProductById, type Product, type Variant } from '../data/products';
import { track } from './consent';
import { readJSON, writeJSON } from './storage';

export interface CartLine {
  productId: string;
  variantId: string;
  qty: number;
}

export interface ResolvedLine extends CartLine {
  product: Product;
  variant: Variant;
  totalCents: number;
}

interface CartContextValue {
  lines: ResolvedLine[];
  count: number;
  subtotalCents: number;
  add: (productId: string, variantId: string, qty?: number) => void;
  setQty: (productId: string, variantId: string, qty: number) => void;
  remove: (productId: string, variantId: string) => void;
  clear: () => void;
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
}

const KEY = 'aura.cart.v1';
export const MAX_QTY = 10;
// Beispielwerte für den Prototyp, vor dem Launch mit echten Versandkosten ersetzen.
export const SHIPPING_CENTS = 490;
export const FREE_SHIPPING_FROM_CENTS = 5000;

export function shippingFor(subtotalCents: number): number {
  return subtotalCents === 0 || subtotalCents >= FREE_SHIPPING_FROM_CENTS ? 0 : SHIPPING_CENTS;
}

function resolve(line: CartLine): ResolvedLine | null {
  const product = getProductById(line.productId);
  const variant = product?.variants.find((v) => v.id === line.variantId);
  if (!product || !variant) return null;
  return { ...line, product, variant, totalCents: variant.priceCents * line.qty };
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [raw, setRaw] = useState<CartLine[]>(() =>
    readJSON<CartLine[]>(KEY, []).filter((l) => resolve(l) !== null && l.qty > 0),
  );
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => writeJSON(KEY, raw), [raw]);

  const add = useCallback((productId: string, variantId: string, qty = 1) => {
    setRaw((prev) => {
      const existing = prev.find((l) => l.productId === productId && l.variantId === variantId);
      if (existing) {
        return prev.map((l) => (l === existing ? { ...l, qty: Math.min(MAX_QTY, l.qty + qty) } : l));
      }
      return [...prev, { productId, variantId, qty: Math.min(MAX_QTY, qty) }];
    });
    track('add_to_cart', { productId, variantId, qty });
    setDrawerOpen(true);
  }, []);

  const setQty = useCallback((productId: string, variantId: string, qty: number) => {
    setRaw((prev) =>
      prev
        .map((l) =>
          l.productId === productId && l.variantId === variantId ? { ...l, qty: Math.min(MAX_QTY, qty) } : l,
        )
        .filter((l) => l.qty > 0),
    );
  }, []);

  const remove = useCallback((productId: string, variantId: string) => {
    setRaw((prev) => prev.filter((l) => !(l.productId === productId && l.variantId === variantId)));
  }, []);

  const clear = useCallback(() => setRaw([]), []);
  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const value = useMemo(() => {
    const lines = raw.map(resolve).filter((l): l is ResolvedLine => l !== null);
    return {
      lines,
      count: lines.reduce((sum, l) => sum + l.qty, 0),
      subtotalCents: lines.reduce((sum, l) => sum + l.totalCents, 0),
      add,
      setQty,
      remove,
      clear,
      drawerOpen,
      openDrawer,
      closeDrawer,
    };
  }, [raw, add, setQty, remove, clear, drawerOpen, openDrawer, closeDrawer]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart außerhalb von CartProvider');
  return ctx;
}
