import { z } from 'zod';
import { OrderStatus } from '@prisma/client';
import { orderItemCreateSchema } from './orderItem';

// Schema para validar ID de orden
export const order_id_schema = z.object({
  order_id: z.number().int().positive()
});

// Schema para crear una nueva orden
export const create_order_schema = z.object({
  establishment_id: z.number().int().positive(),
  client_user_id: z.number().int().positive().optional().nullable(),
  waiter_user_id: z.number().int().positive().optional().nullable(),
  table_number: z.string().optional().nullable(),
  status: z.nativeEnum(OrderStatus).optional(),
  total_amount: z.number().positive().optional().nullable(),
  payment_method: z.string().optional().nullable(),
  payment_status: z.string().optional().nullable(),
  order_type: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  order_items: z.array(orderItemCreateSchema).optional()
});

// Schema para actualizar una orden
export const update_order_schema = z.object({
  client_user_id: z.number().int().positive().optional().nullable(),
  waiter_user_id: z.number().int().positive().optional().nullable(),
  table_number: z.string().optional().nullable(),
  status: z.nativeEnum(OrderStatus).optional(),
  total_amount: z.number().positive().optional().nullable(),
  payment_method: z.string().optional().nullable(),
  payment_status: z.string().optional().nullable(),
  order_type: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  order_items: z.array(orderItemCreateSchema).optional()
});

// Schema para actualizar el estado de una orden
export const update_order_status_schema = z.object({
  status: z.nativeEnum(OrderStatus),
  notes: z.string().optional()
});

// Tipos TypeScript derivados de los schemas
export type OrderIdInput = z.infer<typeof order_id_schema>;
export type CreateOrderInput = z.infer<typeof create_order_schema>;
export type UpdateOrderInput = z.infer<typeof update_order_schema>;
export type UpdateOrderStatusInput = z.infer<typeof update_order_status_schema>;
