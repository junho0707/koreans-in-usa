'use client';

import { useI18n } from '@/src/lib/i18n/context';

export function LanguageToggle() {
  const { locale, setLocale } = useI18n();

  return (
    <button
      onClick={() => setLocale(locale === 'en' ? 'ko' : 'en')}
      className="rounded px-2 py-1 text-xs font-medium text-gray-500 hover:text-foreground"
      title={locale === 'en' ? 'Switch to Korean' : 'Switch to English'}
    >
      {locale === 'en' ? '한국어' : 'EN'}
    </button>
  );
}
