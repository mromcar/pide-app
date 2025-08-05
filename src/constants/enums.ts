import { OrderStatus, OrderItemStatus, UserRole } from '@prisma/client'

// Remove the hardcoded labels - these should come from translations
// The enums themselves remain in English as they are used in code
export { OrderStatus, OrderItemStatus, UserRole }

export const ORDER_STATUS = OrderStatus
export const ORDER_ITEM_STATUS = OrderItemStatus
export const USER_ROLE = UserRole

// ✅ Labels en inglés - las traducciones van en archivos de idioma
export const orderStatusLabels: Record<OrderStatus, string> = {
  [OrderStatus.pending]: 'pending',
  [OrderStatus.preparing]: 'preparing',
  [OrderStatus.ready]: 'ready',
  [OrderStatus.delivered]: 'delivered',
  [OrderStatus.completed]: 'completed',
  [OrderStatus.cancelled]: 'cancelled',
}

export const orderItemStatusLabels: Record<OrderItemStatus, string> = {
  [OrderItemStatus.pending]: 'pending',
  [OrderItemStatus.preparing]: 'preparing',
  [OrderItemStatus.ready]: 'ready',
  [OrderItemStatus.delivered]: 'delivered',
  [OrderItemStatus.cancelled]: 'cancelled',
}

export const userRoleLabels: Record<UserRole, string> = {
  [UserRole.CLIENT]: 'client',
  [UserRole.WAITER]: 'waiter',
  [UserRole.COOK]: 'cook',
  [UserRole.ESTABLISHMENT_ADMIN]: 'establishment_admin',
  [UserRole.GENERAL_ADMIN]: 'general_admin',
}
