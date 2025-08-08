import { z } from 'zod';
import { createAllergenTranslationSchema, updateAllergenTranslationSchema } from './allergenTranslation';

export const baseAllergenSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
  isMajorAllergen: z.boolean(),
  description: z.string().nullable().optional().transform(e => e === undefined ? null : e),
  iconUrl: z.string().url("Invalid URL format").nullable().optional().transform(e => e === undefined ? null : e),
});

export const createAllergenSchema = baseAllergenSchema.extend({
  translations: z.array(createAllergenTranslationSchema).optional(),
});

export const updateAllergenSchema = baseAllergenSchema.extend({
  translations: z.array(updateAllergenTranslationSchema).optional(),
});

export const allergenIdSchema = z.object({
  allergenId: z.coerce.number().int().positive(),
});
