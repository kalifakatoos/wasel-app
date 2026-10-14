import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps, type ViewStyle } from 'react-native';

import { Text } from './Text';
import { Colors, FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  containerStyle?: ViewStyle;
  /** عنصر يظهر في بداية الحقل (مثل رمز الدولة) */
  prefix?: React.ReactNode;
  /** عنصر يظهر في نهاية الحقل (مثل زر) */
  suffix?: React.ReactNode;
  /** محاذاة لليسار — مفيد للأرقام والهواتف */
  ltr?: boolean;
}

export function Input({
  label,
  error,
  hint,
  icon,
  containerStyle,
  prefix,
  suffix,
  ltr = false,
  style,
  onFocus,
  onBlur,
  ...rest
}: InputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={containerStyle}>
      {label ? (
        <Text variant="label" style={styles.label}>
          {label}
        </Text>
      ) : null}
      <View
        style={[
          styles.field,
          focused && styles.fieldFocused,
          !!error && styles.fieldError,
          rest.multiline && styles.fieldMultiline,
        ]}>
        {icon ? <Ionicons name={icon} size={20} color={focused ? Colors.primary : Colors.textMuted} /> : null}
        {prefix}
        <TextInput
          placeholderTextColor={Colors.textMuted}
          selectionColor={Colors.primary}
          {...rest}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={[
            styles.input,
            ltr && styles.inputLtr,
            rest.multiline && styles.inputMultiline,
            style,
          ]}
        />
        {suffix}
      </View>
      {error ? (
        <Text variant="caption" color={Colors.danger} style={styles.helper}>
          {error}
        </Text>
      ) : hint ? (
        <Text variant="caption" style={styles.helper}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { marginBottom: Spacing.xs, color: Colors.textSecondary },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    minHeight: 52,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  fieldFocused: { borderColor: Colors.primary },
  fieldError: { borderColor: Colors.danger },
  fieldMultiline: { alignItems: 'flex-start', paddingVertical: Spacing.sm },
  input: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    color: Colors.text,
    paddingVertical: Spacing.sm,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  inputLtr: { textAlign: 'left', writingDirection: 'ltr' },
  inputMultiline: { minHeight: 80, textAlignVertical: 'top' },
  helper: { marginTop: Spacing.xs },
});
