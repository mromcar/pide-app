// src/schemas/allergen.ts
import { z } from 'zod';
import { languageCodeSchema, optionalString, optionalUrl, idSchema } from './common';

// Esquema para Traducción de Alérgeno
export const allergenTranslationSchema = z.object({
  languageCode: languageCodeSchema,
  name: z.string().min(1).max(100),
  description: optionalString,
});
export type AllergenTranslationInput = z.infer<typeof allergenTranslationSchema>;

// Esquema para Crear Alérgeno
export const createAllergenSchema = z.object({
  code: z.string().min(1, "Code is required").max(20),
  name: z.string().min(1, "Name is required").max(100), // Nombre por defecto
  description: optionalString,
  iconUrl: optionalUrl,
  isMajorAllergen: z.boolean().default(true).optional(),
  translations: z.array(allergenTranslationSchema).optional(),
});
export type CreateAllergenInput = z.infer<typeof createAllergenSchema>;

// Esquema para Actualizar Alérgeno
export const updateAllergenSchema = createAllergenSchema.partial();
export type UpdateAllergenInput = z.infer<typeof updateAllergenSchema>;

// Esquema para parámetros de ruta
export const allergenIdParamSchema = z.object({
  allergenId: z.coerce.number().int().positive(),
});
export type AllergenIdParam = z.infer<typeof allergenIdParamSchema>;
