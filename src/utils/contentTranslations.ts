import type {
  CategoryTranslation,
  ProductTranslation,
  AllergenTranslation
} from '@/types/menu'
import { LanguageCode } from '@/constants/languages'

export function getContentTranslation<T extends { name: string }>(
  item: T,
  translations: Array<{ language_code: string; name: string }> | undefined,
  languageCode: LanguageCode
): string {
  if (!translations?.length) return item.name

  const translation = translations.find(t => t.language_code === languageCode)
  return translation?.name || item.name
}

export function getDescriptionTranslation<T extends { description?: string | null }>(
  item: T,
  translations: Array<{ language_code: string; description?: string | null }> | undefined,
  languageCode: LanguageCode
): string | null {
  if (!translations?.length) return item.description || null

  const translation = translations.find(t => t.language_code === languageCode)
  return translation?.description || item.description || null
}
