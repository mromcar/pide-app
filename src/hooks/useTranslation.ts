import { getTranslation } from '@/translations'
import type { LanguageCode } from '@/constants/languages'

export function useTranslation(language: LanguageCode) {
  const translations = getTranslation(language)
  return {
    t: translations
  }
}
