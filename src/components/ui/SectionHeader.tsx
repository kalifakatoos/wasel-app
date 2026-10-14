import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from './Text';
import { Colors, Spacing } from '@/constants/theme';
import { t } from '@/i18n/ar';

interface SectionHeaderProps {
  title: string;
  onSeeAll?: () => void;
  actionLabel?: string;
}

export function SectionHeader({ title, onSeeAll, actionLabel = t.common.seeAll }: SectionHeaderProps) {
  return (
    <View style={styles.row}>
      <Text variant="subheading">{title}</Text>
      {onSeeAll ? (
        <Pressable onPress={onSeeAll} hitSlop={8}>
          <Text variant="label" color={Colors.primary}>
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
});
