// src/types/order.ts
import { OrderStatus, PaymentMethod, PaymentStatus } from '@prisma/client';
import { SerializedOrderItem } from './menu'; // Reutiliza el tipo de ítem de pedido serializado

export interface SerializedOrder {
  order_id: number;
  establishment_id: number;
  client_user_id: number | null;
  waiter_user_id: number | null;
  table_number: string;
  status: OrderStatus;
  total_amount: number; // Ya serializado a number
  payment_method: PaymentMethod | null;
  payment_status: PaymentStatus;
  order_type: string;
  notes: string | null;
  created_at: string; // ISO string
  updated_at: string; // ISO string
  // Si incluyes relaciones en la respuesta de la API, inclúyelas aquí también
  items: SerializedOrderItem[]; // Los ítems del pedido
  // Puedes añadir el historial de estado si tu API lo devuelve
  status_history?: Array<{
    status_history_id: number;
    order_id: number;
    status: OrderStatus;
    notes: string | null;
    changed_at: string;
    changed_by_user_id: number | null;
  }>;
  // Si devuelves info de cliente/mesero
  client?: { user_id: number; name: string; email: string; } | null;
  waiter?: { user_id: number; name: string; email: string; } | null;
}

// Puedes añadir aquí otros DTOs o tipos relacionados con pedidos si es necesario
