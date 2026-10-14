import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from './Text';
import { Colors, FontFamily, FontSize, Radius } from '@/constants/theme';

interface QuantityStepperProps {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  size?: 'sm' | 'md';
  /** إظهار أيقونة سلة المهملات عند الوصول للحد الأدنى */
  allowRemove?: boolean;
}

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  size = 'md',
  allowRemove = false,
}: QuantityStepperProps) {
  const btn = size === 'sm' ? 30 : 38;
  const atMin = value <= min;
  const decrementIcon = atMin && allowRemove ? 'trash-outline' : 'remove';

  return (
    <View style={[styles.wrap, { height: btn }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="تقليل الكمية"
        disabled={atMin && !allowRemove}
        onPress={() => onChange(value - 1)}
        style={({ pressed }) => [styles.btn, { width: btn }, pressed && styles.pressed, atMin && !allowRemove && styles.disabled]}>
        <Ionicons name={decrementIcon} size={size === 'sm' ? 16 : 20} color={atMin && allowRemove ? Colors.danger : Colors.primary} />
      </Pressable>
      <Text style={[styles.value, size === 'sm' && styles.valueSm]}>{value}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="زيادة الكمية"
        disabled={value >= max}
        onPress={() => onChange(value + 1)}
        style={({ pressed }) => [styles.btn, { width: btn }, pressed && styles.pressed, value >= max && styles.disabled]}>
        <Ionicons name="add" size={size === 'sm' ? 16 : 20} color={Colors.primary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  btn: { height: '100%', alignItems: 'center', justifyContent: 'center' },
  pressed: { backgroundColor: 'rgba(15,157,122,0.15)' },
  disabled: { opacity: 0.35 },
  value: {
    minWidth: 28,
    textAlign: 'center',
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    color: Colors.primaryDark,
  },
  valueSm: { minWidth: 24, fontSize: FontSize.sm },
});
