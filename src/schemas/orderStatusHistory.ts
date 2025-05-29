import { z } from 'zod';
import { OrderStatus } from '@prisma/client';

export const orderStatusHistoryIdSchema = z.object({
  historyId: z.coerce.number().int().positive(),
});

const orderStatusEnum = z.nativeEnum(OrderStatus);

export const orderStatusHistoryCreateSchema = z.object({
  order_id: z.number().int().positive(),
  status: orderStatusEnum,
  changed_by_user_id: z.number().int().positive().optional().nullable(),
  notes: z.string().optional().nullable(),
});

// No update schema as it's append-only

export type OrderStatusHistoryCreateInput = z.infer<typeof orderStatusHistoryCreateSchema>;