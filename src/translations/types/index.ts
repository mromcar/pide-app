export * from './base'
export * from './auth'
export * from './navigation'
export * from './menu'
export * from './orders'
export * from './admin'

// Importa explícitamente los tipos usados en UITranslation
import type { NavbarTranslations, MainMenuTranslations, RedirectTranslations } from './navigation'
import type { CartTranslations, CheckoutTranslations, OrderSummaryTranslations, OrderConfirmationTranslations, OrderStatusTranslations } from './orders'
import type { RestaurantMenuTranslations } from './restaurant-menu'
import type { LoginTranslations, RegisterTranslations } from './auth'
import type { EstablishmentAdminTranslations } from './admin'

export interface UITranslation {
  // Base
  backToCategories: string
  orderPlaced: string
  finishOrder: string
  cancelOrder: string
  placeAnotherOrder: string
  allergens: string
  variants: string
  total: string
  notes: string
  viewDetails: string
  backToMenu: string
  addToCart: string
  updateCart: string
  loadingMenu: string
  productAllergens: string

  // Módulos
  navbar: NavbarTranslations
  cart: CartTranslations
  checkout: CheckoutTranslations
  restaurantMenu: RestaurantMenuTranslations
  orderSummary: OrderSummaryTranslations
  orderConfirmation: OrderConfirmationTranslations
  orderStatus: OrderStatusTranslations
  login: LoginTranslations
  register: RegisterTranslations
  establishmentAdmin: EstablishmentAdminTranslations
  mainMenu: MainMenuTranslations
  redirect: RedirectTranslations
}
