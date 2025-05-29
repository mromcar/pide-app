import { z } from 'zod';
import { OrderItemStatus } from '@prisma/client';

export const orderItemIdSchema = z.object({
  orderItemId: z.coerce.number().int().positive(),
});

const orderItemStatusEnum = z.nativeEnum(OrderItemStatus);

export const orderItemCreateSchema = z.object({
  variant_id: z.number().int().positive(),
  quantity: z.number().int().positive(), // CHECK (quantity > 0)
  unit_price: z.number().positive(), // Prisma Decimal
  notes: z.string().optional().nullable(),
  status: orderItemStatusEnum.optional(), // Default: 'pending'
});

export const orderItemUpdateSchema = z.object({
  quantity: z.number().int().positive().optional(),
  unit_price: z.number().positive().optional(),
  status: orderItemStatusEnum.optional(),
  notes: z.string().optional().nullable(),
});

export type OrderItemCreateInput = z.infer<typeof orderItemCreateSchema>;
export type OrderItemUpdateInput = z.infer<typeof orderItemUpdateSchema>;