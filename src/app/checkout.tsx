import { Ionicons } from '@expo/vector-icons';
import { Redirect, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { CartItemRow } from '@/components/CartItemRow';
import { Button, Card, Header, Input, Screen, Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { paymentMethods } from '@/data/misc';
import { getStoreById } from '@/data/stores';
import { t } from '@/i18n/ar';
import { selectCurrentAddress, useAddressStore } from '@/store/addresses';
import { computeTotals, useCartStore } from '@/store/cart';
import { useOrdersStore } from '@/store/orders';
import type { PaymentMethodId } from '@/types';
import { formatAmount, formatDeliveryTime, formatPrice } from '@/utils/format';

export default function CheckoutScreen() {
  const router = useRouter();
  const { items, storeId, promo, clear } = useCartStore();
  const address = useAddressStore(selectCurrentAddress);
  const placeOrder = useOrdersStore((s) => s.placeOrder);
  const isPlacing = useOrdersStore((s) => s.isPlacing);

  const store = storeId ? getStoreById(storeId) : undefined;
  const [payment, setPayment] = useState<PaymentMethodId>('cash');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [placed, setPlaced] = useState(false);

  const totals = useMemo(() => computeTotals(items, store?.deliveryFee ?? 0, promo), [items, store, promo]);

  if (!store || items.length === 0) {
    // بعد إرسال الطلب تُفرَّغ السلة؛ لا نعيد التوجيه للسلة في هذه الحالة
    return placed ? null : <Redirect href="/(tabs)/cart" />;
  }

  const submit = async () => {
    if (!address) {
      setError(t.checkout.noAddress);
      return;
    }
    setError(undefined);
    try {
      const order = await placeOrder(
        { storeId: store.id, items, address, paymentMethod: payment, promoCode: promo?.code, note: note.trim() || undefined },
        store,
        promo
      );
      setPlaced(true);
      router.replace({ pathname: '/order-success', params: { id: order.id } });
      clear();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <Header title={t.checkout.title} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* العنوان */}
        <Section title={t.checkout.address} action={address ? t.checkout.changeAddress : undefined} onAction={() => router.push('/addresses')}>
          {address ? (
            <View style={styles.addressRow}>
              <View style={styles.addressIcon}>
                <Ionicons name="location" size={22} color={Colors.primary} />
              </View>
              <View style={styles.flex}>
                <Text variant="bodyBold">{address.label}</Text>
                <Text variant="caption">
                  {address.area}، {address.street}
                  {address.building ? `، ${address.building}` : ''}
                </Text>
                {address.details ? <Text variant="caption">{address.details}</Text> : null}
              </View>
            </View>
          ) : (
            <Pressable onPress={() => router.push('/address-form')} style={styles.addAddress}>
              <Ionicons name="add-circle-outline" size={22} color={Colors.primary} />
              <Text variant="bodyBold" color={Colors.primary}>
                {t.checkout.addAddress}
              </Text>
            </Pressable>
          )}
        </Section>

        {/* الوقت المتوقع */}
        <View style={styles.eta}>
          <Ionicons name="time-outline" size={20} color={Colors.primaryDark} />
          <Text variant="body" color={Colors.primaryDark} style={styles.flex}>
            {t.checkout.estimated}
          </Text>
          <Text variant="bodyBold" color={Colors.primaryDark}>
            {formatDeliveryTime(store.deliveryTimeMin, store.deliveryTimeMax)}
          </Text>
        </View>

        {/* الدفع */}
        <Section title={t.checkout.payment}>
          <View style={styles.payments}>
            {paymentMethods.map((m) => {
              const isSelected = payment === m.id;
              return (
                <Pressable
                  key={m.id}
                  disabled={!m.enabled}
                  onPress={() => setPayment(m.id)}
                  style={[styles.payment, isSelected && styles.paymentSelected, !m.enabled && styles.paymentDisabled]}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: isSelected, disabled: !m.enabled }}>
                  <View style={[styles.paymentIcon, isSelected && styles.paymentIconSelected]}>
                    <Ionicons name={m.icon as keyof typeof Ionicons.glyphMap} size={22} color={isSelected ? Colors.textOnPrimary : Colors.primary} />
                  </View>
                  <View style={styles.flex}>
                    <Text variant="bodyBold">{m.name}</Text>
                    <Text variant="caption">{m.description}</Text>
                  </View>
                  <Ionicons name={isSelected ? 'radio-button-on' : 'radio-button-off'} size={22} color={isSelected ? Colors.primary : Colors.textMuted} />
                </Pressable>
              );
            })}
          </View>
          {payment === 'cash' && (
            <Text variant="caption" style={styles.cashNote}>
              💡 {t.checkout.cashNote}
            </Text>
          )}
        </Section>

        {/* ملاحظات */}
        <Section title={t.checkout.orderNote}>
          <Input placeholder={t.checkout.orderNotePlaceholder} value={note} onChangeText={setNote} multiline maxLength={200} />
        </Section>

        {/* الملخص */}
        <Section title={t.checkout.summary}>
          <Card padded={false} style={styles.summaryCard}>
            <View style={styles.storeRow}>
              <Text style={styles.storeEmoji}>{store.emoji}</Text>
              <Text variant="bodyBold">{store.name}</Text>
            </View>
            {items.map((item) => (
              <CartItemRow key={item.key} item={item} readonly />
            ))}
            <View style={styles.divider} />
            <Row label={t.cart.subtotal} value={formatAmount(totals.subtotal)} />
            <Row label={t.cart.deliveryFee} value={formatPrice(totals.deliveryFee)} />
            {totals.discount > 0 && <Row label={`${t.cart.discount} (${promo?.code})`} value={`- ${formatAmount(totals.discount)}`} color={Colors.success} />}
            <View style={styles.divider} />
            <Row label={t.cart.total} value={formatAmount(totals.total)} bold />
          </Card>
        </Section>

        {error ? (
          <View style={styles.error}>
            <Ionicons name="alert-circle" size={18} color={Colors.danger} />
            <Text variant="caption" color={Colors.danger} style={styles.flex}>
              {error}
            </Text>
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={isPlacing ? t.checkout.placing : t.checkout.placeOrder}
          size="lg"
          fullWidth
          loading={isPlacing}
          trailing={formatAmount(totals.total)}
          onPress={submit}
        />
      </View>
    </Screen>
  );
}

function Section({ title, action, onAction, children }: { title: string; action?: string; onAction?: () => void; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text variant="subheading">{title}</Text>
        {action && onAction ? (
          <Pressable onPress={onAction} hitSlop={8}>
            <Text variant="label" color={Colors.primary}>
              {action}
            </Text>
          </Pressable>
        ) : null}
      </View>
      {children}
    </View>
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

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: Spacing.lg, gap: Spacing.xl, paddingBottom: Spacing.xxl },
  section: { gap: Spacing.md },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  addressRow: { flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start' },
  addressIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addAddress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.lg,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  eta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primaryLight,
    padding: Spacing.md,
    borderRadius: Radius.md,
  },
  payments: { gap: Spacing.sm },
  payment: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  paymentSelected: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  paymentDisabled: { opacity: 0.5 },
  paymentIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentIconSelected: { backgroundColor: Colors.primary },
  cashNote: { marginTop: -Spacing.xs },
  summaryCard: { padding: Spacing.lg, gap: Spacing.xs },
  storeRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  storeEmoji: { fontSize: 22, lineHeight: 30 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: Colors.border, marginVertical: Spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  error: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.dangerLight,
    padding: Spacing.md,
    borderRadius: Radius.md,
  },
  footer: {
    padding: Spacing.lg,
    paddingTop: Spacing.md,
    backgroundColor: Colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
  },
});
