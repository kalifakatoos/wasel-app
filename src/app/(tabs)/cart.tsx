import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { CartItemRow } from '@/components/CartItemRow';
import { Button, Card, EmptyState, Header, Input, Screen, Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { getStoreById } from '@/data/stores';
import { t } from '@/i18n/ar';
import { api } from '@/services/api';
import { computeTotals, useCartStore } from '@/store/cart';
import { formatAmount, formatPrice } from '@/utils/format';

function confirm(title: string, message: string, onOk: () => void) {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n${message}`)) onOk();
    return;
  }
  Alert.alert(title, message, [
    { text: t.common.cancel, style: 'cancel' },
    { text: t.common.confirm, style: 'destructive', onPress: onOk },
  ]);
}

export default function CartScreen() {
  const router = useRouter();
  const { items, storeId, promo, updateQuantity, clear, setPromo } = useCartStore();
  const store = storeId ? getStoreById(storeId) : undefined;

  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState<string | undefined>();
  const [applying, setApplying] = useState(false);

  const totals = useMemo(() => computeTotals(items, store?.deliveryFee ?? 0, promo), [items, store, promo]);
  const belowMin = !!store && totals.subtotal < store.minOrder;

  const applyPromo = async () => {
    if (!promoInput.trim()) return;
    setApplying(true);
    setPromoError(undefined);
    try {
      const found = await api.validatePromo(promoInput);
      if (!found) return setPromoError(t.cart.promoInvalid);
      if (found.minOrder && totals.subtotal < found.minOrder)
        return setPromoError(t.cart.promoMinOrder(formatAmount(found.minOrder)));
      setPromo(found);
      setPromoInput('');
    } finally {
      setApplying(false);
    }
  };

  if (items.length === 0 || !store) {
    return (
      <Screen>
        <Header title={t.cart.title} showBack={false} />
        <EmptyState
          emoji="🛒"
          title={t.cart.empty}
          subtitle={t.cart.emptySubtitle}
          actionLabel={t.cart.browse}
          onAction={() => router.push('/(tabs)')}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <Header
        title={t.cart.title}
        showBack={false}
        right={
          <Pressable
            hitSlop={8}
            onPress={() => confirm(t.cart.clear, t.cart.clearConfirm, clear)}
            accessibilityLabel={t.cart.clear}>
            <Ionicons name="trash-outline" size={22} color={Colors.danger} />
          </Pressable>
        }
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* المتجر */}
        <Pressable
          onPress={() => router.push({ pathname: '/store/[id]', params: { id: store.id } })}
          style={styles.storeRow}>
          <View style={[styles.storeThumb, { backgroundColor: store.color }]}>
            <Text style={styles.storeEmoji}>{store.emoji}</Text>
          </View>
          <View style={styles.flex}>
            <Text variant="caption">{t.cart.from}</Text>
            <Text variant="bodyBold">{store.name}</Text>
          </View>
          <Text variant="label" color={Colors.primary}>
            {t.cart.addMore}
          </Text>
          <Ionicons name="chevron-back" size={16} color={Colors.primary} />
        </Pressable>

        {/* المنتجات */}
        <Card padded={false} style={styles.itemsCard}>
          {items.map((item, index) => (
            <View key={item.key} style={[styles.itemWrap, index < items.length - 1 && styles.itemDivider]}>
              <CartItemRow item={item} onQuantityChange={(q) => updateQuantity(item.key, q)} />
            </View>
          ))}
        </Card>

        {belowMin && (
          <View style={styles.warning}>
            <Ionicons name="alert-circle" size={18} color={Colors.warning} />
            <Text variant="caption" color={Colors.warning} style={styles.flex}>
              {t.cart.minOrderWarning(formatAmount(store.minOrder))}
            </Text>
          </View>
        )}

        {/* كود الخصم */}
        {promo ? (
          <View style={styles.promoApplied}>
            <Ionicons name="pricetag" size={18} color={Colors.success} />
            <View style={styles.flex}>
              <Text variant="label" color={Colors.success}>
                {t.cart.promoApplied(promo.code)}
              </Text>
              <Text variant="caption">{promo.description}</Text>
            </View>
            <Pressable onPress={() => setPromo(null)} hitSlop={8}>
              <Ionicons name="close-circle" size={20} color={Colors.textMuted} />
            </Pressable>
          </View>
        ) : (
          <Input
            placeholder={t.cart.promoPlaceholder}
            value={promoInput}
            onChangeText={(v) => {
              setPromoInput(v.toUpperCase());
              if (promoError) setPromoError(undefined);
            }}
            autoCapitalize="characters"
            autoCorrect={false}
            icon="pricetag-outline"
            error={promoError}
            onSubmitEditing={applyPromo}
            suffix={<Button title={t.cart.apply} size="sm" variant="secondary" loading={applying} onPress={applyPromo} />}
          />
        )}

        {/* الملخص */}
        <Card style={styles.summary}>
          <Row label={t.cart.subtotal} value={formatAmount(totals.subtotal)} />
          <Row label={t.cart.deliveryFee} value={formatPrice(totals.deliveryFee)} />
          {totals.discount > 0 && <Row label={t.cart.discount} value={`- ${formatAmount(totals.discount)}`} color={Colors.success} />}
          <View style={styles.divider} />
          <Row label={t.cart.total} value={formatAmount(totals.total)} bold />
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={t.cart.checkout}
          size="lg"
          fullWidth
          disabled={belowMin || !store.isOpen}
          trailing={formatAmount(totals.total)}
          onPress={() => router.push('/checkout')}
        />
      </View>
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

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: Spacing.lg, gap: Spacing.lg, paddingBottom: Spacing.xxl },
  storeRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  storeThumb: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  storeEmoji: { fontSize: 24, lineHeight: 32 },
  itemsCard: { paddingHorizontal: Spacing.lg },
  itemWrap: {},
  itemDivider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.border },
  warning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.warningLight,
    padding: Spacing.md,
    borderRadius: 12,
  },
  promoApplied: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.successLight,
    padding: Spacing.md,
    borderRadius: 12,
  },
  summary: { gap: Spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: Colors.border, marginVertical: Spacing.xs },
  footer: {
    padding: Spacing.lg,
    paddingTop: Spacing.md,
    backgroundColor: Colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
  },
});
