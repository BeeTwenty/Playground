// Small pill used for practical info ("Inngjerdet", "Vinteråpen" …).
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '../constants/theme';

export function Tag({ label, active = true }: { label: string; active?: boolean }) {
  return (
    <View style={[styles.tag, active ? styles.active : styles.inactive]}>
      <Text style={[styles.text, active ? styles.activeText : styles.inactiveText]}>
        {active ? '✓ ' : '✕ '}
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    borderRadius: radius.l,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.xs + 2,
    marginRight: spacing.s,
    marginBottom: spacing.s,
  },
  active: { backgroundColor: '#E3F2E9' },
  inactive: { backgroundColor: colors.surface },
  text: { fontSize: 13, fontWeight: '600' },
  activeText: { color: colors.primaryDark },
  inactiveText: { color: colors.textMuted },
});
