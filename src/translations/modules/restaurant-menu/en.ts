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

  establishmentNotFound: 'Establishment not found',


  table: 'Table',
  customerName: 'Customer Name',
  callWaiter: 'Call Waiter',
  requestCutlery: 'Request Cutlery',
  refillDrinks: 'Refill Drinks',
  otherRequests: 'Other Requests',
  viewCart: 'View Cart',
  searchMenu: 'Search menu items...',
  toggleCategoryList: 'Toggle category list',
  close: 'Close',
  noResultsFound: 'No results found',
  tryDifferentSearch: 'Try a different search term',
  editNameOrNumber: 'Edit name or table number',
  save: 'Save',
  edit: 'Edit',
}
