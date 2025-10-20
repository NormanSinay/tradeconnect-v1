/**
 * @fileoverview Internationalization configuration for TradeConnect Frontend
 * @description

Arquitectura recomendada si migras:
  React (componentes interactivos)
    ↓
  Astro (routing y SSR)
    ↓
  shadcn/ui (componentes UI)
    ↓
  Tailwind CSS (estilos)
    ↓
  Radix UI (primitivos accesibles)
    ↓
  React Icons (iconos)

 * @architecture
 * - React: Componentes interactivos con hooks y context
 * - Astro: Routing y Server-Side Rendering (SSR)
 * - shadcn/ui: Componentes UI preconstruidos
 * - Tailwind CSS: Sistema de estilos utilitarios
 * - Radix UI: Primitivos accesibles para componentes
 * - React Icons: Biblioteca de iconos
 *
 * @compatibility SSR: Compatible con Astro SSR
 * @compatibility React: Compatible con React 18+
 * @compatibility TypeScript: Tipos completos incluidos
 * @version 1.0.0
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import es from './locales/es.json';
import en from './locales/en.json';

const resources = {
  es: {
    translation: es,
  },
  en: {
    translation: en,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'es',
    debug: false, // Disable debug logging in production

    // Language detection options
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
    },

    interpolation: {
      escapeValue: false, // React already escapes values
    },

    // React options - Compatible with Astro SSR
    react: {
      useSuspense: false, // Disable suspense for SSR compatibility
    },
  });

export default i18n;