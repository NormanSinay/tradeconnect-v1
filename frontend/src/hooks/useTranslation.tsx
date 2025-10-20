import { useTranslation as useI18nTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'

interface UseTranslationReturn {
  t: TFunction
  i18n: {
    language: string
    changeLanguage: (lng: string) => Promise<TFunction>
    languages: readonly string[]
  }
}

export const useTranslation = (ns?: string): UseTranslationReturn => {
  const { t, i18n } = useI18nTranslation(ns)

  return {
    t,
    i18n: {
      language: i18n.language,
      changeLanguage: i18n.changeLanguage,
      languages: i18n.languages,
    },
  }
}

// Hook for common translations
export const useCommonTranslation = () => {
  const { t } = useTranslation('common')
  return { t }
}

export const useAuthTranslation = () => {
  const { t } = useTranslation('auth')
  return { t }
}

export const useEventsTranslation = () => {
  const { t } = useTranslation('events')
  return { t }
}

export const useDashboardTranslation = () => {
  const { t } = useTranslation('dashboard')
  return { t }
}

export const useAdminTranslation = () => {
  const { t } = useTranslation('admin')
  return { t }
}

export const useValidationTranslation = () => {
  const { t } = useTranslation('validation')
  return { t }
}

export const useErrorTranslation = () => {
  const { t } = useTranslation('errors')
  return { t }
}