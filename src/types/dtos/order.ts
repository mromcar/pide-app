import { OrderStatus } from '@prisma/client';
import { OrderItemCreateDTO, OrderItemDTO, OrderItemUpdateDTO } from './orderItem';
import { OrderStatusHistoryDTO } from './orderStatusHistory';

// Agregar OrderCreateDTO que falta
export interface OrderCreateDTO {
  establishment_id: number;
  client_user_id?: number | null;
  waiter_user_id?: number | null;
  table_number?: string | null;
  status?: OrderStatus;
  total_amount?: number; // Remove null option since Prisma doesn't allow it
  payment_method?: string | null;
  payment_status?: string | null;
  order_type?: string | null;
  notes?: string | null;
  order_items?: OrderItemCreateDTO[];
}

export interface OrderUpdateDTO {
  client_user_id?: number | null;
  waiter_user_id?: number | null;
  table_number?: string | null;
  status?: OrderStatus;
  total_amount?: number; // Remove null option
  payment_method?: string | null;
  payment_status?: string | null;
  order_type?: string | null;
  notes?: string | null;
  order_items?: OrderItemCreateDTO[];
}

// Agregar OrderResponseDTO que falta
export interface OrderResponseDTO {
  order_id: number;
  establishment_id: number;
  client_user_id?: number | null;
  waiter_user_id?: number | null;
  table_number?: string | null;
  status: OrderStatus;
  total_amount?: number; // Remove null option
  payment_method?: string | null;
  payment_status?: string | null;
  order_type?: string | null;
  notes?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  order_items?: OrderItemDTO[];
  status_history?: OrderStatusHistoryDTO[];
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

// También agregar UpdateOrderDTO que se usa en el servicio
export interface UpdateOrderDTO {
  client_user_id?: number | null;
  waiter_user_id?: number | null;
  table_number?: string | null;
  status?: OrderStatus;
  total_amount?: number | null;
  payment_method?: string | null;
  payment_status?: string | null;
  order_type?: string | null;
  notes?: string | null;
  order_items?: OrderItemCreateDTO[];
}

