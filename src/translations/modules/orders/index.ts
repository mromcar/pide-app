// Importaciones explícitas
import { cartEn, checkoutEn, orderSummaryEn, orderConfirmationEn, orderStatusEn, userRoleEn, orderItemStatusEn } from './en'
import { cartEs, checkoutEs, orderSummaryEs, orderConfirmationEs, orderStatusEs, userRoleEs, orderItemStatusEs } from './es'
import { cartFr, checkoutFr, orderSummaryFr, orderConfirmationFr, orderStatusFr, userRoleFr, orderItemStatusFr } from './fr'

// Re-exportaciones para compatibilidad
export { cartEn, checkoutEn, orderSummaryEn, orderConfirmationEn, orderStatusEn, userRoleEn, orderItemStatusEn } from './en'
export { cartEs, checkoutEs, orderSummaryEs, orderConfirmationEs, orderStatusEs, userRoleEs, orderItemStatusEs } from './es'
export { cartFr, checkoutFr, orderSummaryFr, orderConfirmationFr, orderStatusFr, userRoleFr, orderItemStatusFr } from './fr'
export type { 
  CartTranslations, 
  CheckoutTranslations, 
  OrderSummaryTranslations, 
  OrderConfirmationTranslations, 
  OrderStatusTranslations,
  UserRoleTranslations,
  OrderItemStatusTranslations
} from '../../types/orders'

// Objeto combinado usando las constantes importadas
export const ordersTranslations = {
  en: {
    cart: cartEn,
    checkout: checkoutEn,
    orderSummary: orderSummaryEn,
    orderConfirmation: orderConfirmationEn,
    orderStatus: orderStatusEn,
    userRole: userRoleEn,
    orderItemStatus: orderItemStatusEn
  },
  es: {
    cart: cartEs,
    checkout: checkoutEs,
    orderSummary: orderSummaryEs,
    orderConfirmation: orderConfirmationEs,
    orderStatus: orderStatusEs,
    userRole: userRoleEs,
    orderItemStatus: orderItemStatusEs
  },
  fr: {
    cart: cartFr,
    checkout: checkoutFr,
    orderSummary: orderSummaryFr,
    orderConfirmation: orderConfirmationFr,
    orderStatus: orderStatusFr,
    userRole: userRoleFr,
    orderItemStatus: orderItemStatusFr
  }
} as const