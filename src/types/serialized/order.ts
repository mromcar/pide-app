// src/types/serialized/order.ts

import { OrderStatus, OrderItemStatus } from '../enums';

export interface SerializedOrderItem {
  orderItemId: number;
  variantId: number;
  quantity: number;
  unitPrice: number;
  itemTotalPrice: number;
  status: OrderItemStatus;
  notes?: string | null;
}

export interface SerializedOrderStatusHistory {
  status: OrderStatus;
  changedAt: Date;
  notes?: string | null;
}

export interface SerializedOrder {
  orderId: number;
  establishmentId: number;
  tableNumber?: string | null;
  status: OrderStatus;
  totalAmount: number;
  paymentMethod?: string | null;
  paymentStatus: string;
  orderType?: string | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
  items: SerializedOrderItem[];
  statusHistory?: SerializedOrderStatusHistory[];
}
