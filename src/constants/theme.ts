/**
 * نظام التصميم الخاص بتطبيق واصل
 * الألوان، المسافات، الزوايا، وأحجام الخطوط المستخدمة في كل الشاشات.
 */
import { Platform } from 'react-native';

export const Colors = {
  // الهوية
  primary: '#0F9D7A',
  primaryDark: '#0B7A5F',
  primaryLight: '#E6F6F1',
  accent: '#F59E0B',
  accentLight: '#FEF3C7',

  // الخلفيات
  background: '#F7F8FA',
  surface: '#FFFFFF',
  surfaceMuted: '#F1F3F5',
  border: '#E5E7EB',
  overlay: 'rgba(17, 24, 39, 0.45)',

  // النصوص
  text: '#111827',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  textOnPrimary: '#FFFFFF',

  // الحالات
  success: '#16A34A',
  successLight: '#DCFCE7',
  warning: '#D97706',
  warningLight: '#FEF3C7',
  danger: '#DC2626',
  dangerLight: '#FEE2E2',
  info: '#2563EB',
  infoLight: '#DBEAFE',
  star: '#FBBF24',
} as const;

export type ColorName = keyof typeof Colors;

export const Spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
} as const;

export const FontFamily = {
  regular: 'Cairo_400Regular',
  medium: 'Cairo_500Medium',
  semiBold: 'Cairo_600SemiBold',
  bold: 'Cairo_700Bold',
  extraBold: 'Cairo_800ExtraBold',
} as const;

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 30,
} as const;

export const Shadow = Platform.select({
  web: {
    boxShadow: '0 2px 12px rgba(17, 24, 39, 0.06)',
  },
  default: {
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
}) as object;

export const ShadowLg = Platform.select({
  web: {
    boxShadow: '0 8px 24px rgba(17, 24, 39, 0.12)',
  },
  default: {
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
}) as object;

/** أقصى عرض للمحتوى على الويب حتى يبقى شكل التطبيق مناسباً للموبايل */
export const MaxContentWidth = 520;
