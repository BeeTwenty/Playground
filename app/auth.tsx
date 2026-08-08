// Login / signup screen (one screen, toggle between the two modes).
// Uses Supabase Auth with email + password.
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Button } from '../components/Button';
import { colors, radius, spacing } from '../constants/theme';
import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../hooks/useI18n';

export default function AuthScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const { signIn, signUp } = useAuth();

  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    setMessage(null);
    if (mode === 'signIn') {
      const { error } = await signIn(email.trim(), password);
      setBusy(false);
      if (error) {
        setMessage(error);
      } else {
        router.back(); // logged in — return to where the user came from
      }
    } else {
      const { error } = await signUp(email.trim(), password);
      setBusy(false);
      // Supabase sends a confirmation email by default; tell the user to check it.
      setMessage(error ?? t('checkEmail'));
    }
  }

  const canSubmit = email.trim().includes('@') && password.length >= 6;

  return (
    <>
      <Stack.Screen options={{ title: t(mode) }} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>{t('appName')}</Text>
          <Text style={styles.explainer}>{t('authRequiredExplainer')}</Text>

          <Text style={styles.label}>{t('email')}</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            placeholder="deg@eksempel.no"
            placeholderTextColor={colors.textMuted}
          />

          <Text style={styles.label}>{t('password')}</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete={mode === 'signIn' ? 'current-password' : 'new-password'}
            placeholder={t('passwordHint')}
            placeholderTextColor={colors.textMuted}
          />

          {message && <Text style={styles.message}>{message}</Text>}

          <View style={{ marginTop: spacing.l }}>
            <Button title={t(mode)} onPress={submit} loading={busy} disabled={!canSubmit} />
          </View>

          {/* Switch between login and signup */}
          <Pressable
            onPress={() => {
              setMode(mode === 'signIn' ? 'signUp' : 'signIn');
              setMessage(null);
            }}
            style={styles.switchMode}
          >
            <Text style={styles.switchModeText}>
              {mode === 'signIn' ? t('noAccount') : t('haveAccount')}{' '}
              <Text style={styles.switchModeLink}>
                {mode === 'signIn' ? t('signUp') : t('signIn')}
              </Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.l, paddingTop: spacing.xl },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primaryDark,
    textAlign: 'center',
    marginBottom: spacing.s,
  },
  explainer: { color: colors.textMuted, textAlign: 'center', marginBottom: spacing.l },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.m,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.m,
    padding: spacing.m - 2,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.white,
  },
  message: { color: colors.danger, marginTop: spacing.m, textAlign: 'center' },
  switchMode: { marginTop: spacing.l, alignItems: 'center' },
  switchModeText: { color: colors.textMuted, fontSize: 15 },
  switchModeLink: { color: colors.primary, fontWeight: '700' },
});
