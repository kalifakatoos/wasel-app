import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { Text } from './ui';
import { Colors, Spacing } from '@/constants/theme';
import { t } from '@/i18n/ar';
import type { Order, OrderStatus } from '@/types';
import { formatTime } from '@/utils/format';

const STEPS: { status: OrderStatus; icon: keyof typeof Ionicons.glyphMap }[] = [
  { status: 'pending', icon: 'receipt-outline' },
  { status: 'confirmed', icon: 'checkmark-circle-outline' },
  { status: 'preparing', icon: 'restaurant-outline' },
  { status: 'on_the_way', icon: 'bicycle-outline' },
  { status: 'delivered', icon: 'home-outline' },
];

export function OrderTimeline({ order }: { order: Order }) {
  if (order.status === 'cancelled') {
    return (
      <View style={styles.cancelled}>
        <Ionicons name="close-circle" size={28} color={Colors.danger} />
        <View style={styles.flex}>
          <Text variant="bodyBold" color={Colors.danger}>
            {t.tracking.statusLabel.cancelled}
          </Text>
          <Text variant="caption">{t.tracking.statusDesc.cancelled}</Text>
        </View>
      </View>
    );
  }

  const currentIndex = STEPS.findIndex((s) => s.status === order.status);

  return (
    <View>
      {STEPS.map((step, index) => {
        const done = index < currentIndex;
        const active = index === currentIndex;
        const event = order.timeline.find((e) => e.status === step.status);
        const isLast = index === STEPS.length - 1;
        const color = done || active ? Colors.primary : Colors.textMuted;

        return (
          <View key={step.status} style={styles.step}>
            <View style={styles.rail}>
              <View style={[styles.dot, (done || active) && styles.dotActive, active && styles.dotCurrent]}>
                <Ionicons name={done ? 'checkmark' : step.icon} size={active ? 18 : 14} color={done || active ? Colors.textOnPrimary : Colors.textMuted} />
              </View>
              {!isLast && <View style={[styles.line, done && styles.lineDone]} />}
            </View>
            <View style={[styles.content, isLast && styles.contentLast]}>
              <View style={styles.titleRow}>
                <Text variant={active ? 'bodyBold' : 'body'} color={active ? Colors.text : color}>
                  {t.tracking.statusLabel[step.status]}
                </Text>
                {event ? <Text variant="caption">{formatTime(event.at)}</Text> : null}
              </View>
              {active ? <Text variant="caption">{t.tracking.statusDesc[step.status]}</Text> : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  step: { flexDirection: 'row', gap: Spacing.md },
  rail: { alignItems: 'center', width: 36 },
  dot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.surfaceMuted,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  dotCurrent: { width: 36, height: 36, borderRadius: 18, borderColor: Colors.primaryLight, borderWidth: 4 },
  line: { flex: 1, width: 2, backgroundColor: Colors.border, marginVertical: 2, minHeight: 22 },
  lineDone: { backgroundColor: Colors.primary },
  content: { flex: 1, paddingBottom: Spacing.lg, paddingTop: 4 },
  contentLast: { paddingBottom: 0 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cancelled: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.dangerLight,
    padding: Spacing.lg,
    borderRadius: 12,
  },
});
