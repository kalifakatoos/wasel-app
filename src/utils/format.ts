import { t } from '@/i18n/ar';

/** تنسيق المبلغ بالدينار الليبي: 12.50 د.ل */
export function formatPrice(amount: number): string {
  if (amount === 0) return t.common.free;
  const fixed = Number.isInteger(amount) ? amount.toString() : amount.toFixed(2).replace(/\.?0+$/, '');
  return `${fixed} ${t.common.currency}`;
}

/** تنسيق المبلغ بدون كلمة "مجاني" (للمجاميع) */
export function formatAmount(amount: number): string {
  const fixed = Number.isInteger(amount) ? amount.toString() : amount.toFixed(2).replace(/\.?0+$/, '');
  return `${fixed} ${t.common.currency}`;
}

/** مدى وقت التوصيل: 25-35 دقيقة */
export function formatDeliveryTime(min: number, max: number): string {
  return `${min}-${max} ${t.common.minutes}`;
}

/** المسافة: 1.2 كم */
export function formatDistance(km: number): string {
  return `${km.toFixed(1)} ${t.common.km}`;
}

/** رقم هاتف ليبي مع رمز الدولة: +218 91 234 5678 */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  const local = digits.startsWith('218') ? digits.slice(3) : digits.replace(/^0/, '');
  if (local.length !== 9) return phone;
  return `+218 ${local.slice(0, 2)} ${local.slice(2, 5)} ${local.slice(5)}`;
}

/** التحقق من رقم هاتف ليبي (9 أرقام تبدأ بـ 91-95) */
export function isValidLibyanPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '').replace(/^0/, '');
  return /^9[1-5]\d{7}$/.test(digits);
}

/** تطبيع رقم الهاتف للتخزين: 218912345678 */
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '').replace(/^0/, '');
  return digits.startsWith('218') ? digits : `218${digits}`;
}

const arabicWeekdays = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const arabicMonths = [
  'يناير',
  'فبراير',
  'مارس',
  'أبريل',
  'مايو',
  'يونيو',
  'يوليو',
  'أغسطس',
  'سبتمبر',
  'أكتوبر',
  'نوفمبر',
  'ديسمبر',
];

/** تاريخ مقروء: الثلاثاء 14 أكتوبر، 3:45 م */
export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const day = arabicWeekdays[d.getDay()];
  const month = arabicMonths[d.getMonth()];
  return `${day} ${d.getDate()} ${month}، ${formatTime(iso)}`;
}

/** وقت مقروء: 3:45 م */
export function formatTime(iso: string): string {
  const d = new Date(iso);
  let h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  const suffix = h >= 12 ? 'م' : 'ص';
  h = h % 12 || 12;
  return `${h}:${m} ${suffix}`;
}

/** تاريخ قصير: 14 أكتوبر 2026 */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${arabicMonths[d.getMonth()]} ${d.getFullYear()}`;
}

/** نسبة منذ وقت معين: منذ 5 دقائق */
export function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'الآن';
  if (mins < 60) return `منذ ${mins} ${mins === 1 ? 'دقيقة' : mins <= 10 ? 'دقائق' : 'دقيقة'}`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `منذ ${hours} ${hours === 1 ? 'ساعة' : hours <= 10 ? 'ساعات' : 'ساعة'}`;
  const days = Math.floor(hours / 24);
  return `منذ ${days} ${days === 1 ? 'يوم' : days <= 10 ? 'أيام' : 'يوم'}`;
}

/** معرّف عشوائي قصير */
export function uid(prefix = ''): string {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

/** رقم طلب قصير مقروء: 4 أرقام */
export function shortOrderNumber(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}
