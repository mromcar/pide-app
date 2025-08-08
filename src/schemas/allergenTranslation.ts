import { z } from 'zod';

export const allergenTranslationSchema = z.object({
  translationId: z.number().int().optional(),
  languageCode: z.string().min(2).max(10),
  name: z.string().min(1).max(100),
  description: z.string().max(65535).optional().nullable()
    .transform(val => val === undefined ? null : val), // Transform undefined to null
});

export const createAllergenTranslationSchema = allergenTranslationSchema.omit({ translationId: true });

export const updateAllergenTranslationSchema = allergenTranslationSchema.partial().extend({
  languageCode: z.string().min(2).max(10), // languageCode es necesaria para identificar la traducción a actualizar
  translationId: z.number().int().optional(), // Puede ser opcional si se identifica por languageCode dentro de un alérgeno
});
