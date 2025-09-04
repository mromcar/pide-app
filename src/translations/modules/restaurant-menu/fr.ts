import { RestaurantMenuTranslations } from '../../types/restaurant-menu'

export const restaurantMenuFr: RestaurantMenuTranslations = {
  title: 'Menu de l\'Établissement',  // ✅ CAMBIO: Restaurant → Établissement
  description: 'Découvrez nos délicieuses offres',
  // ✅ CAMBIO: restaurantId → establishmentId
  invalidEstablishmentIdError: 'ID d\'établissement invalide',
  menuNotAvailableError: 'Menu non disponible pour le moment',
  menuNoItems: 'Aucun élément de menu disponible',
  menuNoProductsInCategory: 'Aucun produit disponible dans cette catégorie',
  loadingMenu: 'Chargement du menu de l\'établissement...',  // ✅ CAMBIO
  backToCategories: 'Retour aux catégories',
  backToMenu: 'Retour au menu',
  addToCart: 'Ajouter au panier',
  updateCart: 'Mettre à jour le panier',
  viewDetails: 'Voir les détails',
  allergens: 'Allergènes',
  variants: 'Variantes',
  total: 'Total',
  notes: 'Notes',
  productAllergens: 'Contient des allergènes',
  // ✅ AÑADIDO: Nuevo mensaje
  establishmentNotFound: 'Établissement non trouvé',

  // ✅ NUEVAS para la interfaz móvil
  table: 'Table',
  customerName: 'Nom du Client',
  callWaiter: 'Appeler Serveur',
  requestCutlery: 'Demander Couverts',
  refillDrinks: 'Remplir Boissons',
  otherRequests: 'Autres Demandes',
  viewCart: 'Voir Panier',
  searchMenu: 'Rechercher dans le menu...',
  toggleCategoryList: 'Basculer liste catégories',
  close: 'Fermer',
  noResultsFound: 'Aucun résultat trouvé',
  tryDifferentSearch: 'Essayez un autre terme de recherche',
  editNameOrNumber: 'Modifier nom ou numéro de table',
  save: 'Sauvegarder',
  edit: 'Modifier',
}
