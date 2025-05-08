import { getTranslation } from '@/translations/ui'
import { LanguageCode } from '@/constants/languages'

export function useTranslation(language: string | LanguageCode) {
    return getTranslation(language)
}
