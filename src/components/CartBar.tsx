import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from './ui';
import { Colors, MaxContentWidth, Radius, ShadowLg, Spacing } from '@/constants/theme';
import { t } from '@/i18n/ar';
import { selectCartCount, selectSubtotal, useCartStore } from '@/store/cart';
import { formatAmount } from '@/utils/format';

/** شريط عائم أسفل الشاشة يعرض عدد المنتجات والمجموع، ويفتح السلة */
export function CartBar({ storeId }: { storeId?: string }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const count = useCartStore(selectCartCount);
  const subtotal = useCartStore(selectSubtotal);
  const cartStoreId = useCartStore((s) => s.storeId);

  if (count === 0 || (storeId && cartStoreId !== storeId)) return null;

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, Spacing.md) }]}>
      <Pressable
        onPress={() => router.push('/(tabs)/cart')}
        style={({ pressed }) => [styles.bar, pressed && styles.pressed]}
        accessibilityRole="button">
        <View style={styles.countBubble}>
          <Text variant="label" color={Colors.primaryDark}>
            {count}
          </Text>
        </View>
        <Text variant="bodyBold" color={Colors.textOnPrimary} style={styles.flex}>
          {t.store.viewCart}
        </Text>
        <Text variant="bodyBold" color={Colors.textOnPrimary}>
          {formatAmount(subtotal)}
        </Text>
        <Ionicons name="chevron-back" size={18} color={Colors.textOnPrimary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  wrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
  },
  bar: {
    width: '100%',
    maxWidth: MaxContentWidth - Spacing.lg * 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.lg,
    height: 56,
    ...ShadowLg,
  },
  pressed: { opacity: 0.92 },
  countBubble: {
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    paddingHorizontal: 6,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
