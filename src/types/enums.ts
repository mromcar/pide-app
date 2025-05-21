// src/types/enums.ts

export enum UserRole {
  CLIENT = 'client',
  WAITER = 'waiter',
  COOK = 'cook',
  ESTABLISHMENT_ADMIN = 'establishment_admin',
  GENERAL_ADMIN = 'general_admin',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PREPARING = 'PREPARING',
  READY = 'READY',
  DELIVERED = 'DELIVERED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum OrderItemStatus {
  PENDING = 'PENDING',
  PREPARING = 'PREPARING',
  READY = 'READY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}
