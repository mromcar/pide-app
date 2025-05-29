import { OrderStatus } from '@prisma/client';

export interface OrderStatusHistoryCreateDTO {
  order_id: number;
  status: OrderStatus;
  changed_by_user_id?: number | null;
  notes?: string | null;
}

// OrderStatusHistory is typically append-only, so no UpdateDTO is usually needed.

export interface OrderStatusHistoryDTO {
  history_id: number;
  order_id: number;
  status: OrderStatus;
  changed_by_user_id?: number | null;
  changed_at?: string | null;
  notes?: string | null;
  // changed_by_user_name?: string; // Example: if you want to include user's name
}
