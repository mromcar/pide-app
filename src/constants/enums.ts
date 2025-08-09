import { OrderStatus, OrderItemStatus, UserRole } from '@prisma/client'

export { OrderStatus, OrderItemStatus, UserRole }

export const ORDER_STATUS = OrderStatus
export const ORDER_ITEM_STATUS = OrderItemStatus
export const USER_ROLE = UserRole

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
}

export const userRoleLabels: Record<UserRole, string> = {
  [UserRole.client]: 'client',
  [UserRole.waiter]: 'waiter',
  [UserRole.cook]: 'cook',
  [UserRole.establishment_admin]: 'establishment_admin',
  [UserRole.general_admin]: 'general_admin',
}
