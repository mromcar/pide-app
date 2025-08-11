import { registerEn } from './en'
import { registerEs } from './es'
import { registerFr } from './fr'

export const registerTranslations = {
  en: registerEn,
  es: registerEs,
  fr: registerFr,
} as const
