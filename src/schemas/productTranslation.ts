import { z } from 'zod';

export const productTranslationIdSchema = z.object({
  translationId: z.number().int().positive(),
});

export const productTranslationCreateSchema = z.object({
  languageCode: z.string().min(2).max(10), // e.g., 'en', 'es-ES'
  name: z.string().min(1).max(255),
  description: z.string().nullable().optional(),
  productId: z.number().int().positive().optional(), // Optional if created nested
});

export const productTranslationUpdateSchema = z.object({
  translationId: z.number().int().positive().optional(), // For identifying existing translation to update
  languageCode: z.string().min(2).max(10).optional(),
  name: z.string().min(1).max(255).optional(),
  description: z.string().nullable().optional(),
});

export const productTranslationResponseSchema = z.object({
  translationId: z.number().int().positive(),
  productId: z.number().int().positive(),
  languageCode: z.string(),
  name: z.string(),
  description: z.string().nullable(),
});
