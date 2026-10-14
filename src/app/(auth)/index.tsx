import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { Button, Input, Screen, Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { t } from '@/i18n/ar';
import { api } from '@/services/api';
import { useAuthStore } from '@/store/auth';
import { isValidLibyanPhone, normalizePhone } from '@/utils/format';

export default function LoginScreen() {
  const router = useRouter();
  const setPendingPhone = useAuthStore((s) => s.setPendingPhone);
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!isValidLibyanPhone(phone)) {
      setError(t.auth.invalidPhone);
      return;
    }
    setError(undefined);
    setLoading(true);
    try {
      const normalized = normalizePhone(phone);
      await api.sendOtp(normalized);
      setPendingPhone(normalized);
      router.push('/(auth)/otp');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.hero}>
            <View style={styles.logo}>
              <Image
                source={require('@/assets/images/splash-icon.png')}
                style={styles.logoImage}
                contentFit="contain"
                accessibilityLabel={t.app.name}
              />
            </View>
            <Text variant="title" color={Colors.primary}>
              {t.app.name}
            </Text>
            <Text variant="body" color={Colors.textSecondary}>
              {t.app.tagline}
            </Text>
          </View>

          <View style={styles.form}>
            <Text variant="heading">{t.auth.welcome}</Text>
            <Text variant="caption" style={styles.subtitle}>
              {t.auth.subtitle}
            </Text>

            <Input
              label={t.auth.phoneLabel}
              placeholder={t.auth.phonePlaceholder}
              keyboardType="phone-pad"
              textContentType="telephoneNumber"
              autoComplete="tel"
              value={phone}
              onChangeText={(v) => {
                setPhone(v.replace(/[^\d\s]/g, '').slice(0, 11));
                if (error) setError(undefined);
              }}
              onSubmitEditing={submit}
              returnKeyType="done"
              error={error}
              ltr
              prefix={
                <View style={styles.prefix}>
                  <Text variant="bodyBold" color={Colors.textSecondary}>
                    🇱🇾 {t.auth.countryCode}
                  </Text>
                </View>
              }
            />

            <Button title={t.auth.sendCode} size="lg" fullWidth loading={loading} onPress={submit} icon="arrow-back" iconPosition="end" />

            <Text variant="caption" align="center" style={styles.terms}>
              {t.auth.terms}
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flexGrow: 1, padding: Spacing.xl, justifyContent: 'center', gap: Spacing.xxl },
  hero: { alignItems: 'center', gap: Spacing.xs },
  logo: {
    width: 96,
    height: 96,
    borderRadius: Radius.xl,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  logoImage: { width: 80, height: 80 },
  form: { gap: Spacing.lg },
  subtitle: { marginTop: -Spacing.md },
  prefix: {
    paddingEnd: Spacing.sm,
    borderEndWidth: 1,
    borderEndColor: Colors.border,
    marginEnd: Spacing.xs,
  },
  terms: { marginTop: Spacing.sm },
});
