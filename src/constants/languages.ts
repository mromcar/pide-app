export const AVAILABLE_LANGUAGES: { code: string; label: string }[] = [
  { code: 'es', label: 'Español' },
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' }
]

export type AvailableLanguage = (typeof AVAILABLE_LANGUAGES)[number]
export type LanguageCode = AvailableLanguage['code']

export const DEFAULT_LANGUAGE = 'es'
