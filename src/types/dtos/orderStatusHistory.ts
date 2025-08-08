import { OrderStatus } from '@prisma/client';

export interface OrderStatusHistoryCreateDTO {
  orderId: number;
  status: OrderStatus;
  changedByUserId?: number | null;
  notes?: string | null;
}

export interface OrderStatusHistoryDTO {
  historyId: number;
  orderId: number;
  status: OrderStatus;
  changedByUserId?: number | null;
  changedAt?: string | null;
  notes?: string | null;
}
