import { getUITranslation } from '@/utils/translations'
import type { LanguageCode } from '@/constants/languages'
import type { UITranslations } from '@/translations/ui'

export function useTranslation(language: LanguageCode) {
  return {
    t: (key: keyof UITranslations) => getUITranslation(key, language)
  }
}
