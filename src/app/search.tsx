import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { StoreCard } from '@/components/StoreCard';
import { Chip, EmptyState, Screen, Text } from '@/components/ui';
import { Colors, FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { popularSearches } from '@/data/misc';
import { getStoreById } from '@/data/stores';
import { t } from '@/i18n/ar';
import { api, type SearchResult } from '@/services/api';
import { useSearchStore } from '@/store/search';
import { formatAmount } from '@/utils/format';

export default function SearchScreen() {
  const router = useRouter();
  const { recent, addRecent, clearRecent } = useSearchStore();
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);

  // تنظيف المؤقت عند الخروج من الشاشة
  useEffect(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);

  /** تحديث نص البحث مع تأخير بسيط (debounce) قبل الاستعلام */
  const onChangeQuery = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = value.trim();
    const requestId = ++requestIdRef.current;
    if (!q) {
      setResult(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await api.search(q);
        if (requestId === requestIdRef.current) setResult(res);
      } finally {
        if (requestId === requestIdRef.current) setLoading(false);
      }
    }, 250);
  };

  const submit = (q: string) => {
    onChangeQuery(q);
    addRecent(q);
  };

  const hasResults = !!result && (result.stores.length > 0 || result.products.length > 0);

  return (
    <Screen>
      <View style={styles.bar}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.backBtn}>
          <Ionicons name="arrow-forward" size={22} color={Colors.text} />
        </Pressable>
        <View style={styles.inputWrap}>
          <Ionicons name="search" size={20} color={Colors.textMuted} />
          <TextInput
            value={query}
            onChangeText={onChangeQuery}
            onSubmitEditing={() => submit(query)}
            placeholder={t.search.placeholder}
            placeholderTextColor={Colors.textMuted}
            autoFocus
            returnKeyType="search"
            style={styles.input}
          />
          {query.length > 0 && (
            <Pressable onPress={() => onChangeQuery('')} hitSlop={8}>
              <Ionicons name="close-circle" size={20} color={Colors.textMuted} />
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {!query.trim() ? (
          <>
            {recent.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text variant="subheading">{t.search.recent}</Text>
                  <Pressable onPress={clearRecent} hitSlop={8}>
                    <Text variant="label" color={Colors.textSecondary}>
                      {t.search.clear}
                    </Text>
                  </Pressable>
                </View>
                <View style={styles.chips}>
                  {recent.map((r) => (
                    <Chip key={r} label={r} onPress={() => submit(r)} />
                  ))}
                </View>
              </View>
            )}
            <View style={styles.section}>
              <Text variant="subheading" style={styles.px}>
                {t.search.popular}
              </Text>
              <View style={styles.chips}>
                {popularSearches.map((p) => (
                  <Chip key={p} label={`🔥 ${p}`} onPress={() => submit(p)} />
                ))}
              </View>
            </View>
          </>
        ) : loading && !result ? (
          <Text variant="caption" align="center" style={styles.loading}>
            {t.common.loading}
          </Text>
        ) : hasResults ? (
          <>
            {result.stores.length > 0 && (
              <View style={styles.section}>
                <Text variant="subheading" style={styles.px}>
                  {t.search.stores} ({result.stores.length})
                </Text>
                <View style={styles.list}>
                  {result.stores.map((s) => (
                    <StoreCard key={s.id} store={s} />
                  ))}
                </View>
              </View>
            )}
            {result.products.length > 0 && (
              <View style={styles.section}>
                <Text variant="subheading" style={styles.px}>
                  {t.search.products} ({result.products.length})
                </Text>
                {result.products.map((p) => {
                  const store = getStoreById(p.storeId);
                  return (
                    <Pressable
                      key={p.id}
                      onPress={() => {
                        addRecent(query);
                        router.push({ pathname: '/store/[id]', params: { id: p.storeId } });
                      }}
                      style={({ pressed }) => [styles.productRow, pressed && styles.pressed]}>
                      <View style={styles.productThumb}>
                        <Text style={styles.productEmoji}>{p.emoji}</Text>
                      </View>
                      <View style={styles.flex}>
                        <Text variant="bodyBold" numberOfLines={1}>
                          {p.name}
                        </Text>
                        <Text variant="caption" numberOfLines={1}>
                          {store?.emoji} {store?.name}
                        </Text>
                      </View>
                      <Text variant="price">{formatAmount(p.price)}</Text>
                      <Ionicons name="chevron-back" size={16} color={Colors.textMuted} />
                    </Pressable>
                  );
                })}
              </View>
            )}
          </>
        ) : (
          <EmptyState emoji="🔍" title={t.search.noResults} subtitle={t.search.noResultsSubtitle} />
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  px: { paddingHorizontal: Spacing.lg },
  bar: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    height: 48,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  input: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    color: Colors.text,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  content: { paddingVertical: Spacing.md, paddingBottom: Spacing.xxxl, gap: Spacing.xl, flexGrow: 1 },
  section: { gap: Spacing.md, paddingHorizontal: 0 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.lg },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, paddingHorizontal: Spacing.lg },
  loading: { marginTop: Spacing.xxl },
  list: { gap: Spacing.md },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  pressed: { opacity: 0.7 },
  productThumb: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productEmoji: { fontSize: 24, lineHeight: 32 },
});
