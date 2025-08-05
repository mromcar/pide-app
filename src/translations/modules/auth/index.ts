// Importaciones explícitas primero
import { loginEn, registerEn } from './en'
import { loginEs, registerEs } from './es'
import { loginFr, registerFr } from './fr'

// Re-exportaciones
export { loginEn, registerEn } from './en'
export { loginEs, registerEs } from './es'
export { loginFr, registerFr } from './fr'
export type { LoginTranslations, RegisterTranslations } from '../../types/auth'

// Objeto combinado usando las constantes ya importadas
export const authTranslations = {
  en: {
    login: loginEn,
    register: registerEn
  },
  es: {
    login: loginEs,
    register: registerEs
  },
  fr: {
    login: loginFr,
    register: registerFr
  }
} as const