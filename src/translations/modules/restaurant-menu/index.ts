// Importaciones explícitas primero
import { restaurantMenuEn } from './en'
import { restaurantMenuEs } from './es'
import { restaurantMenuFr } from './fr'

// Re-exportaciones
export { restaurantMenuEn } from './en'
export { restaurantMenuEs } from './es'
export { restaurantMenuFr } from './fr'
export type { RestaurantMenuTranslations } from '../../types/restaurant-menu'

// Objeto combinado usando las constantes ya importadas
export const restaurantMenuTranslations = {
  en: restaurantMenuEn,
  es: restaurantMenuEs,
  fr: restaurantMenuFr
} as const
