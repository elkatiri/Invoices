'use client';

import { useI18n } from '@/lib/i18n/context';
import { localeNames, type Locale } from '@/lib/i18n/translations';
import { Globe } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const locales: Locale[] = ['en', 'fr', 'ar'];

export default function LanguageSwitcher({ variant = 'default' }: { variant?: 'default' | 'compact' }) {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={
          variant === 'compact'
            ? 'p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'
            : 'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm text-gray-700 dark:text-gray-300'
        }
        aria-label="Change language"
      >
        <Globe className="w-4 h-4" />
        {variant !== 'compact' && <span>{localeNames[locale]}</span>}
      </button>

      {open && (
        <div className="absolute top-full mt-1 end-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 z-50 min-w-[140px]">
          {locales.map((l) => (
            <button
              key={l}
              onClick={() => { setLocale(l); setOpen(false); }}
              className={`w-full text-start px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 ${
                l === locale ? 'font-semibold text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              {localeNames[l]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
