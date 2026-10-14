import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Button, Chip, Header, Input, Screen, Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { areas } from '@/data/categories';
import { t } from '@/i18n/ar';
import { useAddressStore } from '@/store/addresses';

const quickLabels = ['البيت', 'العمل', 'بيت العائلة'];

export default function AddressFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const { addresses, add, update } = useAddressStore();
  const existing = id ? addresses.find((a) => a.id === id) : undefined;

  const [label, setLabel] = useState(existing?.label ?? '');
  const [area, setArea] = useState(existing?.area ?? '');
  const [street, setStreet] = useState(existing?.street ?? '');
  const [building, setBuilding] = useState(existing?.building ?? '');
  const [details, setDetails] = useState(existing?.details ?? '');
  const [isDefault, setIsDefault] = useState(existing?.isDefault ?? addresses.length === 0);
  const [error, setError] = useState<string | undefined>();

  const save = () => {
    if (!label.trim() || !area.trim() || !street.trim()) {
      setError(t.addresses.required);
      return;
    }
    const payload = {
      label: label.trim(),
      area: area.trim(),
      street: street.trim(),
      building: building.trim() || undefined,
      details: details.trim() || undefined,
      isDefault,
    };
    if (existing) update(existing.id, payload);
    else add(payload);
    router.back();
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <Header
        title={existing ? t.addresses.edit : t.addresses.add}
        right={
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="close" size={24} color={Colors.text} />
          </Pressable>
        }
      />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View>
            <Input label={t.addresses.label} placeholder={t.addresses.labelPlaceholder} value={label} onChangeText={setLabel} icon="bookmark-outline" />
            <View style={styles.quick}>
              {quickLabels.map((q) => (
                <Chip key={q} label={q} selected={label === q} onPress={() => setLabel(q)} />
              ))}
            </View>
          </View>

          <View>
            <Text variant="label" style={styles.fieldLabel}>
              {t.addresses.area}
            </Text>
            <View style={styles.areas}>
              {areas.map((a) => (
                <Chip key={a} label={a} selected={area === a} onPress={() => setArea(a)} />
              ))}
            </View>
          </View>

          <Input label={t.addresses.street} placeholder={t.addresses.streetPlaceholder} value={street} onChangeText={setStreet} icon="map-outline" />
          <Input label={t.addresses.building} placeholder={t.addresses.buildingPlaceholder} value={building} onChangeText={setBuilding} icon="business-outline" />
          <Input label={t.addresses.details} placeholder={t.addresses.detailsPlaceholder} value={details} onChangeText={setDetails} icon="flag-outline" />

          <Pressable onPress={() => setIsDefault((v) => !v)} style={styles.toggleRow} accessibilityRole="checkbox" accessibilityState={{ checked: isDefault }}>
            <Ionicons name={isDefault ? 'checkbox' : 'square-outline'} size={24} color={isDefault ? Colors.primary : Colors.textMuted} />
            <Text variant="body">{t.addresses.setDefault}</Text>
          </Pressable>

          {error ? (
            <Text variant="caption" color={Colors.danger}>
              {error}
            </Text>
          ) : null}
        </ScrollView>
        <View style={styles.footer}>
          <Button title={t.common.save} size="lg" fullWidth onPress={save} />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: Spacing.lg, gap: Spacing.lg, paddingBottom: Spacing.xl },
  quick: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  fieldLabel: { marginBottom: Spacing.sm, color: Colors.textSecondary },
  areas: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  footer: { padding: Spacing.lg, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Colors.border, backgroundColor: Colors.surface },
});
