import { z } from 'zod';

export const productHistoryIdSchema = z.object({
  id: z.number().int().positive(),
});

// Schema for when ProductHistory records are created (likely internal)
export const productHistoryCreateSchema = z.object({
  product_id: z.number().int().positive().nullable(),
  name: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  is_active: z.boolean().nullable().optional(),
  // updated_at is usually set by the database or application logic
});

export const productHistoryResponseSchema = z.object({
  id: z.number().int().positive(),
  product_id: z.number().int().positive().nullable(),
  name: z.string().nullable(),
  description: z.string().nullable(),
  is_active: z.boolean().nullable(),
  updated_at: z.string().datetime().nullable(), // Assuming ISO string format
});