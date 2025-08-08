import {
  CartTranslations,
  CheckoutTranslations,
  OrderSummaryTranslations,
  OrderConfirmationTranslations,
  OrderStatusTranslations,
  UserRoleTranslations,
  OrderItemStatusTranslations
} from '../../types/orders'

export const cartEn: CartTranslations = {
  title: 'Shopping Cart',
  empty: 'Your cart is empty',
  total: 'Total',
  checkout: 'Checkout'
}

export const checkoutEn: CheckoutTranslations = {
  title: 'Checkout',
  tableNumber: 'Table Number',
  notes: 'Special Notes',
  placeOrder: 'Place Order',
  placingOrder: 'Placing order...'
}

export const orderSummaryEn: OrderSummaryTranslations = {
  title: 'Order Summary',
  product: 'Product',
  quantity: 'Qty',
  unitPrice: 'Unit Price',
  subtotal: 'Subtotal',
  total: 'Total'
}

export const orderConfirmationEn: OrderConfirmationTranslations = {
  title: 'Order Confirmed!',
  subtitle: 'Your order has been successfully placed',
  orderAgain: 'Order Again',
  trackOrder: 'Track Order',
  orderNumber: 'Order Number',
  status: 'Status',
  tableNumber: 'Table Number',
  total: 'Total',
  estimatedTime: 'Estimated Time',
  backToMenu: 'Back to Menu',
  orderReceived: 'Order Received',
  thankYou: 'Thank you for your order!',
  loading: 'Loading order details...',
  orderNotFound: 'Order not found',
  redirectingToMenu: 'Redirecting to menu...',
  failedToLoad: 'Failed to load order details'
}

export const orderStatusEn: OrderStatusTranslations = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  ready: 'Ready',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  completed: 'Completed'
}

export const userRoleEn: UserRoleTranslations = {
  ADMIN: 'Administrator',
  MANAGER: 'Manager',
  COOK: 'Cook',
  WAITER: 'Waiter',
  CLIENT: 'Client'
}

export const orderItemStatusEn: OrderItemStatusTranslations = {
  PENDING: 'Pending',
  PREPARING: 'Preparing',
  READY: 'Ready',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled'
}
