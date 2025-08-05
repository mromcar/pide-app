import { OrderStatus, OrderItemStatus } from '@prisma/client';
// import { Establishment } from './establishment'; // Placeholder
// import { User } from './user'; // Placeholder
// import { OrderItem } from './orderItem'; // Placeholder
// import { OrderStatusHistory } from './orderStatusHistory'; // Placeholder

// ✅ Agregar la propiedad items que falta
export interface Order {
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
  created_at: string; // ✅ Hacer string para evitar errores de Date
  updated_at?: string | null;
  items?: OrderItem[]; // ✅ Agregar propiedad items
}

export interface OrderItem {
  order_item_id: number;
  order_id: number;
  variant_id: number;
  quantity: number;
  unit_price: number;
  item_total_price?: number | null;
  status?: OrderItemStatus | null;
  notes?: string | null;
}
