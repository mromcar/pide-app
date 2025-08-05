export * from './base'
export * from './auth'
export * from './navigation'
export * from './menu'
export * from './orders'
export * from './admin'

// Interfaz principal que combina todos los módulos
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