import { z } from 'zod';

export const productHistoryIdSchema = z.object({
  id: z.number().int().positive(),
});

// Schema for when ProductHistory records are created (likely internal)
export const productHistoryCreateSchema = z.object({
  productId: z.number().int().positive().nullable(),
  name: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  isActive: z.boolean().nullable().optional(),
  // updatedAt is usually set by the database or application logic
});

export const productHistoryResponseSchema = z.object({
  id: z.number().int().positive(),
  productId: z.number().int().positive().nullable(),
  name: z.string().nullable(),
  description: z.string().nullable(),
  isActive: z.boolean().nullable(),
  updatedAt: z.string().datetime().nullable(), // Assuming ISO string format
});
