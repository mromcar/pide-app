// Importaciones explícitas primero
import { loginEn } from './en'
import { loginEs } from './es'
import { loginFr } from './fr'

// Re-exportaciones
export { loginEn } from './en'
export { loginEs } from './es'
export { loginFr } from './fr'
export type { LoginTranslations } from '../../types/auth'

// Objeto combinado usando las constantes ya importadas
export const authTranslations = {
  en: {
    login: loginEn
  },
  es: {
    login: loginEs
  },
  fr: {
    login: loginFr
  }
} as const
