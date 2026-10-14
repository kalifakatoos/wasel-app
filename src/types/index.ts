/**
 * أنواع البيانات الأساسية في تطبيق واصل
 */

export type CategoryId =
  | 'restaurants'
  | 'grocery'
  | 'pharmacy'
  | 'sweets'
  | 'bakery'
  | 'coffee'
  | 'gifts';

export interface Category {
  id: CategoryId;
  name: string;
  emoji: string;
  color: string;
}

export interface Store {
  id: string;
  name: string;
  categoryId: CategoryId;
  emoji: string;
  color: string;
  tagline: string;
  rating: number;
  ratingCount: number;
  deliveryTimeMin: number;
  deliveryTimeMax: number;
  deliveryFee: number;
  minOrder: number;
  area: string;
  distanceKm: number;
  isOpen: boolean;
  isFeatured?: boolean;
  tags: string[];
}

export interface Product {
  id: string;
  storeId: string;
  name: string;
  description: string;
  emoji: string;
  price: number;
  oldPrice?: number;
  section: string;
  isPopular?: boolean;
  isAvailable: boolean;
  options?: ProductOptionGroup[];
}

export interface ProductOptionGroup {
  id: string;
  name: string;
  required: boolean;
  multiple: boolean;
  choices: ProductOptionChoice[];
}

export interface ProductOptionChoice {
  id: string;
  name: string;
  extraPrice: number;
}

export interface CartItem {
  key: string; // productId + الخيارات المختارة
  productId: string;
  storeId: string;
  name: string;
  emoji: string;
  unitPrice: number;
  quantity: number;
  selectedOptions: { groupName: string; choiceName: string; extraPrice: number }[];
  note?: string;
}

export interface Address {
  id: string;
  label: string; // البيت، العمل...
  area: string;
  street: string;
  building?: string;
  details?: string;
  phone?: string;
  isDefault?: boolean;
  lat?: number;
  lng?: number;
}

export type PaymentMethodId = 'cash' | 'sadad' | 'mobicash' | 'card';

export interface PaymentMethod {
  id: PaymentMethodId;
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
}

export type OrderStatus =
  | 'pending' // بانتظار تأكيد المتجر
  | 'confirmed' // تم تأكيد الطلب
  | 'preparing' // جاري التحضير
  | 'on_the_way' // في الطريق
  | 'delivered' // تم التوصيل
  | 'cancelled';

export interface Driver {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  plate: string;
  rating: number;
  avatarEmoji: string;
}

export interface OrderTimelineEvent {
  status: OrderStatus;
  at: string; // ISO
}

export interface Order {
  id: string;
  number: string; // رقم قصير يظهر للزبون
  storeId: string;
  storeName: string;
  storeEmoji: string;
  items: CartItem[];
  address: Address;
  paymentMethod: PaymentMethodId;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  status: OrderStatus;
  timeline: OrderTimelineEvent[];
  driver?: Driver;
  createdAt: string;
  estimatedMinutes: number;
  note?: string;
  rating?: number;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  createdAt: string;
}

export interface PromoCode {
  code: string;
  description: string;
  type: 'percent' | 'fixed' | 'free_delivery';
  value: number;
  minOrder?: number;
}
