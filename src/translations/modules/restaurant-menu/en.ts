import { RestaurantMenuTranslations } from '../../types/restaurant-menu'

export const restaurantMenuEn: RestaurantMenuTranslations = {
  title: 'Establishment Menu',  // ✅ CAMBIO: Restaurant → Establishment
  description: 'Browse our delicious offerings',
  // ✅ CAMBIO: restaurantId → establishmentId
  invalidEstablishmentIdError: 'Invalid establishment ID',
  menuNotAvailableError: 'Menu not available at this time',
  menuNoItems: 'No menu items available',
  menuNoProductsInCategory: 'No products available in this category',
  loadingMenu: 'Loading establishment menu...',  // ✅ CAMBIO
  backToCategories: 'Back to categories',
  backToMenu: 'Back to menu',
  addToCart: 'Add to cart',
  updateCart: 'Update Cart',
  viewDetails: 'View details',
  allergens: 'Allergens',
  variants: 'Variants',
  total: 'Total',
  notes: 'Notes',
  productAllergens: 'Contains allergens',
  // ✅ AÑADIDO: Nuevo mensaje
  establishmentNotFound: 'Establishment not found'
}
