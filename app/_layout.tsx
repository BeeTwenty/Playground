// Root layout: wraps the whole app in language + auth providers and defines
// the navigation stack (tabs at the bottom, detail/rating/auth pushed on top).
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';

import { colors } from '../constants/theme';
import { AuthProvider } from '../hooks/useAuth';
import { I18nProvider } from '../hooks/useI18n';

export default function RootLayout() {
  return (
    <I18nProvider>
      <AuthProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerTintColor: colors.primaryDark,
            headerTitleStyle: { color: colors.text },
            contentStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          {/* Titles for the pushed screens are set inside each screen file,
              so they can use the selected language. */}
        </Stack>
      </AuthProvider>
    </I18nProvider>
  );
}
