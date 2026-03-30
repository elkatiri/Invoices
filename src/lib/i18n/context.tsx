'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { translations, rtlLocales, type Locale, type Translations } from './translations';

type TranslationContext = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translations;
  isRtl: boolean;
};

const I18nContext = createContext<TranslationContext | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    const saved = localStorage.getItem('locale') as Locale | null;
    if (saved && translations[saved]) {
      setLocaleState(saved);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = rtlLocales.includes(locale) ? 'rtl' : 'ltr';
  }, [locale]);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('locale', newLocale);
  }, []);

  const isRtl = rtlLocales.includes(locale);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t: translations[locale], isRtl }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
