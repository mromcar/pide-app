import { OrderStatus } from '@prisma/client';

export interface OrderStatusHistoryCreateDTO {
  order_id: number;
  status: OrderStatus;
  changed_by_user_id?: number | null;
  notes?: string | null;
}

export interface OrderStatusHistoryDTO {
  history_id: number;
  order_id: number;
  status: OrderStatus;
  changed_by_user_id?: number | null;
  changed_at?: string | null;
  notes?: string | null;
}
