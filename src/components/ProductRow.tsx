import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { Badge, QuantityStepper, Text } from './ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { t } from '@/i18n/ar';
import type { Product } from '@/types';
import { formatAmount } from '@/utils/format';

interface ProductRowProps {
  product: Product;
  /** الكمية الحالية في السلة (لو المنتج بدون خيارات) */
  quantityInCart?: number;
  onPress: () => void;
  onQuickAdd?: () => void;
  onQuantityChange?: (next: number) => void;
}

export function ProductRow({ product, quantityInCart = 0, onPress, onQuickAdd, onQuantityChange }: ProductRowProps) {
  const hasOptions = !!product.options?.length;
  const disabled = !product.isAvailable;

  return (
    <Pressable onPress={onPress} disabled={disabled} style={({ pressed }) => [styles.row, pressed && styles.pressed, disabled && styles.disabled]}>
      <View style={styles.info}>
        <View style={styles.titleRow}>
          <Text variant="bodyBold" numberOfLines={1} style={styles.flex}>
            {product.name}
          </Text>
          {product.isPopular && <Badge label="🔥 شائع" tone="accent" />}
        </View>
        <Text variant="caption" numberOfLines={2}>
          {product.description}
        </Text>
        <View style={styles.priceRow}>
          <Text variant="price">{formatAmount(product.price)}</Text>
          {product.oldPrice ? (
            <Text variant="caption" style={styles.oldPrice}>
              {formatAmount(product.oldPrice)}
            </Text>
          ) : null}
          {disabled && <Badge label={t.store.unavailable} tone="danger" />}
        </View>
      </View>

      <View style={styles.thumbWrap}>
        <View style={styles.thumb}>
          <Text style={styles.emoji}>{product.emoji}</Text>
        </View>
        {!disabled && (
          <View style={styles.action}>
            {!hasOptions && quantityInCart > 0 && onQuantityChange ? (
              <QuantityStepper value={quantityInCart} onChange={onQuantityChange} size="sm" min={0} allowRemove />
            ) : (
              <Pressable
                onPress={hasOptions ? onPress : onQuickAdd}
                hitSlop={6}
                accessibilityLabel={t.product.addToCart}
                style={({ pressed }) => [styles.addBtn, pressed && styles.pressed]}>
                <Ionicons name="add" size={20} color={Colors.textOnPrimary} />
              </Pressable>
            )}
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.55 },
  info: { flex: 1, gap: 2 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.xs },
  oldPrice: { textDecorationLine: 'line-through' },
  thumbWrap: { width: 92, alignItems: 'center' },
  thumb: {
    width: 84,
    height: 84,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 40, lineHeight: 52 },
  action: { marginTop: -16, alignItems: 'center' },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
