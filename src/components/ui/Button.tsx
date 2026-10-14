import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, type PressableProps, type ViewStyle } from 'react-native';

import { Text } from './Text';
import { Colors, FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<PressableProps, 'style' | 'children'> {
  title: string;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'start' | 'end';
  fullWidth?: boolean;
  style?: ViewStyle;
  /** نص إضافي يظهر في الطرف الآخر من الزر (مثل السعر) */
  trailing?: string;
}

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  icon,
  iconPosition = 'start',
  fullWidth = false,
  style,
  trailing,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const palette = variants[variant];
  const dims = sizes[size];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      {...rest}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: palette.bg, borderColor: palette.border, height: dims.height, paddingHorizontal: dims.px },
        fullWidth && styles.fullWidth,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={palette.fg} />
      ) : (
        <>
          {icon && iconPosition === 'start' && (
            <Ionicons name={icon} size={dims.icon} color={palette.fg} style={styles.iconStart} />
          )}
          <Text style={[styles.label, { color: palette.fg, fontSize: dims.font }]} numberOfLines={1}>
            {title}
          </Text>
          {icon && iconPosition === 'end' && (
            <Ionicons name={icon} size={dims.icon} color={palette.fg} style={styles.iconEnd} />
          )}
          {trailing ? (
            <Text style={[styles.trailing, { color: palette.fg, fontSize: dims.font }]}>{trailing}</Text>
          ) : null}
        </>
      )}
    </Pressable>
  );
}

const variants: Record<Variant, { bg: string; fg: string; border: string }> = {
  primary: { bg: Colors.primary, fg: Colors.textOnPrimary, border: Colors.primary },
  secondary: { bg: Colors.primaryLight, fg: Colors.primaryDark, border: Colors.primaryLight },
  outline: { bg: 'transparent', fg: Colors.primary, border: Colors.primary },
  ghost: { bg: 'transparent', fg: Colors.text, border: 'transparent' },
  danger: { bg: Colors.dangerLight, fg: Colors.danger, border: Colors.dangerLight },
};

const sizes: Record<Size, { height: number; px: number; font: number; icon: number }> = {
  sm: { height: 36, px: Spacing.md, font: FontSize.sm, icon: 16 },
  md: { height: 48, px: Spacing.lg, font: FontSize.md, icon: 20 },
  lg: { height: 56, px: Spacing.xl, font: FontSize.lg, icon: 22 },
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    gap: Spacing.sm,
  },
  fullWidth: { alignSelf: 'stretch' },
  pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
  disabled: { opacity: 0.5 },
  label: { fontFamily: FontFamily.bold },
  trailing: { fontFamily: FontFamily.bold, marginStart: 'auto' },
  iconStart: {},
  iconEnd: {},
});
