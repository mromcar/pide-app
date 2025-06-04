import { z } from 'zod';
import { createAllergenTranslationSchema, updateAllergenTranslationSchema } from './allergenTranslation'; // Importación actualizada

export const baseAllergenSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
  is_major_allergen: z.boolean(),
  description: z.string().nullable().optional().transform(e => e === undefined ? null : e),
  icon_url: z.string().url("Invalid URL format").nullable().optional().transform(e => e === undefined ? null : e), // Transformación añadida aquí
});

export const createAllergenSchema = baseAllergenSchema.extend({
  translations: z.array(createAllergenTranslationSchema).optional(),
});

export const updateAllergenSchema = baseAllergenSchema.extend({
  translations: z.array(updateAllergenTranslationSchema).optional(),
});

export const allergenIdSchema = z.object({
  allergen_id: z.coerce.number().int().positive(),
});