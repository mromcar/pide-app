import { adminEn } from './en'
import { adminEs } from './es'
import { adminFr } from './fr'
import type { EstablishmentAdminTranslations } from '../../types/admin'

export const adminTranslations: Record<string, EstablishmentAdminTranslations> = {
  en: adminEn,
  es: adminEs,
  fr: adminFr
}

export { adminEn, adminEs, adminFr }
export type { EstablishmentAdminTranslations }