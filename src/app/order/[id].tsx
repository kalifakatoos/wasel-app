import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Linking, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { CartItemRow } from '@/components/CartItemRow';
import { OrderStatusBadge } from '@/components/OrderStatusBadge';
import { OrderTimeline } from '@/components/OrderTimeline';
import { RatingStars } from '@/components/RatingStars';
import { Button, Card, EmptyState, Header, Screen, Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { paymentMethods } from '@/data/misc';
import { getProductById } from '@/data/products';
import { getStoreById } from '@/data/stores';
import { t } from '@/i18n/ar';
import { useCartStore } from '@/store/cart';
import { ACTIVE_STATUSES, estimateRemainingMinutes, useOrdersStore } from '@/store/orders';
import { formatAmount, formatDateTime, formatPhone, formatPrice } from '@/utils/format';

export default function OrderTrackingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const order = useOrdersStore((s) => s.orders.find((o) => o.id === id));
  const cancelOrder = useOrdersStore((s) => s.cancelOrder);
  const rateOrder = useOrdersStore((s) => s.rateOrder);
  const addItem = useCartStore((s) => s.addItem);
  const clearCart = useCartStore((s) => s.clear);

  // تحديث الوقت المتبقي كل دقيقة
  const [, tick] = useState(0);
  useEffect(() => {
    const idInterval = setInterval(() => tick((n) => n + 1), 30000);
    return () => clearInterval(idInterval);
  }, []);

  if (!order) {
    return (
      <Screen>
        <Header title={t.tracking.title} />
        <EmptyState emoji="🔎" title={t.common.notFound} actionLabel={t.common.goHome} onAction={() => router.replace('/(tabs)')} />
      </Screen>
    );
  }

  const isActive = ACTIVE_STATUSES.includes(order.status);
  const canCancel = order.status === 'pending' || order.status === 'confirmed';
  const remaining = estimateRemainingMinutes(order);
  const payment = paymentMethods.find((p) => p.id === order.paymentMethod);

  const handleCancel = () => {
    const doCancel = () => {
      if (!cancelOrder(order.id) && Platform.OS !== 'web') Alert.alert(t.tracking.cancelNotAllowed);
    };
    if (Platform.OS === 'web') {
      if (window.confirm(t.tracking.cancelConfirm)) doCancel();
      return;
    }
    Alert.alert(t.tracking.cancelOrder, t.tracking.cancelConfirm, [
      { text: t.common.no, style: 'cancel' },
      { text: t.common.yes, style: 'destructive', onPress: doCancel },
    ]);
  };

  const reorder = () => {
    const store = getStoreById(order.storeId);
    if (!store) return;
    clearCart();
    order.items.forEach((item) => {
      const product = getProductById(item.productId);
      if (product && product.isAvailable) addItem(product, item.quantity, item.selectedOptions, item.note);
    });
    router.push('/(tabs)/cart');
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <Header title={t.tracking.title} subtitle={t.orders.orderNumber(order.number)} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* الحالة الحالية */}
        <Card style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={styles.flex}>
              <Text variant="heading">{t.tracking.statusLabel[order.status]}</Text>
              <Text variant="caption">{t.tracking.statusDesc[order.status]}</Text>
            </View>
            <OrderStatusBadge status={order.status} size="md" />
          </View>

          {isActive && (
            <View style={styles.etaBox}>
              <Ionicons name="time-outline" size={22} color={Colors.primaryDark} />
              <Text variant="body" color={Colors.primaryDark} style={styles.flex}>
                {order.status === 'on_the_way' && remaining <= 5 ? t.tracking.arriving : t.tracking.eta}
              </Text>
              <Text variant="heading" color={Colors.primaryDark}>
                {remaining} {t.common.minutes}
              </Text>
            </View>
          )}

          {order.status === 'delivered' && (
            <View style={styles.etaBox}>
              <Ionicons name="checkmark-done-circle" size={22} color={Colors.success} />
              <Text variant="body" color={Colors.success} style={styles.flex}>
                {t.tracking.deliveredAt}
              </Text>
              <Text variant="label" color={Colors.success}>
                {formatDateTime(order.timeline[order.timeline.length - 1]?.at ?? order.createdAt)}
              </Text>
            </View>
          )}

          {/* خريطة (placeholder) */}
          {order.status === 'on_the_way' && (
            <View style={styles.map}>
              <View style={styles.mapRoute} />
              <View style={[styles.mapPin, styles.mapPinStore]}>
                <Text style={styles.mapPinEmoji}>{order.storeEmoji}</Text>
              </View>
              <View style={[styles.mapPin, styles.mapPinDriver]}>
                <Ionicons name="bicycle" size={18} color={Colors.textOnPrimary} />
              </View>
              <View style={[styles.mapPin, styles.mapPinHome]}>
                <Ionicons name="home" size={16} color={Colors.textOnPrimary} />
              </View>
              <Text variant="caption" align="center" style={styles.mapNote}>
                {t.tracking.mapPlaceholder}
              </Text>
            </View>
          )}
        </Card>

        {/* السائق */}
        {order.driver && isActive && (
          <Card style={styles.driverCard}>
            <View style={styles.driverAvatar}>
              <Text style={styles.driverEmoji}>{order.driver.avatarEmoji}</Text>
            </View>
            <View style={styles.flex}>
              <Text variant="caption">{t.tracking.driver}</Text>
              <Text variant="bodyBold">{order.driver.name}</Text>
              <Text variant="caption">
                {order.driver.vehicle} · {order.driver.plate}
              </Text>
              <View style={styles.driverRating}>
                <Ionicons name="star" size={12} color={Colors.star} />
                <Text variant="caption" color={Colors.text}>
                  {order.driver.rating}
                </Text>
              </View>
            </View>
            <Pressable
              onPress={() => Linking.openURL(`tel:+${order.driver!.phone}`)}
              style={styles.callBtn}
              accessibilityLabel={`${t.common.call} ${formatPhone(order.driver.phone)}`}>
              <Ionicons name="call" size={22} color={Colors.textOnPrimary} />
            </Pressable>
          </Card>
        )}

        {/* الخط الزمني */}
        <Card>
          <OrderTimeline order={order} />
        </Card>

        {/* التقييم */}
        {order.status === 'delivered' && (
          <Card style={styles.rateCard}>
            <Text variant="subheading" align="center">
              {order.rating ? t.tracking.thankYou : t.tracking.rateTitle}
            </Text>
            <RatingStars value={order.rating ?? 0} onChange={order.rating ? undefined : (v) => rateOrder(order.id, v)} />
          </Card>
        )}

        {/* المنتجات */}
        <Card padded={false} style={styles.itemsCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.storeEmoji}>{order.storeEmoji}</Text>
            <Text variant="subheading" style={styles.flex}>
              {order.storeName}
            </Text>
          </View>
          {order.items.map((item) => (
            <CartItemRow key={item.key} item={item} readonly />
          ))}
          <View style={styles.divider} />
          <Row label={t.cart.subtotal} value={formatAmount(order.subtotal)} />
          <Row label={t.cart.deliveryFee} value={formatPrice(order.deliveryFee)} />
          {order.discount > 0 && <Row label={t.cart.discount} value={`- ${formatAmount(order.discount)}`} color={Colors.success} />}
          <View style={styles.divider} />
          <Row label={t.cart.total} value={formatAmount(order.total)} bold />
        </Card>

        {/* التفاصيل */}
        <Card style={styles.detailsCard}>
          <Detail icon="location-outline" label={t.tracking.deliveryAddress} value={`${order.address.label} — ${order.address.area}، ${order.address.street}`} />
          <Detail icon="wallet-outline" label={t.tracking.paymentMethod} value={payment?.name ?? order.paymentMethod} />
          <Detail icon="calendar-outline" label={t.orders.orderNumber(order.number)} value={formatDateTime(order.createdAt)} />
          {order.note ? <Detail icon="chatbox-ellipses-outline" label={t.checkout.orderNote} value={order.note} /> : null}
        </Card>

        {/* الإجراءات */}
        <View style={styles.actions}>
          {canCancel && <Button title={t.tracking.cancelOrder} variant="danger" fullWidth onPress={handleCancel} icon="close-circle-outline" />}
          {!isActive && <Button title={t.orders.reorder} fullWidth onPress={reorder} icon="refresh-outline" />}
          <Button title={t.tracking.help} variant="ghost" fullWidth icon="help-circle-outline" onPress={() => {}} />
        </View>
      </ScrollView>
    </Screen>
  );
}

function Row({ label, value, bold, color }: { label: string; value: string; bold?: boolean; color?: string }) {
  return (
    <View style={styles.row}>
      <Text variant={bold ? 'bodyBold' : 'body'} color={color ?? (bold ? Colors.text : Colors.textSecondary)}>
        {label}
      </Text>
      <Text variant={bold ? 'subheading' : 'bodyBold'} color={color ?? Colors.text}>
        {value}
      </Text>
    </View>
  );
}

function Detail({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.detail}>
      <Ionicons name={icon} size={20} color={Colors.primary} />
      <View style={styles.flex}>
        <Text variant="caption">{label}</Text>
        <Text variant="body">{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: Spacing.lg, gap: Spacing.lg, paddingBottom: Spacing.xxl },
  statusCard: { gap: Spacing.md },
  statusHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  etaBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primaryLight,
    padding: Spacing.md,
    borderRadius: Radius.md,
  },
  map: {
    height: 150,
    borderRadius: Radius.md,
    backgroundColor: '#E8F0EA',
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  mapRoute: {
    position: 'absolute',
    top: 60,
    left: 40,
    right: 40,
    height: 3,
    backgroundColor: Colors.primary,
    opacity: 0.5,
    borderRadius: 2,
  },
  mapPin: { position: 'absolute', top: 44, width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  mapPinStore: { right: 24, backgroundColor: Colors.surface, borderWidth: 2, borderColor: Colors.primary },
  mapPinDriver: { left: '48%', backgroundColor: Colors.accent },
  mapPinHome: { left: 24, backgroundColor: Colors.primary },
  mapPinEmoji: { fontSize: 16, lineHeight: 20 },
  mapNote: { padding: Spacing.sm, backgroundColor: 'rgba(255,255,255,0.8)' },
  driverCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  driverAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverEmoji: { fontSize: 28, lineHeight: 36 },
  driverRating: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  callBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.success, alignItems: 'center', justifyContent: 'center' },
  rateCard: { gap: Spacing.md, alignItems: 'center' },
  itemsCard: { padding: Spacing.lg, gap: Spacing.xs },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.xs },
  storeEmoji: { fontSize: 24, lineHeight: 32 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: Colors.border, marginVertical: Spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detailsCard: { gap: Spacing.lg },
  detail: { flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start' },
  actions: { gap: Spacing.sm },
});
