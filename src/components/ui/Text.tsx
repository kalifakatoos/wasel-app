import { Text as RNText, StyleSheet, type TextProps as RNTextProps } from 'react-native';

import { Colors, FontFamily, FontSize } from '@/constants/theme';

type Variant = 'title' | 'heading' | 'subheading' | 'body' | 'bodyBold' | 'caption' | 'label' | 'price';

export interface TextProps extends RNTextProps {
  variant?: Variant;
  color?: string;
  /** ملاحظة: left/right في RN تُقلب في وضع RTL على Text، لذلك نكتفي بـ center/auto */
  align?: 'auto' | 'center';
}

/**
 * نص موحّد يستخدم خط Cairo ويضبط اتجاه الكتابة للعربية.
 */
export function Text({ variant = 'body', color, align, style, ...rest }: TextProps) {
  return (
    <RNText
      {...rest}
      style={[styles.base, styles[variant], color ? { color } : null, align ? { textAlign: align } : null, style]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    color: Colors.text,
    fontFamily: FontFamily.regular,
    // 'auto' يحاذي النص لبداية السطر (اليمين في العربية) على كل المنصات
    writingDirection: 'rtl',
  },
  title: { fontFamily: FontFamily.extraBold, fontSize: FontSize.xxl, lineHeight: 36 },
  heading: { fontFamily: FontFamily.bold, fontSize: FontSize.xl, lineHeight: 30 },
  subheading: { fontFamily: FontFamily.bold, fontSize: FontSize.lg, lineHeight: 26 },
  body: { fontFamily: FontFamily.regular, fontSize: FontSize.md, lineHeight: 24 },
  bodyBold: { fontFamily: FontFamily.semiBold, fontSize: FontSize.md, lineHeight: 24 },
  caption: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, lineHeight: 20, color: Colors.textSecondary },
  label: { fontFamily: FontFamily.semiBold, fontSize: FontSize.sm, lineHeight: 20 },
  price: { fontFamily: FontFamily.bold, fontSize: FontSize.md, lineHeight: 24, color: Colors.primary },
});
