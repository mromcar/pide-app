import type { LanguageCode } from '@/constants/languages'
import type { UITranslations } from '@/translations/ui'

type TranslatableField = 'name' | 'description' | 'variant_description'

type TranslationWithCode = {
  language_code: string
  [key: string]: string | null | undefined
}

export function getTranslation<
  T extends { [K in TranslatableField]?: string | null },
  F extends TranslatableField = 'name'
>(
  item: T,
  translations: TranslationWithCode[] | undefined,
  languageCode: LanguageCode,
  field: F = 'name' as F
): string {
  if (!translations?.length) {
    return (item[field] as string) || ''
  }

  const translation = translations.find(t => t.language_code === languageCode)
  return (translation?.[field] as string) || (item[field] as string) || ''
}

// Helper for UI translations
export function getUITranslation(
  key: keyof UITranslations,
  language: LanguageCode
): string {
  return getTranslation({ name: key }, [], language)
}
