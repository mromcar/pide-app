import { OrderStatus, OrderItemStatus, UserRole } from '@prisma/client'

export const ORDER_STATUS = OrderStatus
export const ORDER_ITEM_STATUS = OrderItemStatus
export const USER_ROLE = UserRole

export const orderStatusLabels: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'Pendiente',
  [OrderStatus.PREPARING]: 'Preparando',
  [OrderStatus.READY]: 'Listo',
  [OrderStatus.DELIVERED]: 'Entregado',
  [OrderStatus.COMPLETED]: 'Completado',
  [OrderStatus.CANCELLED]: 'Cancelado',
}

export const orderItemStatusLabels: Record<OrderItemStatus, string> = {
  [OrderItemStatus.PENDING]: 'Pendiente',
  [OrderItemStatus.PREPARING]: 'Preparando',
  [OrderItemStatus.READY]: 'Listo',
  [OrderItemStatus.DELIVERED]: 'Entregado',
  [OrderItemStatus.CANCELLED]: 'Cancelado',
}

export const userRoleLabels: Record<UserRole, string> = {
  [UserRole.client]: 'Cliente',
  [UserRole.waiter]: 'Camarero',
  [UserRole.cook]: 'Cocinero',
  [UserRole.establishment_admin]: 'Administrador',
  [UserRole.general_admin]: 'Administrador General',
}