import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Badge, Button, Card, EmptyState, Header, Screen, Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { t } from '@/i18n/ar';
import { useAddressStore } from '@/store/addresses';
import type { Address } from '@/types';

const labelIcon = (label: string): keyof typeof Ionicons.glyphMap => {
  if (/بيت|منزل|home/i.test(label)) return 'home';
  if (/عمل|شغل|مكتب|work/i.test(label)) return 'briefcase';
  return 'location';
};

export default function AddressesScreen() {
  const router = useRouter();
  const { addresses, selectedId, select, remove, setDefault } = useAddressStore();

  const confirmRemove = (a: Address) => {
    if (Platform.OS === 'web') {
      if (window.confirm(t.addresses.deleteConfirm)) remove(a.id);
      return;
    }
    Alert.alert(t.common.delete, t.addresses.deleteConfirm, [
      { text: t.common.cancel, style: 'cancel' },
      { text: t.common.delete, style: 'destructive', onPress: () => remove(a.id) },
    ]);
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <Header title={t.addresses.title} />
      {addresses.length === 0 ? (
        <EmptyState emoji="📍" title={t.addresses.empty} subtitle={t.checkout.noAddress} actionLabel={t.addresses.add} onAction={() => router.push('/address-form')} />
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <Text variant="caption" style={styles.hint}>
              {t.addresses.select}
            </Text>
            {addresses.map((a) => {
              const isSelected = a.id === selectedId;
              return (
                <Card
                  key={a.id}
                  onPress={() => {
                    select(a.id);
                    if (router.canGoBack()) router.back();
                  }}
                  style={[styles.card, isSelected && styles.cardSelected]}>
                  <View style={styles.row}>
                    <View style={[styles.icon, isSelected && styles.iconSelected]}>
                      <Ionicons name={labelIcon(a.label)} size={20} color={isSelected ? Colors.textOnPrimary : Colors.primary} />
                    </View>
                    <View style={styles.flex}>
                      <View style={styles.titleRow}>
                        <Text variant="bodyBold">{a.label}</Text>
                        {a.isDefault && <Badge label={t.addresses.default} tone="primary" />}
                      </View>
                      <Text variant="caption">
                        {a.area}، {a.street}
                        {a.building ? `، ${a.building}` : ''}
                      </Text>
                      {a.details ? <Text variant="caption">{a.details}</Text> : null}
                    </View>
                    <Ionicons name={isSelected ? 'radio-button-on' : 'radio-button-off'} size={22} color={isSelected ? Colors.primary : Colors.textMuted} />
                  </View>
                  <View style={styles.actions}>
                    {!a.isDefault && (
                      <Pressable onPress={() => setDefault(a.id)} hitSlop={6}>
                        <Text variant="label" color={Colors.primary}>
                          {t.addresses.setDefault}
                        </Text>
                      </Pressable>
                    )}
                    <View style={styles.flex} />
                    <Pressable onPress={() => router.push({ pathname: '/address-form', params: { id: a.id } })} hitSlop={6}>
                      <Text variant="label" color={Colors.textSecondary}>
                        {t.common.edit}
                      </Text>
                    </Pressable>
                    <Pressable onPress={() => confirmRemove(a)} hitSlop={6}>
                      <Text variant="label" color={Colors.danger}>
                        {t.common.delete}
                      </Text>
                    </Pressable>
                  </View>
                </Card>
              );
            })}
          </ScrollView>
          <View style={styles.footer}>
            <Button title={t.addresses.add} icon="add" fullWidth variant="secondary" onPress={() => router.push('/address-form')} />
          </View>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: Spacing.lg, gap: Spacing.md },
  hint: { marginBottom: -Spacing.xs },
  card: { gap: Spacing.md },
  cardSelected: { borderColor: Colors.primary, borderWidth: 1.5 },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  icon: { width: 40, height: 40, borderRadius: Radius.sm, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  iconSelected: { backgroundColor: Colors.primary },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
  },
  footer: { padding: Spacing.lg },
});
