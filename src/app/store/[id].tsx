import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, SectionList, StyleSheet, View } from 'react-native';

import { CartBar } from '@/components/CartBar';
import { ProductRow } from '@/components/ProductRow';
import { Badge, Chip, EmptyState, Screen, Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { getProductsByStore } from '@/data/products';
import { getStoreById } from '@/data/stores';
import { t } from '@/i18n/ar';
import { useCartStore } from '@/store/cart';
import type { Product } from '@/types';
import { formatDeliveryTime, formatDistance, formatPrice } from '@/utils/format';

export default function StoreScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const store = getStoreById(id);
  const products = useMemo(() => getProductsByStore(id), [id]);

  const cartItems = useCartStore((s) => s.items);
  const cartStoreId = useCartStore((s) => s.storeId);
  const addItem = useCartStore((s) => s.addItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const clearCart = useCartStore((s) => s.clear);

  const listRef = useRef<SectionList<Product>>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const sections = useMemo(() => {
    const popular = products.filter((p) => p.isPopular);
    const bySection = new Map<string, Product[]>();
    products.forEach((p) => bySection.set(p.section, [...(bySection.get(p.section) ?? []), p]));
    const result = [...bySection.entries()].map(([title, data]) => ({ title, data }));
    return popular.length > 0 ? [{ title: t.store.popular, data: popular }, ...result] : result;
  }, [products]);

  if (!store) {
    return (
      <Screen>
        <EmptyState emoji="🏪" title={t.common.notFound} actionLabel={t.common.goHome} onAction={() => router.replace('/(tabs)')} />
      </Screen>
    );
  }

  /** كمية منتج (بدون خيارات) في السلة */
  const qtyOf = (productId: string) =>
    cartStoreId === store.id
      ? cartItems.filter((i) => i.productId === productId && i.selectedOptions.length === 0 && !i.note).reduce((n, i) => n + i.quantity, 0)
      : 0;

  const keyOf = (productId: string) => cartItems.find((i) => i.productId === productId && i.selectedOptions.length === 0 && !i.note)?.key;

  /** التأكد من المستخدم لو السلة فيها منتجات من متجر آخر */
  const guardDifferentStore = (proceed: () => void) => {
    if (!cartStoreId || cartStoreId === store.id || cartItems.length === 0) return proceed();
    const ok = () => {
      clearCart();
      proceed();
    };
    if (Platform.OS === 'web') {
      if (window.confirm(`${t.store.differentStoreTitle}\n${t.store.differentStoreMessage}`)) ok();
      return;
    }
    Alert.alert(t.store.differentStoreTitle, t.store.differentStoreMessage, [
      { text: t.common.cancel, style: 'cancel' },
      { text: t.store.startNew, style: 'destructive', onPress: ok },
    ]);
  };

  const quickAdd = (product: Product) => guardDifferentStore(() => addItem(product, 1, []));

  const openProduct = (product: Product) =>
    guardDifferentStore(() => router.push({ pathname: '/product/[id]', params: { id: product.id } }));

  const scrollToSection = (index: number) => {
    setActiveSection(sections[index].title);
    listRef.current?.scrollToLocation({ sectionIndex: index, itemIndex: 0, viewOffset: 60, animated: true });
  };

  return (
    <Screen edges={[]}>
      <SectionList
        ref={listRef}
        sections={sections}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        onScrollToIndexFailed={() => {}}
        renderItem={({ item }) => (
          <ProductRow
            product={item}
            quantityInCart={qtyOf(item.id)}
            onPress={() => openProduct(item)}
            onQuickAdd={() => quickAdd(item)}
            onQuantityChange={(q) => {
              const key = keyOf(item.id);
              if (key) updateQuantity(key, q);
            }}
          />
        )}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text variant="subheading">{section.title}</Text>
          </View>
        )}
        ListHeaderComponent={
          <View>
            {/* الغلاف */}
            <View style={[styles.cover, { backgroundColor: store.color }]}>
              <View style={styles.coverBar}>
                <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)'))} style={styles.roundBtn}>
                  <Ionicons name="arrow-forward" size={22} color={Colors.text} />
                </Pressable>
                <Pressable onPress={() => router.push('/search')} style={styles.roundBtn}>
                  <Ionicons name="search" size={20} color={Colors.text} />
                </Pressable>
              </View>
              <Text style={styles.coverEmoji}>{store.emoji}</Text>
            </View>

            {/* معلومات المتجر */}
            <View style={styles.info}>
              <View style={styles.titleRow}>
                <Text variant="title" style={styles.flex}>
                  {store.name}
                </Text>
                <Badge label={store.isOpen ? t.common.open : t.common.closed} tone={store.isOpen ? 'success' : 'danger'} size="md" />
              </View>
              <Text variant="caption">{store.tagline}</Text>
              <View style={styles.tags}>
                {store.tags.map((tag) => (
                  <Badge key={tag} label={tag} />
                ))}
              </View>

              <View style={styles.stats}>
                <Stat icon="star" iconColor={Colors.star} value={`${store.rating}`} label={`${store.ratingCount} ${t.store.rating}`} />
                <View style={styles.statDivider} />
                <Stat icon="time-outline" value={formatDeliveryTime(store.deliveryTimeMin, store.deliveryTimeMax)} label={t.store.deliveryTime} />
                <View style={styles.statDivider} />
                <Stat icon="bicycle-outline" value={formatPrice(store.deliveryFee)} label={t.store.deliveryFee} />
                <View style={styles.statDivider} />
                <Stat icon="basket-outline" value={formatPrice(store.minOrder)} label={t.store.minOrder} />
              </View>

              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={16} color={Colors.textMuted} />
                <Text variant="caption">
                  {store.area} · {formatDistance(store.distanceKm)}
                </Text>
              </View>

              {!store.isOpen && (
                <View style={styles.closedBanner}>
                  <Ionicons name="moon-outline" size={18} color={Colors.danger} />
                  <Text variant="caption" color={Colors.danger} style={styles.flex}>
                    {t.store.closedBanner}
                  </Text>
                </View>
              )}
            </View>

            {/* تنقّل الأقسام */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sectionChips}>
              {sections.map((s, i) => (
                <Chip key={s.title} label={s.title} selected={(activeSection ?? sections[0]?.title) === s.title} onPress={() => scrollToSection(i)} />
              ))}
            </ScrollView>
          </View>
        }
      />
      <CartBar storeId={store.id} />
    </Screen>
  );
}

function Stat({ icon, iconColor = Colors.primary, value, label }: { icon: keyof typeof Ionicons.glyphMap; iconColor?: string; value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <View style={styles.statValueRow}>
        <Ionicons name={icon} size={14} color={iconColor} />
        <Text variant="label" numberOfLines={1}>
          {value}
        </Text>
      </View>
      <Text style={styles.statLabel} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingBottom: 110, backgroundColor: Colors.surface },
  cover: { height: 200, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: Spacing.xl },
  coverBar: {
    position: 'absolute',
    top: Platform.OS === 'web' ? Spacing.md : 48,
    insetInlineStart: Spacing.lg,
    insetInlineEnd: Spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roundBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverEmoji: { fontSize: 72, lineHeight: 88 },
  info: {
    backgroundColor: Colors.surface,
    marginTop: -Radius.xl,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    marginTop: Spacing.sm,
  },
  stat: { flex: 1, alignItems: 'center', gap: 2 },
  statValueRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statLabel: { fontSize: 10, lineHeight: 14, color: Colors.textMuted },
  statDivider: { width: StyleSheet.hairlineWidth, height: 28, backgroundColor: Colors.border },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  closedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.dangerLight,
    padding: Spacing.md,
    borderRadius: Radius.md,
  },
  sectionChips: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
  },
  sectionHeader: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: Spacing.sm, backgroundColor: Colors.surface },
});
