import { z } from 'zod';

export const productTranslationIdSchema = z.object({
  translation_id: z.number().int().positive(),
});

export const productTranslationCreateSchema = z.object({
  language_code: z.string().min(2).max(10), // e.g., 'en', 'es-ES'
  name: z.string().min(1).max(255),
  description: z.string().nullable().optional(),
  product_id: z.number().int().positive().optional(), // Optional if created nested
});

export const productTranslationUpdateSchema = z.object({
  translation_id: z.number().int().positive().optional(), // For identifying existing translation to update
  language_code: z.string().min(2).max(10).optional(),
  name: z.string().min(1).max(255).optional(),
  description: z.string().nullable().optional(),
});

export const productTranslationResponseSchema = z.object({
  translation_id: z.number().int().positive(),
  product_id: z.number().int().positive(),
  language_code: z.string(),
  name: z.string(),
  description: z.string().nullable(),
});