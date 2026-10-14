import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Card, Header, Screen, Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { t } from '@/i18n/ar';
import { useAddressStore } from '@/store/addresses';
import { useAuthStore } from '@/store/auth';
import { useCartStore } from '@/store/cart';
import { useOrdersStore } from '@/store/orders';
import { formatDate, formatPhone } from '@/utils/format';

type IconName = keyof typeof Ionicons.glyphMap;

interface MenuItem {
  icon: IconName;
  label: string;
  value?: string;
  onPress?: () => void;
  tone?: 'default' | 'danger';
}

export default function ProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const clearCart = useCartStore((s) => s.clear);
  const ordersCount = useOrdersStore((s) => s.orders.length);
  const addressesCount = useAddressStore((s) => s.addresses.length);

  const doLogout = () => {
    clearCart();
    logout();
  };

  const confirmLogout = () => {
    if (Platform.OS === 'web') {
      if (window.confirm(t.auth.logoutConfirm)) doLogout();
      return;
    }
    Alert.alert(t.auth.logout, t.auth.logoutConfirm, [
      { text: t.common.cancel, style: 'cancel' },
      { text: t.auth.logout, style: 'destructive', onPress: doLogout },
    ]);
  };

  const sections: MenuItem[][] = [
    [
      { icon: 'person-outline', label: t.profile.editProfile, onPress: () => router.push('/profile-edit') },
      { icon: 'location-outline', label: t.profile.addresses, value: String(addressesCount), onPress: () => router.push('/addresses') },
      { icon: 'wallet-outline', label: t.profile.payments, value: t.payment.cash },
    ],
    [
      { icon: 'notifications-outline', label: t.profile.notifications },
      { icon: 'language-outline', label: t.profile.language, value: t.profile.arabic },
      { icon: 'help-circle-outline', label: t.profile.support },
      { icon: 'information-circle-outline', label: t.profile.about, value: `${t.profile.version} ${Constants.expoConfig?.version ?? ''}` },
    ],
    [{ icon: 'log-out-outline', label: t.auth.logout, onPress: confirmLogout, tone: 'danger' }],
  ];

  return (
    <Screen>
      <Header title={t.profile.title} showBack={false} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* بطاقة المستخدم */}
        <Card style={styles.userCard}>
          <View style={styles.avatar}>
            <Text variant="title" color={Colors.textOnPrimary}>
              {user?.name?.trim().charAt(0) || '👤'}
            </Text>
          </View>
          <View style={styles.flex}>
            <Text variant="subheading" numberOfLines={1}>
              {user?.name}
            </Text>
            <Text variant="caption" style={styles.ltrText}>
              {user ? formatPhone(user.phone) : ''}
            </Text>
            {user ? (
              <Text variant="caption">
                {t.profile.memberSince} {formatDate(user.createdAt)}
              </Text>
            ) : null}
          </View>
          <View style={styles.stat}>
            <Text variant="heading" color={Colors.primary}>
              {ordersCount}
            </Text>
            <Text variant="caption">{t.profile.ordersCount}</Text>
          </View>
        </Card>

        {sections.map((section, i) => (
          <Card key={i} padded={false}>
            {section.map((item, j) => (
              <Pressable
                key={item.label}
                onPress={item.onPress}
                disabled={!item.onPress}
                style={({ pressed }) => [styles.menuItem, j < section.length - 1 && styles.menuDivider, pressed && styles.pressed]}>
                <View style={[styles.menuIcon, item.tone === 'danger' && styles.menuIconDanger]}>
                  <Ionicons name={item.icon} size={20} color={item.tone === 'danger' ? Colors.danger : Colors.primary} />
                </View>
                <Text variant="body" color={item.tone === 'danger' ? Colors.danger : Colors.text} style={styles.flex}>
                  {item.label}
                </Text>
                {item.value ? <Text variant="caption">{item.value}</Text> : null}
                {item.onPress && item.tone !== 'danger' ? (
                  <Ionicons name="chevron-back" size={18} color={Colors.textMuted} />
                ) : null}
              </Pressable>
            ))}
          </Card>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: Spacing.lg, gap: Spacing.lg, paddingBottom: Spacing.xxxl },
  userCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: Radius.xl,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ltrText: { writingDirection: 'ltr' },
  stat: { alignItems: 'center' },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.lg },
  menuDivider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.border },
  pressed: { backgroundColor: Colors.surfaceMuted },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIconDanger: { backgroundColor: Colors.dangerLight },
});
