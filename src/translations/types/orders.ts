export interface CartTranslations {
  title: string
  empty: string
  total: string
  checkout: string
}

export interface CheckoutTranslations {
  title: string
  tableNumber: string
  notes: string
  placeOrder: string
  placingOrder: string
}

export interface OrderSummaryTranslations {
  title: string
  product: string
  quantity: string
  unitPrice: string
  subtotal: string
  total: string
}

export interface OrderConfirmationTranslations {
  title: string
  subtitle: string
  orderAgain: string
  trackOrder: string
  orderNumber: string
  status: string
  tableNumber: string
  total: string
  estimatedTime: string
  backToMenu: string
  orderReceived: string
  thankYou: string
  loading: string
  orderNotFound: string
  redirectingToMenu: string
  failedToLoad: string
}

export interface OrderStatusTranslations {
  pending: string
  confirmed: string
  preparing: string
  ready: string
  delivered: string
  cancelled: string
  completed: string
}

export interface UserRoleTranslations {
  ADMIN: string
  MANAGER: string
  COOK: string
  WAITER: string
  CLIENT: string
}

export interface OrderItemStatusTranslations {
  PENDING: string
  PREPARING: string
  READY: string
  DELIVERED: string
  CANCELLED: string
}