// src/schemas/category.ts
import { z } from 'zod';
import { idSchema, languageCodeSchema, optionalString, optionalUrl, nonNegativeInt } from './common';

// Esquema para Traducción de Categoría
export const categoryTranslationSchema = z.object({
  languageCode: languageCodeSchema,
  name: z.string().min(1, "Name is required").max(255),
  description: optionalString, // Ahora soporta descripción opcional
});
export type CategoryTranslationInput = z.infer<typeof categoryTranslationSchema>;

// Esquema para Crear Categoría
export const createCategorySchema = z.object({
  establishmentId: idSchema,
  name: z.string().min(1, "Name is required").max(255), // Nombre por defecto
  imageUrl: optionalUrl,
  sortOrder: nonNegativeInt.default(0).optional(),
  isActive: z.boolean().default(true).optional(),
  translations: z.array(categoryTranslationSchema).optional(),
});
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

// Esquema para Actualizar Categoría
export const updateCategorySchema = createCategorySchema.partial().extend({
  // Si tienes traducciones, necesitas una estrategia para actualizarlas:
  // Por simplicidad, `partial()` hace que `translations` sea opcional.
  // Si se envía, se pueden reemplazar.
});
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

// Esquema para actualización parcial de traducciones de categoría
export const updateCategoryTranslationSchema = categoryTranslationSchema.partial().extend({
  languageCode: languageCodeSchema, // Siempre requerido para identificar la traducción
});
export type UpdateCategoryTranslationInput = z.infer<typeof updateCategoryTranslationSchema>;

// Esquema para parámetros de ruta (e.g., /api/categories/:categoryId)
export const categoryIdParamSchema = z.object({
  categoryId: z.coerce.number().int().positive(),
});
export type CategoryIdParam = z.infer<typeof categoryIdParamSchema>;
