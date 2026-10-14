import { t } from '@/i18n/ar';
import type { Driver, PaymentMethod, PromoCode } from '@/types';

export const paymentMethods: PaymentMethod[] = [
  { id: 'cash', name: t.payment.cash, description: t.payment.cashDesc, icon: 'cash-outline', enabled: true },
  { id: 'sadad', name: t.payment.sadad, description: t.payment.sadadDesc, icon: 'phone-portrait-outline', enabled: true },
  { id: 'mobicash', name: t.payment.mobicash, description: t.payment.mobicashDesc, icon: 'wallet-outline', enabled: true },
  { id: 'card', name: t.payment.card, description: t.payment.cardDesc, icon: 'card-outline', enabled: false },
];

export const drivers: Driver[] = [
  { id: 'd1', name: 'محمد الزوي', phone: '218913456789', vehicle: 'دراجة نارية', plate: '5-123456', rating: 4.9, avatarEmoji: '🧔' },
  { id: 'd2', name: 'أحمد الفيتوري', phone: '218924567890', vehicle: 'سيارة — هيونداي أكسنت', plate: '5-654321', rating: 4.8, avatarEmoji: '👨' },
  { id: 'd3', name: 'علي المصراتي', phone: '218945678901', vehicle: 'دراجة نارية', plate: '5-789012', rating: 4.7, avatarEmoji: '👨‍🦱' },
  { id: 'd4', name: 'خالد الورفلي', phone: '218916789012', vehicle: 'سيارة — كيا بيكانتو', plate: '5-345678', rating: 4.9, avatarEmoji: '🧑' },
];

export const promoCodes: PromoCode[] = [
  { code: 'WASEL', description: 'توصيل مجاني على أول طلب', type: 'free_delivery', value: 0 },
  { code: 'WASEL10', description: 'خصم 10% حتى 10 د.ل', type: 'percent', value: 10, minOrder: 20 },
  { code: 'TRIPOLI5', description: 'خصم 5 د.ل', type: 'fixed', value: 5, minOrder: 30 },
];

export const popularSearches = ['شاورما', 'بيتزا', 'كسكسي', 'قهوة', 'بنادول', 'خبز', 'مقروض'];

export function pickRandomDriver(): Driver {
  return drivers[Math.floor(Math.random() * drivers.length)];
}
