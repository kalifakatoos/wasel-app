import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { zustandStorage } from './storage';
import type { CartItem, Product, PromoCode } from '@/types';

export interface SelectedOption {
  groupName: string;
  choiceName: string;
  extraPrice: number;
}

interface CartState {
  storeId: string | null;
  items: CartItem[];
  promo: PromoCode | null;

  addItem: (product: Product, quantity: number, options: SelectedOption[], note?: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clear: () => void;
  setPromo: (promo: PromoCode | null) => void;
}

function buildKey(productId: string, options: SelectedOption[], note?: string): string {
  const opts = options
    .map((o) => `${o.groupName}:${o.choiceName}`)
    .sort()
    .join('|');
  return `${productId}::${opts}::${note?.trim() ?? ''}`;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      storeId: null,
      items: [],
      promo: null,

      addItem: (product, quantity, options, note) => {
        const { storeId, items } = get();
        // لو المتجر مختلف، تبدأ سلة جديدة (الشاشة تتأكد من المستخدم قبل الوصول هنا)
        const base = storeId && storeId !== product.storeId ? [] : items;
        const key = buildKey(product.id, options, note);
        const unitPrice = product.price + options.reduce((sum, o) => sum + o.extraPrice, 0);
        const existing = base.find((i) => i.key === key);

        const nextItems = existing
          ? base.map((i) => (i.key === key ? { ...i, quantity: i.quantity + quantity } : i))
          : [
              ...base,
              {
                key,
                productId: product.id,
                storeId: product.storeId,
                name: product.name,
                emoji: product.emoji,
                unitPrice,
                quantity,
                selectedOptions: options,
                note: note?.trim() || undefined,
              },
            ];

        set({ storeId: product.storeId, items: nextItems, promo: base === items ? get().promo : null });
      },

      updateQuantity: (key, quantity) => {
        if (quantity <= 0) return get().removeItem(key);
        set((s) => ({ items: s.items.map((i) => (i.key === key ? { ...i, quantity } : i)) }));
      },

      removeItem: (key) =>
        set((s) => {
          const items = s.items.filter((i) => i.key !== key);
          return items.length === 0 ? { items, storeId: null, promo: null } : { items };
        }),

      clear: () => set({ items: [], storeId: null, promo: null }),
      setPromo: (promo) => set({ promo }),
    }),
    { name: 'wasel.cart', storage: zustandStorage }
  )
);

// ----------------------------- Selectors ------------------------------------

export const selectCartCount = (s: CartState) => s.items.reduce((n, i) => n + i.quantity, 0);
export const selectSubtotal = (s: CartState) => s.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

export function computeDiscount(promo: PromoCode | null, subtotal: number, deliveryFee: number) {
  if (!promo) return { discount: 0, deliveryDiscount: 0 };
  if (promo.minOrder && subtotal < promo.minOrder) return { discount: 0, deliveryDiscount: 0 };
  switch (promo.type) {
    case 'percent':
      return { discount: Math.min(Math.round(subtotal * promo.value) / 100, 10), deliveryDiscount: 0 };
    case 'fixed':
      return { discount: Math.min(promo.value, subtotal), deliveryDiscount: 0 };
    case 'free_delivery':
      return { discount: 0, deliveryDiscount: deliveryFee };
  }
}

export function computeTotals(items: CartItem[], deliveryFee: number, promo: PromoCode | null) {
  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const { discount, deliveryDiscount } = computeDiscount(promo, subtotal, deliveryFee);
  const effectiveDelivery = Math.max(0, deliveryFee - deliveryDiscount);
  const total = Math.max(0, subtotal - discount + effectiveDelivery);
  return { subtotal, deliveryFee: effectiveDelivery, discount: discount + deliveryDiscount, total };
}
