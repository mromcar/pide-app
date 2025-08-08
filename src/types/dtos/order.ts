import { OrderStatus } from '@prisma/client';
import { OrderItemCreateDTO, OrderItemDTO, OrderItemUpdateDTO } from './orderItem';
import { OrderStatusHistoryDTO } from './orderStatusHistory';

export interface OrderCreateDTO {
  establishmentId: number;
  clientUserId?: number | null;
  waiterUserId?: number | null;
  tableNumber?: string | null;
  status?: OrderStatus;
  totalAmount?: number;
  paymentMethod?: string | null;
  paymentStatus?: string | null;
  orderType?: string | null;
  notes?: string | null;
  orderItems?: OrderItemCreateDTO[];
}

export interface OrderUpdateDTO {
  clientUserId?: number | null;
  waiterUserId?: number | null;
  tableNumber?: string | null;
  status?: OrderStatus;
  totalAmount?: number;
  paymentMethod?: string | null;
  paymentStatus?: string | null;
  orderType?: string | null;
  notes?: string | null;
  orderItems?: OrderItemCreateDTO[];
}

export interface OrderResponseDTO {
  orderId: number;
  establishmentId: number;
  clientUserId?: number | null;
  waiterUserId?: number | null;
  tableNumber?: string | null;
  status: OrderStatus;
  totalAmount?: number;
  paymentMethod?: string | null;
  paymentStatus?: string | null;
  orderType?: string | null;
  notes?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  orderItems?: OrderItemDTO[];
  statusHistory?: OrderStatusHistoryDTO[];
}

export interface OrderDTO {
  orderId: number;
  establishmentId: number;
  clientUserId?: number | null;
  waiterUserId?: number | null;
  tableNumber?: string | null;
  status: OrderStatus;
  totalAmount?: number | null;
  paymentMethod?: string | null;
  paymentStatus?: string | null;
  orderType?: string | null;
  notes?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  orderItems?: OrderItemDTO[];
  statusHistory?: OrderStatusHistoryDTO[];
}

export interface UpdateOrderDTO {
  clientUserId?: number | null;
  waiterUserId?: number | null;
  tableNumber?: string | null;
  status?: OrderStatus;
  totalAmount?: number | null;
  paymentMethod?: string | null;
  paymentStatus?: string | null;
  orderType?: string | null;
  notes?: string | null;
  orderItems?: OrderItemCreateDTO[];
}

// Exporta el tipo que necesitas
export type { OrderStatusHistoryDTO } from './orderStatusHistory';

