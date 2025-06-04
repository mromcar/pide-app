import { z } from 'zod';

export const allergenTranslationSchema = z.object({
  translation_id: z.number().int().optional(),
  language_code: z.string().min(2).max(10),
  name: z.string().min(1).max(100),
  description: z.string().max(65535).optional().nullable()
    .transform(val => val === undefined ? null : val), // Transform undefined to null
});

export const createAllergenTranslationSchema = allergenTranslationSchema.omit({ translation_id: true });

export const updateAllergenTranslationSchema = allergenTranslationSchema.partial().extend({
  language_code: z.string().min(2).max(10), // language_code es necesaria para identificar la traducción a actualizar
  translation_id: z.number().int().optional(), // Puede ser opcional si se identifica por language_code dentro de un alérgeno
});