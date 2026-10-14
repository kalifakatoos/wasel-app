import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from './Text';
import { Colors, Spacing } from '@/constants/theme';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  showBack?: boolean;
  right?: React.ReactNode;
  transparent?: boolean;
}

/** رأس شاشة بسيط مع زر رجوع (السهم يتجه لليمين في RTL تلقائياً) */
export function Header({ title, subtitle, onBack, showBack = true, right, transparent = false }: HeaderProps) {
  const router = useRouter();
  const handleBack = onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/(tabs)')));

  return (
    <View style={[styles.header, transparent && styles.transparent]}>
      {showBack ? (
        <Pressable onPress={handleBack} hitSlop={10} style={styles.iconBtn} accessibilityLabel="رجوع">
          <Ionicons name="arrow-forward" size={22} color={Colors.text} />
        </Pressable>
      ) : (
        <View style={styles.iconBtn} />
      )}
      <View style={styles.titleWrap}>
        <Text variant="subheading" align="center" numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="caption" align="center" numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View style={styles.iconBtn}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.background,
  },
  transparent: { backgroundColor: 'transparent' },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  titleWrap: { flex: 1, alignItems: 'center' },
});
