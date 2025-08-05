import { 
  CartTranslations, 
  CheckoutTranslations, 
  OrderSummaryTranslations, 
  OrderConfirmationTranslations, 
  OrderStatusTranslations 
} from '../../types/orders'

export const cartFr: CartTranslations = {
  title: 'Panier d\'Achat',
  empty: 'Votre panier est vide',
  total: 'Total',
  checkout: 'Commander'
}

export const checkoutFr: CheckoutTranslations = {
  title: 'Commander',
  tableNumber: 'Numéro de Table',
  notes: 'Notes Spéciales',
  placeOrder: 'Passer Commande',
  placingOrder: 'Passage de commande...'
}

export const orderSummaryFr: OrderSummaryTranslations = {
  title: 'Résumé de la Commande',
  product: 'Produit',
  quantity: 'Qté',
  unitPrice: 'Prix Unitaire',
  subtotal: 'Sous-total',
  total: 'Total'
}

export const orderConfirmationFr: OrderConfirmationTranslations = {
  title: 'Commande Confirmée !',
  subtitle: 'Votre commande a été passée avec succès',
  orderAgain: 'Commander à Nouveau',
  trackOrder: 'Suivre la Commande',
  orderNumber: 'Numéro de Commande',
  status: 'Statut',
  tableNumber: 'Numéro de Table',
  total: 'Total',
  estimatedTime: 'Temps Estimé',
  backToMenu: 'Retour au Menu',
  orderReceived: 'Commande Reçue',
  thankYou: 'Merci pour votre commande !',
  loading: 'Chargement des détails de la commande...',
  orderNotFound: 'Commande introuvable',
  redirectingToMenu: 'Redirection vers le menu...',
  failedToLoad: 'Échec du chargement des détails de la commande'
}

export const orderStatusFr: OrderStatusTranslations = {
  pending: 'En Attente',
  confirmed: 'Confirmée',
  preparing: 'En Préparation',
  ready: 'Prête',
  delivered: 'Livrée',
  cancelled: 'Annulée',
  completed: 'Terminée'
}

export const userRoleFr: UserRoleTranslations = {
  ADMIN: 'Administrateur',
  MANAGER: 'Gestionnaire',
  COOK: 'Cuisinier',
  WAITER: 'Serveur',
  CLIENT: 'Client'
}

export const orderItemStatusFr: OrderItemStatusTranslations = {
  PENDING: 'En Attente',
  PREPARING: 'En Préparation',
  READY: 'Prêt',
  DELIVERED: 'Livré',
  CANCELLED: 'Annulé'
}