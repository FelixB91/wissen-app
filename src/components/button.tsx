import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, fontSizes, radii, spacing } from '@/theme';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
};

export function Button({ label, onPress, disabled = false, variant = 'primary' }: Props) {
  const secondary = variant === 'secondary';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        secondary && styles.secondary,
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}>
      <Text style={[styles.label, secondary && styles.labelSecondary]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radii.md,
  },
  secondary: { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border },
  disabled: { opacity: 0.4 },
  pressed: { opacity: 0.8 },
  label: { fontSize: fontSizes.body, fontWeight: '700', color: colors.onPrimary },
  labelSecondary: { color: colors.text },
});
