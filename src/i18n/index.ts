import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import de from './locales/de.json';
import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import hi from './locales/hi.json';
import id from './locales/id.json';
import it from './locales/it.json';
import ja from './locales/ja.json';
import ko from './locales/ko.json';
import nl from './locales/nl.json';
import pl from './locales/pl.json';
import ptBR from './locales/pt-BR.json';
import ru from './locales/ru.json';
import tr from './locales/tr.json';
import zhHans from './locales/zh-Hans.json';

/**
 * Supported UI languages. All 15 have real bundled translations; any string a
 * locale is missing still falls back to English per-key. Add a locale JSON + a
 * `resources` entry below to light one up.
 */
export interface LanguageOption {
  code: string;
  native: string;
  english: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'en', native: 'English', english: 'English' },
  { code: 'es', native: 'Español', english: 'Spanish' },
  { code: 'fr', native: 'Français', english: 'French' },
  { code: 'de', native: 'Deutsch', english: 'German' },
  { code: 'pt-BR', native: 'Português', english: 'Portuguese' },
  { code: 'it', native: 'Italiano', english: 'Italian' },
  { code: 'nl', native: 'Nederlands', english: 'Dutch' },
  { code: 'ru', native: 'Русский', english: 'Russian' },
  { code: 'ja', native: '日本語', english: 'Japanese' },
  { code: 'ko', native: '한국어', english: 'Korean' },
  { code: 'zh-Hans', native: '简体中文', english: 'Chinese (Simplified)' },
  { code: 'hi', native: 'हिन्दी', english: 'Hindi' },
  { code: 'tr', native: 'Türkçe', english: 'Turkish' },
  { code: 'pl', native: 'Polski', english: 'Polish' },
  { code: 'id', native: 'Bahasa Indonesia', english: 'Indonesian' },
];

const resources = {
  en: { translation: en },
  es: { translation: es },
  fr: { translation: fr },
  de: { translation: de },
  'pt-BR': { translation: ptBR },
  it: { translation: it },
  nl: { translation: nl },
  ru: { translation: ru },
  ja: { translation: ja },
  ko: { translation: ko },
  'zh-Hans': { translation: zhHans },
  hi: { translation: hi },
  tr: { translation: tr },
  pl: { translation: pl },
  id: { translation: id },
};

/** Languages with a bundled `resources` entry (currently all 15). */
export const AVAILABLE_LANGUAGES: LanguageOption[] = LANGUAGES.filter(
  (l) => l.code in resources
);

const STORE_KEY = '@settings/language';

/** Best-matching supported language for the device, else English. */
function detectDeviceLanguage(): string {
  for (const locale of Localization.getLocales()) {
    const tag = (locale.languageTag ?? '').toLowerCase();
    const base = (locale.languageCode ?? '').toLowerCase();
    const exact = LANGUAGES.find((l) => l.code.toLowerCase() === tag);
    if (exact) return exact.code;
    const byBase = LANGUAGES.find((l) => l.code.toLowerCase().split('-')[0] === base);
    if (byBase) return byBase.code;
  }
  return 'en';
}

i18n.use(initReactI18next).init({
  resources,
  lng: detectDeviceLanguage(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  returnNull: false,
  // No Suspense in RN — render immediately (resources are bundled).
  react: { useSuspense: false },
});

// Apply a saved override once storage resolves (async — UI updates reactively).
AsyncStorage.getItem(STORE_KEY)
  .then((saved) => {
    if (saved && LANGUAGES.some((l) => l.code === saved) && saved !== i18n.language) {
      i18n.changeLanguage(saved);
    }
  })
  .catch(() => {});

export async function setLanguage(code: string): Promise<void> {
  await AsyncStorage.setItem(STORE_KEY, code);
  await i18n.changeLanguage(code);
}

export function currentLanguage(): string {
  return i18n.language;
}

export default i18n;
