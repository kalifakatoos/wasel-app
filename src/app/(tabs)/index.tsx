import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { CategoryTile } from '@/components/CategoryTile';
import { PromoBanner } from '@/components/PromoBanner';
import { StoreCard } from '@/components/StoreCard';
import { Screen, SectionHeader, Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { categories } from '@/data/categories';
import { stores } from '@/data/stores';
import { t } from '@/i18n/ar';
import { selectCurrentAddress, useAddressStore } from '@/store/addresses';
import { useAuthStore } from '@/store/auth';

export default function HomeScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const address = useAddressStore(selectCurrentAddress);

  const featured = useMemo(() => stores.filter((s) => s.isFeatured && s.isOpen), []);
  const nearby = useMemo(() => [...stores].sort((a, b) => a.distanceKm - b.distanceKm), []);

  return (
    <Screen>
      <FlatList
        data={nearby}
        keyExtractor={(s) => s.id}
        renderItem={({ item }) => <StoreCard store={item} />}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.header}>
            {/* شريط العنوان */}
            <View style={styles.topBar}>
              <Pressable onPress={() => router.push('/addresses')} style={styles.addressBtn} hitSlop={8}>
                <Text variant="caption">{t.home.deliverTo}</Text>
                <View style={styles.addressRow}>
                  <Ionicons name="location" size={18} color={Colors.primary} />
                  <Text variant="bodyBold" numberOfLines={1} style={styles.addressText}>
                    {address ? `${address.label} — ${address.area}` : t.checkout.addAddress}
                  </Text>
                  <Ionicons name="chevron-down" size={16} color={Colors.textSecondary} />
                </View>
              </Pressable>
              <View style={styles.avatar}>
                <Text variant="bodyBold" color={Colors.primaryDark}>
                  {user?.name?.trim().charAt(0) || '👤'}
                </Text>
              </View>
            </View>

            <Text variant="heading" style={styles.greeting}>
              {user?.name ? t.home.greetingName(user.name.split(' ')[0]) : t.home.greeting}
            </Text>

            {/* البحث */}
            <Pressable onPress={() => router.push('/search')} style={styles.search}>
              <Ionicons name="search" size={20} color={Colors.textMuted} />
              <Text variant="body" color={Colors.textMuted} style={styles.flex} numberOfLines={1}>
                {t.home.searchPlaceholder}
              </Text>
            </Pressable>

            {/* الأقسام */}
            <SectionHeader title={t.home.categories} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categories}>
              {categories.map((c) => (
                <CategoryTile key={c.id} category={c} />
              ))}
            </ScrollView>

            <PromoBanner />

            {/* مختارات */}
            <SectionHeader title={t.home.featured} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.featured}>
              {featured.map((s) => (
                <StoreCard key={s.id} store={s} variant="featured" />
              ))}
            </ScrollView>

            <SectionHeader title={t.home.nearby} />
          </View>
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingBottom: Spacing.xxxl },
  header: { gap: Spacing.lg, paddingTop: Spacing.sm },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, gap: Spacing.md },
  addressBtn: { flex: 1 },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  addressText: { flexShrink: 1 },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greeting: { paddingHorizontal: Spacing.lg, marginTop: -Spacing.sm },
  search: {
    marginHorizontal: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    height: 50,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categories: { paddingHorizontal: Spacing.lg, gap: Spacing.sm },
  featured: { paddingHorizontal: Spacing.lg, gap: Spacing.md },
});
