import { StyleSheet, View } from 'react-native';

import { QuantityStepper, Text } from './ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import type { CartItem } from '@/types';
import { formatAmount } from '@/utils/format';

interface CartItemRowProps {
  item: CartItem;
  onQuantityChange?: (next: number) => void;
  readonly?: boolean;
}

export function CartItemRow({ item, onQuantityChange, readonly = false }: CartItemRowProps) {
  const optionsText = item.selectedOptions.map((o) => o.choiceName).join('، ');
  return (
    <View style={styles.row}>
      <View style={styles.thumb}>
        <Text style={styles.emoji}>{item.emoji}</Text>
      </View>
      <View style={styles.info}>
        <Text variant="bodyBold" numberOfLines={1}>
          {readonly ? `${item.quantity} × ` : ''}
          {item.name}
        </Text>
        {optionsText ? (
          <Text variant="caption" numberOfLines={1}>
            {optionsText}
          </Text>
        ) : null}
        {item.note ? (
          <Text variant="caption" numberOfLines={1} color={Colors.textMuted}>
            📝 {item.note}
          </Text>
        ) : null}
        <Text variant="price">{formatAmount(item.unitPrice * item.quantity)}</Text>
      </View>
      {!readonly && onQuantityChange ? (
        <QuantityStepper value={item.quantity} onChange={onQuantityChange} size="sm" min={0} allowRemove />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.md },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 26, lineHeight: 34 },
  info: { flex: 1, gap: 1 },
});
