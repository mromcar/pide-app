export type LanguageCode = 'es' | 'en' | 'fr'

export interface Language {
  code: LanguageCode
  name: string
  flag: string
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' }
]

export const DEFAULT_LANGUAGE: LanguageCode = 'es'
