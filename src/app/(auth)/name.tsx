import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';

import { Button, Input, Screen, Text } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { t } from '@/i18n/ar';
import { api } from '@/services/api';
import { useAuthStore } from '@/store/auth';

export default function NameScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const [name, setName] = useState(user?.name ?? '');
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setError(t.auth.nameInvalid);
      return;
    }
    if (!user) return router.replace('/(auth)');
    setLoading(true);
    try {
      await api.updateProfile({ ...user, name: trimmed });
      updateUser({ name: trimmed });
      router.replace('/(tabs)');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
        <View style={styles.body}>
          <Text style={styles.emoji}>👋</Text>
          <Text variant="heading">{t.auth.nameTitle}</Text>
          <Text variant="caption">{t.auth.nameSubtitle}</Text>
          <Input
            placeholder={t.auth.namePlaceholder}
            value={name}
            onChangeText={(v) => {
              setName(v);
              if (error) setError(undefined);
            }}
            error={error}
            autoFocus
            autoCapitalize="words"
            returnKeyType="done"
            onSubmitEditing={submit}
            icon="person-outline"
            containerStyle={styles.input}
          />
        </View>
        <Button title={t.auth.start} size="lg" fullWidth loading={loading} onPress={submit} />
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: Spacing.xl, justifyContent: 'space-between' },
  body: { gap: Spacing.sm, paddingTop: Spacing.xxl },
  emoji: { fontSize: 56, lineHeight: 70, marginBottom: Spacing.sm },
  input: { marginTop: Spacing.lg },
});
