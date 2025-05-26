// src/types/dtos/category.ts
import { z } from 'zod'
import {
  createCategorySchema,
  updateCategorySchema,
  categoryIdParamSchema,
  categoryTranslationSchema,
  updateCategoryTranslationSchema,
} from '../../schemas/category'

// Para crear una categoría (POST)
export type CreateCategoryDTO = z.infer<typeof createCategorySchema>
// Para actualizar una categoría (PUT/PATCH)
export type UpdateCategoryDTO = z.infer<typeof updateCategorySchema>
// Para traducciones de categoría
export type CategoryTranslationDTO = z.infer<typeof categoryTranslationSchema>
export type UpdateCategoryTranslationDTO = z.infer<typeof updateCategoryTranslationSchema>
// Para parámetros de ruta
export type CategoryIdParamDTO = z.infer<typeof categoryIdParamSchema>
