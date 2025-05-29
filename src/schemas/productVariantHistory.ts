import { z } from 'zod';

export const productVariantHistoryIdSchema = z.object({
  id: z.number().int().positive(),
});

export const productVariantHistoryCreateSchema = z.object({
  variant_id: z.number().int().positive().nullable(),
  variant_description: z.string().nullable().optional(),
  price: z.number().positive().nullable().optional(),
  is_active: z.boolean().nullable().optional(),
});

export const productVariantHistoryResponseSchema = z.object({
  id: z.number().int().positive(),
  variant_id: z.number().int().positive().nullable(),
  variant_description: z.string().nullable(),
  price: z.number().nullable(), // Or z.string().nullable()
  is_active: z.boolean().nullable(),
  updated_at: z.string().datetime().nullable(),
});