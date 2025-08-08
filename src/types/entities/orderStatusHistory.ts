import { OrderStatus } from '@prisma/client';

export interface OrderStatusHistory {
  historyId: number;
  orderId: number;
  status: OrderStatus;
  changedByUserId?: number | null;
  changedAt?: Date | null;
  notes?: string | null;
  // order: Order;
  // changedByUser?: User | null;
}
