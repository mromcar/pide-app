import { z } from 'zod';
import { createAllergenTranslationSchema, updateAllergenTranslationSchema } from './allergenTranslation'; // Importación actualizada

export const baseAllergenSchema = z.object({
  code: z.string().min(1).max(20),
  name: z.string().min(1).max(100),
  description: z.string().max(65535).optional().nullable(),
  icon_url: z.string().url().max(255).optional().nullable(),
  is_major_allergen: z.boolean().optional().default(true),
});

export const createAllergenSchema = baseAllergenSchema.extend({
  translations: z.array(createAllergenTranslationSchema).optional(),
});

export const updateAllergenSchema = baseAllergenSchema.partial().extend({
  translations: z.array(updateAllergenTranslationSchema).optional(),
});

export const allergenIdSchema = z.object({
  allergen_id: z.coerce.number().int().positive(),
});