// src/schemas/order.ts
import { z } from 'zod';
import { OrderStatus, OrderItemStatus } from '../types/enums';
import { idSchema } from './common';

// Utilidades reutilizables
export const optionalString = z.string().optional().nullable();
export const optionalStringMax20 = z.string().max(20).optional().nullable();
export const optionalStringMax50 = z.string().max(50).optional().nullable();

// Esquema para un Ítem de Pedido (al crear un pedido)
export const createOrderItemSchema = z.object({
  variantId: idSchema,
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  notes: optionalString,
  status: z.nativeEnum(OrderItemStatus).optional(), // <-- Añadido aquí
});
export type CreateOrderItemInput = z.infer<typeof createOrderItemSchema>;

// Esquema para Crear Pedido
export const createOrderSchema = z.object({
  establishmentId: idSchema,
  clientUserId: idSchema.optional().nullable(),
  waiterUserId: idSchema.optional().nullable(),
  tableNumber: optionalStringMax20,
  status: z.nativeEnum(OrderStatus).default(OrderStatus.PENDING).optional(),
  paymentMethod: optionalStringMax50,
  paymentStatus: z.string().max(20).default('UNPAID').optional(),
  orderType: optionalStringMax50,
  notes: optionalString,
  items: z.array(createOrderItemSchema).min(1, "Order must have at least one item"),
});
export type CreateOrderInput = z.infer<typeof createOrderSchema>;

// Esquema para actualizar un Ítem de Pedido (cuando se actualiza un pedido)
export const updateOrderItemSchema = createOrderItemSchema.partial().extend({
  orderItemId: idSchema.optional(),
  status: z.nativeEnum(OrderItemStatus).optional(),
});
export type UpdateOrderItemInput = z.infer<typeof updateOrderItemSchema>;

// Esquema para Actualizar Pedido
export const updateOrderSchema = z.object({
  clientUserId: idSchema.optional().nullable(),
  waiterUserId: idSchema.optional().nullable(),
  tableNumber: optionalStringMax20,
  status: z.nativeEnum(OrderStatus).optional(),
  paymentMethod: optionalStringMax50,
  paymentStatus: z.string().max(20).optional(),
  orderType: optionalStringMax50,
  notes: optionalString,
  items: z.array(updateOrderItemSchema).optional(),
});
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;

// Esquema para actualizar solo el estado de un Pedido
export const updateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
  notes: optionalString,
});
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;

// Esquema para actualizar solo el estado de un Ítem de Pedido
export const updateOrderItemStatusSchema = z.object({
  status: z.nativeEnum(OrderItemStatus),
  notes: optionalString,
});
export type UpdateOrderItemStatusInput = z.infer<typeof updateOrderItemStatusSchema>;

// Esquema para parámetros de ruta
export const orderIdParamSchema = z.object({
  orderId: z.coerce.number().int().positive(),
});
export type OrderIdParam = z.infer<typeof orderIdParamSchema>;

export const orderItemIdParamSchema = z.object({
  orderId: z.coerce.number().int().positive(),
  itemId: z.coerce.number().int().positive(),
});
export type OrderItemIdParam = z.infer<typeof orderItemIdParamSchema>;
