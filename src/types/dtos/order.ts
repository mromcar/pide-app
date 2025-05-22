// src/types/dtos/order.ts
import { z } from 'zod';
import {
  createOrderSchema,
  updateOrderSchema,
  updateOrderStatusSchema,
  createOrderItemSchema,
  updateOrderItemSchema,
  updateOrderItemStatusSchema,
  orderIdParamSchema,
  orderItemIdParamSchema,
} from '../../schemas/order';
// Tipos inferidos de los esquemas Zod para el cuerpo de la solicitud (request body)
export type CreateOrderDTO = z.infer<typeof createOrderSchema>;
export type UpdateOrderDTO = z.infer<typeof updateOrderSchema>;
export type UpdateOrderStatusDTO = z.infer<typeof updateOrderStatusSchema>;

export type CreateOrderItemDTO = z.infer<typeof createOrderItemSchema>;
export type UpdateOrderItemDTO = z.infer<typeof updateOrderItemSchema>;
export type UpdateOrderItemStatusDTO = z.infer<typeof updateOrderItemStatusSchema>;

// Tipos inferidos para parámetros de ruta (route params)
export type OrderIdParamDTO = z.infer<typeof orderIdParamSchema>;
export type OrderItemIdParamDTO = z.infer<typeof orderItemIdParamSchema>;
