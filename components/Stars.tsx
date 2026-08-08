// Star widgets used everywhere ratings appear.
// <Stars> is read-only display; <StarInput> lets the user tap to pick 1–5.
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from '../constants/theme';

/** Read-only row like ★★★★☆ with the numeric value next to it. */
export function Stars({ value, size = 16 }: { value: number | null; size?: number }) {
  if (value === null) return <Text style={[styles.muted, { fontSize: size }]}>–</Text>;
  const rounded = Math.round(value);
  return (
    <View style={styles.row}>
      <Text style={{ fontSize: size, color: colors.star }}>
        {'★'.repeat(rounded)}
        <Text style={{ color: colors.border }}>{'★'.repeat(5 - rounded)}</Text>
      </Text>
      <Text style={[styles.value, { fontSize: size * 0.85 }]}>{value.toFixed(1)}</Text>
    </View>
  );
}

/** Tappable row of five stars for giving a rating. */
export function StarInput({
  value,
  onChange,
  size = 34,
}: {
  /** 0 = nothing chosen yet */
  value: number;
  onChange: (stars: number) => void;
  size?: number;
}) {
  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Pressable
          key={star}
          onPress={() => onChange(star)}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel={`${star} / 5`}
        >
          <Text
            style={{
              fontSize: size,
              color: star <= value ? colors.star : colors.border,
              paddingHorizontal: 2,
            }}
          >
            ★
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  value: { marginLeft: spacing.s, color: colors.textMuted, fontWeight: '600' },
  muted: { color: colors.textMuted },
});
