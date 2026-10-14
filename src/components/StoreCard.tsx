import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Badge, Card, Text } from './ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { t } from '@/i18n/ar';
import type { Store } from '@/types';
import { formatDeliveryTime, formatDistance, formatPrice } from '@/utils/format';

interface StoreCardProps {
  store: Store;
  variant?: 'list' | 'featured';
}

export function StoreCard({ store, variant = 'list' }: StoreCardProps) {
  const router = useRouter();
  const go = () => router.push({ pathname: '/store/[id]', params: { id: store.id } });

  if (variant === 'featured') {
    return (
      <Card onPress={go} padded={false} style={styles.featured}>
        <View style={[styles.featuredCover, { backgroundColor: store.color }]}>
          <Text style={styles.featuredEmoji}>{store.emoji}</Text>
          {!store.isOpen && <Badge label={t.common.closed} tone="danger" style={styles.closedBadge} />}
          {store.deliveryFee === 0 && <Badge label="توصيل مجاني" tone="success" style={styles.closedBadge} />}
        </View>
        <View style={styles.featuredBody}>
          <Text variant="bodyBold" numberOfLines={1}>
            {store.name}
          </Text>
          <View style={styles.metaRow}>
            <Ionicons name="star" size={13} color={Colors.star} />
            <Text variant="caption">{store.rating}</Text>
            <Text variant="caption"> · </Text>
            <Text variant="caption">{formatDeliveryTime(store.deliveryTimeMin, store.deliveryTimeMax)}</Text>
          </View>
        </View>
      </Card>
    );
  }

  return (
    <Card onPress={go} padded={false} style={[styles.list, !store.isOpen && styles.closed]}>
      <View style={[styles.thumb, { backgroundColor: store.color }]}>
        <Text style={styles.thumbEmoji}>{store.emoji}</Text>
      </View>
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text variant="bodyBold" numberOfLines={1} style={styles.flex}>
            {store.name}
          </Text>
          {!store.isOpen && <Badge label={t.common.closed} tone="danger" />}
        </View>
        <Text variant="caption" numberOfLines={1}>
          {store.tagline}
        </Text>
        <View style={styles.metaRow}>
          <Ionicons name="star" size={13} color={Colors.star} />
          <Text variant="caption" color={Colors.text}>
            {store.rating}
          </Text>
          <Text variant="caption">({store.ratingCount})</Text>
          <Text variant="caption"> · </Text>
          <Ionicons name="time-outline" size={13} color={Colors.textMuted} />
          <Text variant="caption">{formatDeliveryTime(store.deliveryTimeMin, store.deliveryTimeMax)}</Text>
          <Text variant="caption"> · </Text>
          <Text variant="caption">{formatDistance(store.distanceKm)}</Text>
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="bicycle-outline" size={14} color={Colors.primary} />
          <Text variant="caption" color={store.deliveryFee === 0 ? Colors.success : Colors.textSecondary}>
            {t.store.deliveryFee}: {formatPrice(store.deliveryFee)}
          </Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  // list
  list: { flexDirection: 'row', gap: Spacing.md, padding: Spacing.md, marginHorizontal: Spacing.lg },
  closed: { opacity: 0.75 },
  thumb: { width: 84, height: 84, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  thumbEmoji: { fontSize: 40, lineHeight: 52 },
  body: { flex: 1, gap: 2 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, flexWrap: 'wrap' },
  // featured
  featured: { width: 200, overflow: 'hidden' },
  featuredCover: { height: 110, alignItems: 'center', justifyContent: 'center' },
  featuredEmoji: { fontSize: 52, lineHeight: 64 },
  closedBadge: { position: 'absolute', top: Spacing.sm, insetInlineStart: Spacing.sm },
  featuredBody: { padding: Spacing.md, gap: 2 },
});
