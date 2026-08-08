// The app's standard buttons, so every screen looks the same.
import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { colors, radius, spacing } from '../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  /** 'primary' = filled green, 'secondary' = outlined, 'danger' = red text */
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  /** Shows a spinner and blocks presses while something is saving. */
  loading?: boolean;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
}: ButtonProps) {
  const blocked = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={blocked}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        blocked && styles.disabled,
        pressed && !blocked && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.white : colors.primary} />
      ) : (
        <Text style={[styles.text, styles[`${variant}Text`]]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.m,
    paddingVertical: spacing.m - 2,
    paddingHorizontal: spacing.l,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.primary },
  danger: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.danger },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.8 },
  text: { fontSize: 16, fontWeight: '600' },
  primaryText: { color: colors.white },
  secondaryText: { color: colors.primary },
  dangerText: { color: colors.danger },
});
