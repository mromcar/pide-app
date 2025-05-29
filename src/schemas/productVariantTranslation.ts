import { z } from 'zod';

export const productVariantTranslationIdSchema = z.object({
  translation_id: z.number().int().positive(),
});

export const productVariantTranslationCreateSchema = z.object({
  language_code: z.string().min(2).max(10),
  variant_description: z.string().min(1).max(255),
  variant_id: z.number().int().positive().optional(),
});

export const productVariantTranslationUpdateSchema = z.object({
  translation_id: z.number().int().positive().optional(),
  language_code: z.string().min(2).max(10).optional(),
  variant_description: z.string().min(1).max(255).optional(),
});

export const productVariantTranslationResponseSchema = z.object({
  translation_id: z.number().int().positive(),
  variant_id: z.number().int().positive(),
  language_code: z.string(),
  variant_description: z.string(),
});