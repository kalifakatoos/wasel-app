import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from './ui';
import { Radius, Spacing } from '@/constants/theme';
import type { Category } from '@/types';

export function CategoryTile({ category }: { category: Category }) {
  const router = useRouter();
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/category/[id]', params: { id: category.id } })}
      style={({ pressed }) => [styles.tile, pressed && styles.pressed]}>
      <View style={[styles.circle, { backgroundColor: category.color }]}>
        <Text style={styles.emoji}>{category.emoji}</Text>
      </View>
      <Text variant="label" align="center" numberOfLines={1}>
        {category.name}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: { alignItems: 'center', gap: Spacing.xs, width: 76 },
  pressed: { opacity: 0.7 },
  circle: { width: 64, height: 64, borderRadius: Radius.xl, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 30, lineHeight: 40 },
});
