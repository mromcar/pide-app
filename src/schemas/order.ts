import { z } from 'zod';
import { OrderStatus } from '@prisma/client';
import { orderItemCreateSchema } from './orderItem'; // Assuming this will be defined

export const orderIdSchema = z.object({
  orderId: z.coerce.number().int().positive(),
});

const orderStatusEnum = z.nativeEnum(OrderStatus);

export const orderCreateSchema = z.object({
  establishment_id: z.number().int().positive(),
  client_user_id: z.number().int().positive().optional().nullable(),
  waiter_user_id: z.number().int().positive().optional().nullable(),
  table_number: z.string().max(20).optional().nullable(),
  status: orderStatusEnum.optional(), // Default: 'pending'
  total_amount: z.number().positive().optional().nullable(),
  payment_method: z.string().max(50).optional().nullable(),
  payment_status: z.string().max(20).optional().nullable(), // Default: 'UNPAID'
  order_type: z.string().max(50).optional().nullable(),
  notes: z.string().optional().nullable(),
  order_items: z.array(orderItemCreateSchema).optional().default([]), // Can create items with order
});

export const orderUpdateSchema = z.object({
  client_user_id: z.number().int().positive().optional().nullable(),
  waiter_user_id: z.number().int().positive().optional().nullable(),
  table_number: z.string().max(20).optional().nullable(),
  status: orderStatusEnum.optional(),
  total_amount: z.number().positive().optional().nullable(),
  payment_method: z.string().max(50).optional().nullable(),
  payment_status: z.string().max(20).optional().nullable(),
  order_type: z.string().max(50).optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type OrderCreateInput = z.infer<typeof orderCreateSchema>;
export type OrderUpdateInput = z.infer<typeof orderUpdateSchema>;