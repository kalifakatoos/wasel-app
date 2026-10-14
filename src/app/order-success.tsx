import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button, Screen, Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { t } from '@/i18n/ar';
import { useOrdersStore } from '@/store/orders';
import { formatDeliveryTime } from '@/utils/format';

export default function OrderSuccessScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const order = useOrdersStore((s) => s.orders.find((o) => o.id === id));

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.container}>
        <View style={styles.badge}>
          <Ionicons name="checkmark" size={56} color={Colors.textOnPrimary} />
        </View>
        <Text variant="title" align="center">
          {t.checkout.success}
        </Text>
        <Text variant="body" color={Colors.textSecondary} align="center" style={styles.subtitle}>
          {t.checkout.successSubtitle}
        </Text>

        {order ? (
          <View style={styles.summary}>
            <Text variant="caption" align="center">
              {t.orders.orderNumber(order.number)} · {order.storeName}
            </Text>
            <Text variant="bodyBold" align="center" color={Colors.primary}>
              {t.checkout.estimated}: {formatDeliveryTime(Math.max(10, order.estimatedMinutes - 15), order.estimatedMinutes)}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.footer}>
        <Button
          title={t.checkout.trackOrder}
          size="lg"
          fullWidth
          icon="navigate-outline"
          onPress={() => router.replace({ pathname: '/order/[id]', params: { id } })}
        />
        <Button title={t.common.goHome} size="lg" fullWidth variant="ghost" onPress={() => router.replace('/(tabs)')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl, gap: Spacing.md },
  badge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  subtitle: { maxWidth: 300 },
  summary: { marginTop: Spacing.lg, gap: Spacing.xs },
  footer: { padding: Spacing.lg, gap: Spacing.sm },
});
