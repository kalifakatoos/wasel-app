import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { OrderStatusBadge } from './OrderStatusBadge';
import { Card, Text } from './ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { t } from '@/i18n/ar';
import type { Order } from '@/types';
import { formatAmount, timeAgo } from '@/utils/format';

export function OrderCard({ order }: { order: Order }) {
  const router = useRouter();
  const count = order.items.reduce((n, i) => n + i.quantity, 0);

  return (
    <Card onPress={() => router.push({ pathname: '/order/[id]', params: { id: order.id } })} style={styles.card}>
      <View style={styles.top}>
        <View style={styles.thumb}>
          <Text style={styles.emoji}>{order.storeEmoji}</Text>
        </View>
        <View style={styles.flex}>
          <Text variant="bodyBold" numberOfLines={1}>
            {order.storeName}
          </Text>
          <Text variant="caption">
            {t.orders.orderNumber(order.number)} · {timeAgo(order.createdAt)}
          </Text>
        </View>
        <OrderStatusBadge status={order.status} />
      </View>
      <View style={styles.bottom}>
        <Text variant="caption" numberOfLines={1} style={styles.flex}>
          {order.items.map((i) => `${i.quantity}× ${i.name}`).join('، ')}
        </Text>
      </View>
      <View style={styles.footer}>
        <Text variant="caption">{t.orders.itemsCount(count)}</Text>
        <View style={styles.totalRow}>
          <Text variant="bodyBold">{formatAmount(order.total)}</Text>
          <Ionicons name="chevron-back" size={16} color={Colors.textMuted} />
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: { marginHorizontal: Spacing.lg, gap: Spacing.sm },
  top: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  thumb: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 24, lineHeight: 32 },
  bottom: { flexDirection: 'row' },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
  },
  totalRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
});
