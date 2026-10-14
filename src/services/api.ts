/**
 * طبقة الخدمات (API)
 *
 * كل الشاشات تتعامل مع `api` فقط ولا تعرف من أين تأتي البيانات.
 * - بدون `EXPO_PUBLIC_API_URL`: تُستخدم البيانات التجريبية المحلية (MockApi).
 * - مع `EXPO_PUBLIC_API_URL`: تُستخدم HttpApi التي تتصل بالباك إند.
 *
 * عقد الـ REST المتوقع من الباك إند موثّق في README (قسم "ربط الباك إند").
 */
import { categories } from '@/data/categories';
import { paymentMethods, promoCodes } from '@/data/misc';
import { getProductsByStore, products } from '@/data/products';
import { getStoreById, stores } from '@/data/stores';
import type {
  Address,
  CartItem,
  Category,
  Order,
  PaymentMethod,
  PaymentMethodId,
  Product,
  PromoCode,
  Store,
  User,
} from '@/types';
import { uid } from '@/utils/format';

export interface PlaceOrderPayload {
  storeId: string;
  items: CartItem[];
  address: Address;
  paymentMethod: PaymentMethodId;
  promoCode?: string;
  note?: string;
}

export interface SearchResult {
  stores: Store[];
  products: Product[];
}

export interface WaselApi {
  getCategories(): Promise<Category[]>;
  getStores(categoryId?: string): Promise<Store[]>;
  getStore(id: string): Promise<Store | undefined>;
  getProducts(storeId: string): Promise<Product[]>;
  search(query: string): Promise<SearchResult>;
  getPaymentMethods(): Promise<PaymentMethod[]>;
  validatePromo(code: string): Promise<PromoCode | undefined>;
  sendOtp(phone: string): Promise<{ ok: boolean; expiresInSec: number }>;
  verifyOtp(phone: string, code: string): Promise<{ ok: boolean; user?: User }>;
  updateProfile(user: User): Promise<User>;
}

const API_URL = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '') ?? '';
const API_TIMEOUT = Number(process.env.EXPO_PUBLIC_API_TIMEOUT_MS ?? 15000);

/** تأخير بسيط لمحاكاة الشبكة في الوضع التجريبي */
const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms));

const normalize = (s: string) => s.trim().toLowerCase().replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي');

// ---------------------------------------------------------------------------
// MockApi — بيانات محلية
// ---------------------------------------------------------------------------
export const mockApi: WaselApi = {
  async getCategories() {
    await delay(100);
    return categories;
  },
  async getStores(categoryId) {
    await delay();
    return categoryId ? stores.filter((s) => s.categoryId === categoryId) : stores;
  },
  async getStore(id) {
    await delay(150);
    return getStoreById(id);
  },
  async getProducts(storeId) {
    await delay();
    return getProductsByStore(storeId);
  },
  async search(query) {
    await delay(200);
    const q = normalize(query);
    if (!q) return { stores: [], products: [] };
    const matchedStores = stores.filter(
      (s) =>
        normalize(s.name).includes(q) ||
        normalize(s.tagline).includes(q) ||
        s.tags.some((tg) => normalize(tg).includes(q))
    );
    const matchedProducts = products.filter(
      (p) => normalize(p.name).includes(q) || normalize(p.description).includes(q) || normalize(p.section).includes(q)
    );
    return { stores: matchedStores, products: matchedProducts.slice(0, 30) };
  },
  async getPaymentMethods() {
    return paymentMethods;
  },
  async validatePromo(code) {
    await delay(300);
    return promoCodes.find((p) => p.code.toUpperCase() === code.trim().toUpperCase());
  },
  async sendOtp() {
    await delay(600);
    return { ok: true, expiresInSec: 60 };
  },
  async verifyOtp(phone, code) {
    await delay(700);
    if (code !== '1234') return { ok: false };
    return {
      ok: true,
      user: { id: uid('u-'), name: '', phone, createdAt: new Date().toISOString() },
    };
  },
  async updateProfile(user) {
    await delay(300);
    return user;
  },
};

// ---------------------------------------------------------------------------
// HttpApi — باك إند حقيقي
// ---------------------------------------------------------------------------
async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), API_TIMEOUT);
  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...init,
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...(init?.headers ?? {}) },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} — ${path}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

export const httpApi: WaselApi = {
  getCategories: () => http('/categories'),
  getStores: (categoryId) => http(`/stores${categoryId ? `?category=${categoryId}` : ''}`),
  getStore: (id) => http(`/stores/${id}`),
  getProducts: (storeId) => http(`/stores/${storeId}/products`),
  search: (query) => http(`/search?q=${encodeURIComponent(query)}`),
  getPaymentMethods: () => http('/payment-methods'),
  validatePromo: (code) => http(`/promos/${encodeURIComponent(code)}`),
  sendOtp: (phone) => http('/auth/otp/send', { method: 'POST', body: JSON.stringify({ phone }) }),
  verifyOtp: (phone, code) =>
    http('/auth/otp/verify', { method: 'POST', body: JSON.stringify({ phone, code }) }),
  updateProfile: (user) => http('/me', { method: 'PUT', body: JSON.stringify(user) }),
};

/** إنشاء طلب على الباك إند (يُستخدم من متجر الطلبات عند توفر API) */
export async function placeOrderRemote(payload: PlaceOrderPayload): Promise<Order> {
  return http('/orders', { method: 'POST', body: JSON.stringify(payload) });
}

export const isMockMode = !API_URL;
export const api: WaselApi = isMockMode ? mockApi : httpApi;
