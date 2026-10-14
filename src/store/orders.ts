import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { computeTotals } from './cart';
import { zustandStorage } from './storage';
import { pickRandomDriver } from '@/data/misc';
import { isMockMode, placeOrderRemote, type PlaceOrderPayload } from '@/services/api';
import type { Order, OrderStatus, PromoCode, Store } from '@/types';
import { shortOrderNumber, uid } from '@/utils/format';

const SIMULATE = (process.env.EXPO_PUBLIC_SIMULATE_ORDERS ?? 'true') !== 'false';

/** الحالات النشطة (الطلب ما زال جارياً) */
export const ACTIVE_STATUSES: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'on_the_way'];

/** تسلسل الحالات مع الزمن (بالثواني) بعد إنشاء الطلب — للمحاكاة فقط */
const SIMULATION_STEPS: { status: OrderStatus; afterSec: number }[] = [
  { status: 'confirmed', afterSec: 12 },
  { status: 'preparing', afterSec: 30 },
  { status: 'on_the_way', afterSec: 60 },
  { status: 'delivered', afterSec: 110 },
];

interface OrdersState {
  orders: Order[];
  isPlacing: boolean;

  placeOrder: (payload: PlaceOrderPayload, store: Store, promo: PromoCode | null) => Promise<Order>;
  setStatus: (orderId: string, status: OrderStatus) => void;
  cancelOrder: (orderId: string) => boolean;
  rateOrder: (orderId: string, rating: number) => void;
  resumeSimulations: () => void;
}

const timers = new Map<string, ReturnType<typeof setTimeout>[]>();

function clearTimers(orderId: string) {
  timers.get(orderId)?.forEach(clearTimeout);
  timers.delete(orderId);
}

export const useOrdersStore = create<OrdersState>()(
  persist(
    (set, get) => {
      /** جدولة تقدّم الطلب تلقائياً (وضع العرض بدون باك إند) */
      const schedule = (order: Order) => {
        if (!SIMULATE) return;
        clearTimers(order.id);
        const createdMs = new Date(order.createdAt).getTime();
        const elapsedSec = (Date.now() - createdMs) / 1000;
        const list: ReturnType<typeof setTimeout>[] = [];

        for (const step of SIMULATION_STEPS) {
          const remaining = Math.max(0.5, step.afterSec - elapsedSec);
          const timer = setTimeout(() => {
            const current = get().orders.find((o) => o.id === order.id);
            if (!current || current.status === 'cancelled' || current.status === 'delivered') return;
            get().setStatus(order.id, step.status);
          }, remaining * 1000);
          list.push(timer);
        }
        timers.set(order.id, list);
      };

      return {
        orders: [],
        isPlacing: false,

        placeOrder: async (payload, store, promo) => {
          set({ isPlacing: true });
          try {
            let order: Order;
            if (isMockMode) {
              const totals = computeTotals(payload.items, store.deliveryFee, promo);
              const now = new Date().toISOString();
              order = {
                id: uid('ord-'),
                number: shortOrderNumber(),
                storeId: store.id,
                storeName: store.name,
                storeEmoji: store.emoji,
                items: payload.items,
                address: payload.address,
                paymentMethod: payload.paymentMethod,
                subtotal: totals.subtotal,
                deliveryFee: totals.deliveryFee,
                discount: totals.discount,
                total: totals.total,
                status: 'pending',
                timeline: [{ status: 'pending', at: now }],
                createdAt: now,
                estimatedMinutes: store.deliveryTimeMax,
                note: payload.note,
              };
              // محاكاة زمن الشبكة
              await new Promise((r) => setTimeout(r, 900));
            } else {
              order = await placeOrderRemote(payload);
            }
            set((s) => ({ orders: [order, ...s.orders] }));
            schedule(order);
            return order;
          } finally {
            set({ isPlacing: false });
          }
        },

        setStatus: (orderId, status) =>
          set((s) => ({
            orders: s.orders.map((o) => {
              if (o.id !== orderId || o.status === status) return o;
              const driver = status === 'on_the_way' && !o.driver ? pickRandomDriver() : o.driver;
              return {
                ...o,
                status,
                driver,
                timeline: [...o.timeline, { status, at: new Date().toISOString() }],
              };
            }),
          })),

        cancelOrder: (orderId) => {
          const order = get().orders.find((o) => o.id === orderId);
          if (!order || !['pending', 'confirmed'].includes(order.status)) return false;
          clearTimers(orderId);
          get().setStatus(orderId, 'cancelled');
          return true;
        },

        rateOrder: (orderId, rating) =>
          set((s) => ({ orders: s.orders.map((o) => (o.id === orderId ? { ...o, rating } : o)) })),

        resumeSimulations: () => {
          get()
            .orders.filter((o) => ACTIVE_STATUSES.includes(o.status))
            .forEach(schedule);
        },
      };
    },
    {
      name: 'wasel.orders',
      storage: zustandStorage,
      partialize: (s) => ({ orders: s.orders }),
      onRehydrateStorage: () => (state) => state?.resumeSimulations(),
    }
  )
);

/**
 * ملاحظة: هذه الـ selectors تُرجع مصفوفات جديدة في كل استدعاء،
 * لذلك يجب استخدامها مع `useShallow` من zustand لتجنّب إعادة الرسم اللانهائية.
 */
export const selectActiveOrders = (s: OrdersState) => s.orders.filter((o) => ACTIVE_STATUSES.includes(o.status));
export const selectPastOrders = (s: OrdersState) => s.orders.filter((o) => !ACTIVE_STATUSES.includes(o.status));
export const selectActiveOrdersCount = (s: OrdersState) => s.orders.filter((o) => ACTIVE_STATUSES.includes(o.status)).length;

/** الدقائق المتبقية التقريبية للوصول */
export function estimateRemainingMinutes(order: Order): number {
  const elapsedMin = (Date.now() - new Date(order.createdAt).getTime()) / 60000;
  return Math.max(1, Math.round(order.estimatedMinutes - elapsedMin));
}
