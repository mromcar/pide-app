// src/types/entities/order.ts

import { OrderStatus, OrderItemStatus } from '../enums';
import { Establishment } from './establishment';
import { User } from './user';
import { ProductVariant } from './product';

export interface OrderItem {
  orderItemId: number;
  orderId: number;
  variantId: number;
  quantity: number;
  unitPrice: number; // Prisma Decimal
  itemTotalPrice?: number; // Prisma Decimal, generated
  status: OrderItemStatus;
  notes?: string | null;
  order?: Order;
  variant?: ProductVariant;
}

export interface OrderStatusHistory {
  historyId: number;
  orderId: number;
  status: OrderStatus;
  changedByUserId?: number | null;
  changedAt: Date;
  notes?: string | null;
  order?: Order;
  changedBy?: User | null;
}

export interface Order {
  orderId: number;
  establishmentId: number;
  clientUserId?: number | null;
  waiterUserId?: number | null;
  tableNumber?: string | null;
  status: OrderStatus;
  totalAmount: number; // Prisma Decimal
  paymentMethod?: string | null;
  paymentStatus?: string | null;
  orderType?: string | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
  items?: OrderItem[];
  statusHistory?: OrderStatusHistory[];
  client?: User | null;
  establishment?: Establishment;
  waiter?: User | null;
}
