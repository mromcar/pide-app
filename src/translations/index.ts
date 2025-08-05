import type { UITranslation } from './types'
import type { LanguageCode } from '@/constants/languages'
import { DEFAULT_LANGUAGE } from '@/constants/languages'
import { buildTranslations } from './utils/builder'

type Language = 'en' | 'es' | 'fr'

export const translations: Record<Language, UITranslation> = {
  en: buildTranslations('en'),
  es: buildTranslations('es'),
  fr: buildTranslations('fr')
}

// Función de compatibilidad con el sistema anterior
export function getTranslation(lang: LanguageCode): UITranslation {
  const language = lang as Language;
  return translations[language] || translations[DEFAULT_LANGUAGE as Language];
}

export type { UITranslation }
export * from './types'