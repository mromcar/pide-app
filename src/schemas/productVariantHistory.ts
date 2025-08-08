import { z } from 'zod';

export const productVariantHistoryIdSchema = z.object({
  id: z.number().int().positive(),
});

export const productVariantHistoryCreateSchema = z.object({
  variantId: z.number().int().positive().nullable(),
  variantDescription: z.string().nullable().optional(),
  price: z.number().positive().nullable().optional(),
  isActive: z.boolean().nullable().optional(),
});

export const productVariantHistoryResponseSchema = z.object({
  id: z.number().int().positive(),
  variantId: z.number().int().positive().nullable(),
  variantDescription: z.string().nullable(),
  price: z.number().nullable(),
  isActive: z.boolean().nullable(),
  updatedAt: z.string().datetime().nullable(),
});
