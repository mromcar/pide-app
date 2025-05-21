// src/schemas/order.ts
import { z } from 'zod';
import { OrderStatus, OrderItemStatus } from '../types/enums'; // Asegúrate que la ruta sea correcta
import { idSchema, optionalString } from './common';

// Esquema para un Ítem de Pedido (al crear un pedido)
export const createOrderItemSchema = z.object({
  variantId: idSchema,
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  // unitPrice should ideally be fetched server-side based on variantId for security and accuracy,
  // but if the client must send it, it needs validation.
  // unitPrice: z.number().positive("Unit price must be positive"), // Consider if client sends this
  notes: optionalString,
  // status will default to PENDING in the DB or can be set here
});
export type CreateOrderItemInput = z.infer<typeof createOrderItemSchema>;

// Esquema para Crear Pedido
export const createOrderSchema = z.object({
  establishmentId: idSchema,
  clientUserId: idSchema.optional().nullable(),
  waiterUserId: idSchema.optional().nullable(),
  tableNumber: optionalString.max(20),
  status: z.nativeEnum(OrderStatus).default(OrderStatus.PENDING).optional(),
  paymentMethod: optionalString.max(50),
  paymentStatus: z.string().max(20).default('UNPAID').optional(),
  orderType: optionalString.max(50),
  notes: optionalString,
  items: z.array(createOrderItemSchema).min(1, "Order must have at least one item"),
});
export type CreateOrderInput = z.infer<typeof createOrderSchema>;

// Esquema para actualizar un Ítem de Pedido (cuando se actualiza un pedido)
export const updateOrderItemSchema = createOrderItemSchema.partial().extend({
  orderItemId: idSchema.optional(), // Para identificar ítems existentes
  // unitPrice: z.number().positive().optional(), // Si se permite actualizar
  status: z.nativeEnum(OrderItemStatus).optional(),
});
export type UpdateOrderItemInput = z.infer<typeof updateOrderItemSchema>;

// Esquema para Actualizar Pedido
export const updateOrderSchema = z.object({
  clientUserId: idSchema.optional().nullable(),
  waiterUserId: idSchema.optional().nullable(),
  tableNumber: optionalString.max(20),
  status: z.nativeEnum(OrderStatus).optional(),
  paymentMethod: optionalString.max(50),
  paymentStatus: z.string().max(20).optional(),
  orderType: optionalString.max(50),
  notes: optionalString,
  // Para actualizar ítems:
  // - addItems: z.array(createOrderItemSchema).optional()
  // - updateItems: z.array(updateOrderItemSchema.extend({ orderItemId: idSchema })).optional()
  // - removeItems: z.array(idSchema).optional() // Array of orderItemIds to remove
  // Simplificado: reemplazar ítems o manejar lógica de diff en el servicio.
  // A continuación un ejemplo simple donde se reemplaza o se actualizan los existentes por id
  items: z.array(updateOrderItemSchema).optional(),
});
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;

// Esquema para actualizar solo el estado de un Pedido
export const updateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
  // changedByUserId: idSchema.optional().nullable(), // El backend podría inferirlo del usuario autenticado
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
  itemId: z.coerce.number().int().positive(), // o orderItemId
});
export type OrderItemIdParam = z.infer<typeof orderItemIdParamSchema>;
