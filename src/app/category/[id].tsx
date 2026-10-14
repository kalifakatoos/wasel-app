import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, View } from 'react-native';

import { StoreCard } from '@/components/StoreCard';
import { Chip, EmptyState, Header, Screen, Text } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { categories } from '@/data/categories';
import { stores } from '@/data/stores';
import { t } from '@/i18n/ar';
import type { Store } from '@/types';

type SortKey = 'recommended' | 'rating' | 'time' | 'fee';

const sorters: Record<SortKey, (a: Store, b: Store) => number> = {
  recommended: (a, b) => Number(b.isOpen) - Number(a.isOpen) || Number(!!b.isFeatured) - Number(!!a.isFeatured) || b.rating - a.rating,
  rating: (a, b) => b.rating - a.rating,
  time: (a, b) => a.deliveryTimeMax - b.deliveryTimeMax,
  fee: (a, b) => a.deliveryFee - b.deliveryFee,
};

export default function CategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const category = categories.find((c) => c.id === id);
  const [sort, setSort] = useState<SortKey>('recommended');

  const data = useMemo(() => stores.filter((s) => s.categoryId === id).sort(sorters[sort]), [id, sort]);

  if (!category) {
    return (
      <Screen>
        <EmptyState emoji="🗂️" title={t.common.notFound} actionLabel={t.common.goHome} onAction={() => router.replace('/(tabs)')} />
      </Screen>
    );
  }

  return (
    <Screen>
      <Header title={`${category.emoji} ${category.name}`} subtitle={t.category.storesCount(data.length)} />
      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sortRow}>
          <Text variant="caption" style={styles.sortLabel}>
            {t.category.sortBy}
          </Text>
          {(Object.keys(sorters) as SortKey[]).map((key) => (
            <Chip key={key} label={t.category.sort[key]} selected={sort === key} onPress={() => setSort(key)} />
          ))}
        </ScrollView>
      </View>
      <FlatList
        data={data}
        keyExtractor={(s) => s.id}
        renderItem={({ item }) => <StoreCard store={item} />}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
        contentContainerStyle={[styles.content, data.length === 0 && styles.flex]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<EmptyState emoji={category.emoji} title={t.category.empty} />}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flexGrow: 1 },
  sortRow: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md, gap: Spacing.sm, alignItems: 'center' },
  sortLabel: { marginEnd: Spacing.xs },
  content: { paddingVertical: Spacing.sm, paddingBottom: Spacing.xxxl },
});
