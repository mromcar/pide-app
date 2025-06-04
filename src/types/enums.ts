// src/types/enums.ts

export enum UserRole {
  CLIENT = 'client',
  WAITER = 'waiter',
  COOK = 'cook',
  ESTABLISHMENT_ADMIN = 'establishment_admin',
  GENERAL_ADMIN = 'general_admin',
}

export enum OrderStatus {
  PENDING = 'pending',
  PREPARING = 'preparing',
  READY = 'ready',
  DELIVERED = 'delivered',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum OrderItemStatus {
  PENDING = 'pending',
  PREPARING = 'preparing',
  READY = 'ready',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}
