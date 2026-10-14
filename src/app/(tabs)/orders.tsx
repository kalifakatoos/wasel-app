import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useShallow } from 'zustand/react/shallow';

import { OrderCard } from '@/components/OrderCard';
import { Chip, EmptyState, Header, Screen } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { t } from '@/i18n/ar';
import { selectActiveOrders, selectPastOrders, useOrdersStore } from '@/store/orders';

export default function OrdersScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<'active' | 'past'>('active');
  const active = useOrdersStore(useShallow(selectActiveOrders));
  const past = useOrdersStore(useShallow(selectPastOrders));
  const data = tab === 'active' ? active : past;

  return (
    <Screen>
      <Header title={t.orders.title} showBack={false} />
      <View style={styles.tabs}>
        <Chip label={`${t.orders.active} (${active.length})`} selected={tab === 'active'} onPress={() => setTab('active')} />
        <Chip label={`${t.orders.past} (${past.length})`} selected={tab === 'past'} onPress={() => setTab('past')} />
      </View>
      <FlatList
        data={data}
        keyExtractor={(o) => o.id}
        renderItem={({ item }) => <OrderCard order={item} />}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
        contentContainerStyle={[styles.content, data.length === 0 && styles.flex]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            emoji="🧾"
            title={t.orders.empty}
            subtitle={t.orders.emptySubtitle}
            actionLabel={t.cart.browse}
            onAction={() => router.push('/(tabs)')}
          />
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flexGrow: 1 },
  tabs: { flexDirection: 'row', gap: Spacing.sm, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md },
  content: { paddingVertical: Spacing.sm, paddingBottom: Spacing.xxxl },
});
