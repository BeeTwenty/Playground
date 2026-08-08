// Provides the current language and a t() lookup function to every screen.
// Default language follows the phone's locale (Norwegian → nb, otherwise en);
// the user can override it on the profile screen and the choice is remembered.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { format, Language, TranslationKey, translations } from '../lib/i18n';

const STORAGE_KEY = 'lekeplassrater.language';

function deviceLanguage(): Language {
  const code = getLocales()[0]?.languageCode ?? '';
  // 'nb' (bokmål), 'nn' (nynorsk) and plain 'no' all get the Norwegian UI.
  return ['nb', 'nn', 'no'].includes(code) ? 'nb' : 'en';
}

interface I18nContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(deviceLanguage);

  // Load a previously saved language choice, if any.
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (saved === 'nb' || saved === 'en') setLanguageState(saved);
    });
  }, []);

  const value = useMemo<I18nContextValue>(
    () => ({
      language,
      setLanguage: (lang) => {
        setLanguageState(lang);
        AsyncStorage.setItem(STORAGE_KEY, lang).catch(() => {
          // Not being able to persist the choice is harmless; ignore.
        });
      },
      t: (key, params) => format(translations[language][key], params),
    }),
    [language]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside <I18nProvider>');
  return ctx;
}
