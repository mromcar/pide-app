import { z } from 'zod';

export const productVariantTranslationIdSchema = z.object({
  translationId: z.number().int().positive(),
});

export const productVariantTranslationCreateSchema = z.object({
  languageCode: z.string().min(2).max(10),
  variantDescription: z.string().min(1).max(255),
  variantId: z.number().int().positive().optional(),
});

export const productVariantTranslationUpdateSchema = z.object({
  translationId: z.number().int().positive().optional(),
  languageCode: z.string().min(2).max(10).optional(),
  variantDescription: z.string().min(1).max(255).optional(),
});

export const productVariantTranslationResponseSchema = z.object({
  translationId: z.number().int().positive(),
  variantId: z.number().int().positive(),
  languageCode: z.string(),
  variantDescription: z.string(),
});
