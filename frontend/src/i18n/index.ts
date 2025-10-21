import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import Backend from 'i18next-http-backend'

import en from './locales/en.json'
import es from './locales/es.json'

const resources = {
  en: {
    translation: en,
  },
  es: {
    translation: es,
  },
}

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'es',
    debug: import.meta.env.DEV || false,

    interpolation: {
      escapeValue: false, // React already escapes values
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'language',
      caches: ['localStorage'],
    },

    backend: {
      loadPath: '/locales/{{lng}}.json',
    },

    react: {
      useSuspense: false,
    },
  })

export default i18n