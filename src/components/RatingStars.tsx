import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';

interface RatingStarsProps {
  value: number;
  onChange?: (v: number) => void;
  size?: number;
}

export function RatingStars({ value, onChange, size = 32 }: RatingStarsProps) {
  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Pressable key={n} disabled={!onChange} onPress={() => onChange?.(n)} hitSlop={4}>
          <Ionicons name={n <= value ? 'star' : 'star-outline'} size={size} color={n <= value ? Colors.star : Colors.textMuted} />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  // اتجاه النجوم من اليسار لليمين ثابت بصرياً
  row: { flexDirection: 'row-reverse', gap: Spacing.xs, justifyContent: 'center' },
});
