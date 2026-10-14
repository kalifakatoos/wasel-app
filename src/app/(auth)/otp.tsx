import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Button, Header, Screen, Text } from '@/components/ui';
import { Colors, FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { t } from '@/i18n/ar';
import { api } from '@/services/api';
import { useAuthStore } from '@/store/auth';
import { formatPhone } from '@/utils/format';

const CODE_LENGTH = 4;
const RESEND_SECONDS = 60;

export default function OtpScreen() {
  const router = useRouter();
  const pendingPhone = useAuthStore((s) => s.pendingPhone);
  const setUser = useAuthStore((s) => s.setUser);

  const [code, setCode] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const inputRef = useRef<TextInput>(null);

  // لو وصل المستخدم لهذه الشاشة بدون رقم (مثلاً عبر رابط مباشر) نرجعه لشاشة الرقم
  useEffect(() => {
    if (!pendingPhone) router.replace('/(auth)');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [secondsLeft]);

  const verify = async (value = code) => {
    if (value.length !== CODE_LENGTH || !pendingPhone) return;
    setLoading(true);
    setError(undefined);
    try {
      const res = await api.verifyOtp(pendingPhone, value);
      if (!res.ok || !res.user) {
        setError(t.auth.otpInvalid);
        setCode('');
        return;
      }
      setUser(res.user);
      // لو المستخدم ما عنده اسم ننتقل لشاشة الاسم (الحارس في _layout يتكفّل بالباقي)
      if (!res.user.name) router.replace('/(auth)/name');
    } finally {
      setLoading(false);
    }
  };

  const onChange = (v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, CODE_LENGTH);
    setCode(digits);
    if (error) setError(undefined);
    if (digits.length === CODE_LENGTH) verify(digits);
  };

  const resend = async () => {
    if (!pendingPhone || secondsLeft > 0) return;
    await api.sendOtp(pendingPhone);
    setSecondsLeft(RESEND_SECONDS);
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <Header title={t.auth.otpTitle} />
      <View style={styles.container}>
        <Text variant="heading">{t.auth.otpTitle}</Text>
        <Text variant="caption">
          {t.auth.otpSubtitle} <Text variant="label">{pendingPhone ? formatPhone(pendingPhone) : ''}</Text>
        </Text>

        <Pressable onPress={() => inputRef.current?.focus()} style={styles.boxes}>
          {Array.from({ length: CODE_LENGTH }).map((_, i) => {
            const char = code[i] ?? '';
            const active = i === code.length;
            return (
              <View key={i} style={[styles.box, active && styles.boxActive, !!error && styles.boxError]}>
                <Text style={styles.boxText}>{char}</Text>
              </View>
            );
          })}
          <TextInput
            ref={inputRef}
            value={code}
            onChangeText={onChange}
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            autoComplete="sms-otp"
            autoFocus
            maxLength={CODE_LENGTH}
            style={styles.hiddenInput}
            caretHidden
          />
        </Pressable>

        {error ? (
          <Text variant="caption" color={Colors.danger} align="center">
            {error}
          </Text>
        ) : (
          <Text variant="caption" align="center" color={Colors.primary}>
            {t.auth.otpHint}
          </Text>
        )}

        <Button title={t.auth.verify} size="lg" fullWidth loading={loading} disabled={code.length !== CODE_LENGTH} onPress={() => verify()} />

        <View style={styles.footer}>
          <Pressable onPress={resend} disabled={secondsLeft > 0}>
            <Text variant="label" color={secondsLeft > 0 ? Colors.textMuted : Colors.primary}>
              {secondsLeft > 0 ? `${t.auth.resendIn} ${secondsLeft} ث` : t.auth.resend}
            </Text>
          </Pressable>
          <Pressable onPress={() => router.back()}>
            <Text variant="label" color={Colors.textSecondary}>
              {t.auth.changeNumber}
            </Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: Spacing.xl, gap: Spacing.lg },
  boxes: { flexDirection: 'row-reverse', justifyContent: 'center', gap: Spacing.md, marginVertical: Spacing.lg },
  box: {
    width: 60,
    height: 68,
    borderRadius: Radius.md,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxActive: { borderColor: Colors.primary },
  boxError: { borderColor: Colors.danger },
  boxText: { fontFamily: FontFamily.bold, fontSize: FontSize.xxl, color: Colors.text },
  hiddenInput: { position: 'absolute', opacity: 0, width: 1, height: 1 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.sm },
});
