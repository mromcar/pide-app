// src/types/serialized/order.ts

import { OrderStatus, OrderItemStatus } from '../enums';

export interface SerializedOrderItem {
  orderItemId: number;
  variantId: number;
  // variantName?: string; // Denormalized, if needed
  // productName?: string; // Denormalized, if needed
  quantity: number;
  unitPrice: number;
  itemTotalPrice: number;
  status: OrderItemStatus;
  notes?: string | null;
}

export interface SerializedOrderStatusHistory {
  status: OrderStatus;
  // changedByUserName?: string; // Denormalized, if needed
  changedAt: Date;
  notes?: string | null;
}

export interface SerializedOrder {
  orderId: number;
  establishmentId: number;
  // clientName?: string | null; // Denormalized
  // waiterName?: string | null; // Denormalized
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
