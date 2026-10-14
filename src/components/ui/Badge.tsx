import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Text } from './Text';
import { Colors, FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';

type Tone = 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface BadgeProps {
  label: string;
  tone?: Tone;
  icon?: keyof typeof Ionicons.glyphMap;
  size?: 'sm' | 'md';
  style?: StyleProp<ViewStyle>;
}

const tones: Record<Tone, { bg: string; fg: string }> = {
  primary: { bg: Colors.primaryLight, fg: Colors.primaryDark },
  accent: { bg: Colors.accentLight, fg: '#92400E' },
  success: { bg: Colors.successLight, fg: '#166534' },
  warning: { bg: Colors.warningLight, fg: '#92400E' },
  danger: { bg: Colors.dangerLight, fg: '#991B1B' },
  info: { bg: Colors.infoLight, fg: '#1E40AF' },
  neutral: { bg: Colors.surfaceMuted, fg: Colors.textSecondary },
};

export function Badge({ label, tone = 'neutral', icon, size = 'sm', style }: BadgeProps) {
  const palette = tones[tone];
  return (
    <View style={[styles.badge, { backgroundColor: palette.bg }, size === 'md' && styles.md, style]}>
      {icon ? <Ionicons name={icon} size={size === 'md' ? 14 : 12} color={palette.fg} /> : null}
      <Text style={[styles.label, { color: palette.fg }, size === 'md' && styles.labelMd]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  md: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs },
  label: { fontFamily: FontFamily.semiBold, fontSize: FontSize.xs, lineHeight: 16 },
  labelMd: { fontSize: FontSize.sm, lineHeight: 20 },
});
