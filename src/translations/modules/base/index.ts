import { baseEn } from './en'
import { baseEs } from './es'
import { baseFr } from './fr'
import type { BaseTranslations } from '../../types'

export const baseTranslations: Record<string, BaseTranslations> = {
  en: baseEn,
  es: baseEs,
  fr: baseFr
}