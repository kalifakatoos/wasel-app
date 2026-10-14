import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from 'react-native';

import { Button, Header, Input, Screen, Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { t } from '@/i18n/ar';
import { api } from '@/services/api';
import { useAuthStore } from '@/store/auth';
import { formatPhone } from '@/utils/format';

export default function ProfileEditScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const save = async () => {
    if (!user) return;
    if (name.trim().length < 2) return setError(t.auth.nameInvalid);
    setLoading(true);
    try {
      const patch = { name: name.trim(), email: email.trim() || undefined };
      await api.updateProfile({ ...user, ...patch });
      updateUser(patch);
      router.back();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <Header
        title={t.profile.editProfile}
        right={
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="close" size={24} color={Colors.text} />
          </Pressable>
        }
      />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
        <View style={styles.form}>
          <Input
            label={t.auth.namePlaceholder}
            value={name}
            onChangeText={(v) => {
              setName(v);
              if (error) setError(undefined);
            }}
            icon="person-outline"
            error={error}
          />
          <Input label="البريد الإلكتروني (اختياري)" value={email} onChangeText={setEmail} icon="mail-outline" keyboardType="email-address" autoCapitalize="none" ltr />
          <View>
            <Text variant="label" style={styles.phoneLabel}>
              {t.auth.phoneLabel}
            </Text>
            <View style={styles.phoneBox}>
              <Ionicons name="call-outline" size={20} color={Colors.textMuted} />
              <Text variant="body" color={Colors.textSecondary} style={styles.ltr}>
                {user ? formatPhone(user.phone) : ''}
              </Text>
              <Ionicons name="lock-closed-outline" size={16} color={Colors.textMuted} />
            </View>
          </View>
        </View>
        <Button title={t.common.save} size="lg" fullWidth loading={loading} onPress={save} />
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: Spacing.lg, justifyContent: 'space-between' },
  form: { gap: Spacing.lg },
  phoneLabel: { marginBottom: Spacing.xs, color: Colors.textSecondary },
  phoneBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    minHeight: 52,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.surfaceMuted,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  ltr: { flex: 1, writingDirection: 'ltr' },
});
