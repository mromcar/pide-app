import { z } from 'zod';
import { OrderStatus } from '@prisma/client';
import { orderItemCreateSchema } from './orderItem';

// Schema para validar ID de orden
export const orderIdSchema = z.object({
  orderId: z.number().int().positive()
});

// Schema para crear una nueva orden
export const createOrderSchema = z.object({
  establishmentId: z.number().int().positive(),
  clientUserId: z.number().int().positive().optional().nullable(),
  waiterUserId: z.number().int().positive().optional().nullable(),
  tableNumber: z.string().optional().nullable(),
  status: z.nativeEnum(OrderStatus).optional(),
  totalAmount: z.number().positive().optional().nullable(),
  paymentMethod: z.string().optional().nullable(),
  paymentStatus: z.string().optional().nullable(),
  orderType: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  orderItems: z.array(orderItemCreateSchema).optional()
});

// Schema para actualizar una orden
export const updateOrderSchema = z.object({
  clientUserId: z.number().int().positive().optional().nullable(),
  waiterUserId: z.number().int().positive().optional().nullable(),
  tableNumber: z.string().optional().nullable(),
  status: z.nativeEnum(OrderStatus).optional(),
  totalAmount: z.number().positive().optional().nullable(),
  paymentMethod: z.string().optional().nullable(),
  paymentStatus: z.string().optional().nullable(),
  orderType: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  orderItems: z.array(orderItemCreateSchema).optional()
});

// Schema para actualizar el estado de una orden
export const updateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
  notes: z.string().optional()
});

// Tipos TypeScript derivados de los schemas
export type OrderIdInput = z.infer<typeof orderIdSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
