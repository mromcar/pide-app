// src/types/dtos.ts
import { z } from 'zod';
import { OrderStatus, PaymentMethod } from '@prisma/client'; // Importa los enums si no están ya

// Para la creación de un ítem de pedido (un producto/variante específico en el carrito)
export const CreateOrderItemSchema = z.object({
  variant_id: z.number().int().positive(),
  quantity: z.number().int().positive(),
});

// Para la creación de un pedido completo desde el cliente
export const CreateOrderSchema = z.object({
  establishment_id: z.number().int().positive(), // El ID del establecimiento para el que se hace el pedido
  table_number: z.string().min(1, 'El número de mesa es requerido'),
  items: z.array(CreateOrderItemSchema).min(1, 'El pedido debe contener al menos un ítem'),
  notes: z.string().max(500).optional().nullable(),
  // Opcional: permitir al cliente especificar el método de pago inicial si es relevante
  // payment_method: z.nativeEnum(PaymentMethod).optional(),
});

// Infiriendo el tipo TypeScript de los esquemas de Zod
export type CreateOrderItemDTO = z.infer<typeof CreateOrderItemSchema>;
export type CreateOrderDTO = z.infer<typeof CreateOrderSchema>;

// Esquema para actualizar el estado del pedido (usado por empleados)
export const UpdateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus), // Asegúrate de que OrderStatus sea importado de @prisma/client
  notes: z.string().max(500).optional().nullable(), // Notas para el cambio de estado
});

export type UpdateOrderStatusDTO = z.infer<typeof UpdateOrderStatusSchema>;
