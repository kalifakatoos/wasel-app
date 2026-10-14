import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { Text } from './ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { t } from '@/i18n/ar';

export function PromoBanner() {
  return (
    <View style={styles.banner}>
      <View style={styles.flex}>
        <Text variant="heading" color={Colors.textOnPrimary}>
          {t.home.promoTitle} 🛵
        </Text>
        <Text variant="body" color="rgba(255,255,255,0.9)">
          {t.home.promoSubtitle}{' '}
          <Text variant="bodyBold" color={Colors.accent}>
            {t.home.promoCode}
          </Text>
        </Text>
      </View>
      <View style={styles.iconWrap}>
        <Ionicons name="gift" size={40} color={Colors.accent} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  banner: {
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.primaryDark,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    overflow: 'hidden',
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
