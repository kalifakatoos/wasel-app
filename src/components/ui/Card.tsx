import { Pressable, StyleSheet, View, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

import { Colors, Radius, Shadow, Spacing } from '@/constants/theme';

interface CardProps extends Omit<PressableProps, 'style'> {
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
  children: React.ReactNode;
}

/** بطاقة بيضاء بظل خفيف؛ تصبح قابلة للضغط عند تمرير onPress */
export function Card({ style, padded = true, children, onPress, ...rest }: CardProps) {
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        {...rest}
        style={({ pressed }) => [styles.card, padded && styles.padded, pressed && styles.pressed, style]}>
        {children}
      </Pressable>
    );
  }
  return <View style={[styles.card, padded && styles.padded, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    ...Shadow,
  },
  padded: { padding: Spacing.lg },
  pressed: { opacity: 0.92, transform: [{ scale: 0.995 }] },
});
