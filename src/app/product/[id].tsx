import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Badge, Button, EmptyState, Header, Input, QuantityStepper, Screen, Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { getProductById } from '@/data/products';
import { getStoreById } from '@/data/stores';
import { t } from '@/i18n/ar';
import { useCartStore, type SelectedOption } from '@/store/cart';
import { formatAmount } from '@/utils/format';

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const product = getProductById(id);
  const store = product ? getStoreById(product.storeId) : undefined;
  const addItem = useCartStore((s) => s.addItem);

  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');
  // groupId -> choiceIds
  const [selected, setSelected] = useState<Record<string, string[]>>(() => {
    const init: Record<string, string[]> = {};
    product?.options?.forEach((g) => {
      // الخيار الإجباري الأحادي يُختار افتراضياً بأول خيار
      init[g.id] = g.required && !g.multiple && g.choices[0] ? [g.choices[0].id] : [];
    });
    return init;
  });

  const selectedOptions: SelectedOption[] = useMemo(() => {
    if (!product?.options) return [];
    return product.options.flatMap((g) =>
      g.choices
        .filter((c) => selected[g.id]?.includes(c.id))
        .map((c) => ({ groupName: g.name, choiceName: c.name, extraPrice: c.extraPrice }))
    );
  }, [product, selected]);

  if (!product || !store) {
    return (
      <Screen>
        <EmptyState emoji="🍽️" title={t.common.notFound} actionLabel={t.common.back} onAction={() => router.back()} />
      </Screen>
    );
  }

  const missingRequired = (product.options ?? []).some((g) => g.required && (selected[g.id]?.length ?? 0) === 0);
  const unitPrice = product.price + selectedOptions.reduce((s, o) => s + o.extraPrice, 0);
  const total = unitPrice * quantity;

  const toggle = (groupId: string, choiceId: string, multiple: boolean) => {
    setSelected((prev) => {
      const current = prev[groupId] ?? [];
      if (!multiple) return { ...prev, [groupId]: [choiceId] };
      return {
        ...prev,
        [groupId]: current.includes(choiceId) ? current.filter((c) => c !== choiceId) : [...current, choiceId],
      };
    });
  };

  const add = () => {
    addItem(product, quantity, selectedOptions, note);
    router.back();
  };

  return (
    <Screen edges={['top', 'bottom']} backgroundColor={Colors.surface}>
      <Header
        title={store.name}
        onBack={() => router.back()}
        right={
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="close" size={24} color={Colors.text} />
          </Pressable>
        }
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={[styles.hero, { backgroundColor: store.color }]}>
          <Text style={styles.heroEmoji}>{product.emoji}</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.titleRow}>
            <Text variant="heading" style={styles.flex}>
              {product.name}
            </Text>
            {product.isPopular && <Badge label="🔥 شائع" tone="accent" size="md" />}
          </View>
          <Text variant="body" color={Colors.textSecondary}>
            {product.description}
          </Text>
          <View style={styles.priceRow}>
            <Text variant="heading" color={Colors.primary}>
              {formatAmount(product.price)}
            </Text>
            {product.oldPrice ? (
              <Text variant="caption" style={styles.oldPrice}>
                {formatAmount(product.oldPrice)}
              </Text>
            ) : null}
          </View>
        </View>

        {product.options?.map((group) => (
          <View key={group.id} style={styles.section}>
            <View style={styles.groupHeader}>
              <Text variant="subheading">{group.name}</Text>
              <Badge label={group.required ? t.common.required : t.common.optional} tone={group.required ? 'primary' : 'neutral'} />
            </View>
            <Text variant="caption">{group.multiple ? t.product.chooseMany : t.product.chooseOne}</Text>
            <View style={styles.choices}>
              {group.choices.map((choice) => {
                const isSelected = selected[group.id]?.includes(choice.id) ?? false;
                return (
                  <Pressable
                    key={choice.id}
                    onPress={() => toggle(group.id, choice.id, group.multiple)}
                    style={[styles.choice, isSelected && styles.choiceSelected]}
                    accessibilityRole={group.multiple ? 'checkbox' : 'radio'}
                    accessibilityState={{ checked: isSelected }}>
                    <Ionicons
                      name={group.multiple ? (isSelected ? 'checkbox' : 'square-outline') : isSelected ? 'radio-button-on' : 'radio-button-off'}
                      size={22}
                      color={isSelected ? Colors.primary : Colors.textMuted}
                    />
                    <Text variant={isSelected ? 'bodyBold' : 'body'} style={styles.flex}>
                      {choice.name}
                    </Text>
                    <Text variant="label" color={choice.extraPrice > 0 ? Colors.text : Colors.textMuted}>
                      {choice.extraPrice > 0 ? `+ ${formatAmount(choice.extraPrice)}` : t.common.free}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}

        <View style={styles.section}>
          <Input
            label={t.product.note}
            placeholder={t.product.notePlaceholder}
            value={note}
            onChangeText={setNote}
            multiline
            maxLength={200}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.qtyRow}>
          <Text variant="bodyBold">{t.product.quantity}</Text>
          <QuantityStepper value={quantity} onChange={setQuantity} />
        </View>
        <Button
          title={t.product.addToCart}
          size="lg"
          fullWidth
          disabled={missingRequired || !product.isAvailable}
          trailing={formatAmount(total)}
          onPress={add}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingBottom: Spacing.xl },
  hero: { height: 200, alignItems: 'center', justifyContent: 'center', marginHorizontal: Spacing.lg, borderRadius: Radius.xl },
  heroEmoji: { fontSize: 96, lineHeight: 116 },
  section: { padding: Spacing.lg, gap: Spacing.xs, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.border },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.xs },
  oldPrice: { textDecorationLine: 'line-through' },
  groupHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  choices: { gap: Spacing.sm, marginTop: Spacing.sm },
  choice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  choiceSelected: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  footer: {
    padding: Spacing.lg,
    gap: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  qtyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
