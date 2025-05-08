import type { CategoryTranslation, ProductTranslation, AllergenTranslation } from '@/types/menu'

export function getTranslation<T extends { name: string }>(
  item: T,
  translations: Array<{ language_code: string; name: string }> | undefined,
  languageCode: string
): string {
  if (!translations?.length) return item.name

  const translation = translations.find(t => t.language_code === languageCode)
  return translation?.name || item.name
}
