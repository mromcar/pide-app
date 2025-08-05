import { 
  CartTranslations, 
  CheckoutTranslations, 
  OrderSummaryTranslations, 
  OrderConfirmationTranslations, 
  OrderStatusTranslations 
} from '../../types/orders'

export const cartEs: CartTranslations = {
  title: 'Carrito de Compras',
  empty: 'Tu carrito está vacío',
  total: 'Total',
  checkout: 'Finalizar Compra'
}

export const checkoutEs: CheckoutTranslations = {
  title: 'Finalizar Compra',
  tableNumber: 'Número de Mesa',
  notes: 'Notas Especiales',
  placeOrder: 'Realizar Pedido',
  placingOrder: 'Realizando pedido...'
}

export const orderSummaryEs: OrderSummaryTranslations = {
  title: 'Resumen del Pedido',
  product: 'Producto',
  quantity: 'Cant.',
  unitPrice: 'Precio Unitario',
  subtotal: 'Subtotal',
  total: 'Total'
}

export const orderConfirmationEs: OrderConfirmationTranslations = {
  title: '¡Pedido Confirmado!',
  subtitle: 'Tu pedido ha sido realizado exitosamente',
  orderAgain: 'Pedir de Nuevo',
  trackOrder: 'Seguir Pedido',
  orderNumber: 'Número de Pedido',
  status: 'Estado',
  tableNumber: 'Número de Mesa',
  total: 'Total',
  estimatedTime: 'Tiempo Estimado',
  backToMenu: 'Volver al Menú',
  orderReceived: 'Pedido Recibido',
  thankYou: '¡Gracias por tu pedido!',
  loading: 'Cargando detalles del pedido...',
  orderNotFound: 'Pedido no encontrado',
  redirectingToMenu: 'Redirigiendo al menú...',
  failedToLoad: 'Error al cargar los detalles del pedido'
}

export const orderStatusEs: OrderStatusTranslations = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  preparing: 'Preparando',
  ready: 'Listo',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
  completed: 'Completado'
}

export const userRoleEs: UserRoleTranslations = {
  ADMIN: 'Administrador',
  MANAGER: 'Gerente',
  COOK: 'Cocinero',
  WAITER: 'Mesero',
  CLIENT: 'Cliente'
}

export const orderItemStatusEs: OrderItemStatusTranslations = {
  PENDING: 'Pendiente',
  PREPARING: 'Preparando',
  READY: 'Listo',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado'
}