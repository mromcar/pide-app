import { RestaurantMenuTranslations } from '../../types/restaurant-menu'

export const restaurantMenuEs: RestaurantMenuTranslations = {
  title: 'Menú del Establecimiento', // ✅ CAMBIO: Restaurante → Establecimiento
  description: 'Explora nuestras deliciosas ofertas',
  // ✅ CAMBIO: restaurantId → establishmentId
  invalidEstablishmentIdError: 'ID de establecimiento inválido',
  menuNotAvailableError: 'Menú no disponible en este momento',
  menuNoItems: 'No hay elementos de menú disponibles',
  menuNoProductsInCategory: 'No hay productos disponibles en esta categoría',
  loadingMenu: 'Cargando menú del establecimiento...', // ✅ CAMBIO
  backToCategories: 'Volver a categorías',
  backToMenu: 'Volver al menú',
  addToCart: 'Añadir al carrito',
  updateCart: 'Actualizar Carrito',
  viewDetails: 'Ver detalles',
  allergens: 'Alérgenos',
  variants: 'Variantes',
  total: 'Total',
  notes: 'Notas',
  productAllergens: 'Contiene alérgenos',
  // ✅ AÑADIDO: Nuevo mensaje
  establishmentNotFound: 'Establecimiento no encontrado'
}
