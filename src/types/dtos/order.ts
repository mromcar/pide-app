import { OrderStatus } from '@prisma/client';
import { OrderItemCreateDTO, OrderItemDTO } from './orderItem'; // Assuming these will be defined
import { OrderStatusHistoryDTO } from './orderStatusHistory'; // Assuming this will be defined

export interface OrderCreateDTO {
  establishment_id: number;
  client_user_id?: number | null;
  waiter_user_id?: number | null;
  table_number?: string | null;
  status?: OrderStatus; // Defaults to 'pending'
  total_amount?: number | null; // Often calculated, but can be set
  payment_method?: string | null;
  payment_status?: string | null; // Defaults to 'UNPAID'
  order_type?: string | null;
  notes?: string | null;
  order_items?: OrderItemCreateDTO[]; // For creating order items along with the order
}

export interface OrderUpdateDTO {
  client_user_id?: number | null;
  waiter_user_id?: number | null;
  table_number?: string | null;
  status?: OrderStatus;
  total_amount?: number | null;
  payment_method?: string | null;
  payment_status?: string | null;
  order_type?: string | null;
  notes?: string | null;
  // order_items might be handled via separate endpoints for adding/removing/updating items
}

export interface OrderDTO {
  order_id: number;
  establishment_id: number;
  client_user_id?: number | null;
  waiter_user_id?: number | null;
  table_number?: string | null;
  status: OrderStatus;
  total_amount?: number | null;
  payment_method?: string | null;
  payment_status?: string | null;
  order_type?: string | null;
  notes?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  order_items?: OrderItemDTO[];
  status_history?: OrderStatusHistoryDTO[];
}
