// src/types/dtos/allergen.ts
import { z } from 'zod'
import {
  createAllergenSchema,
  updateAllergenSchema,
  allergenIdParamSchema,
  allergenTranslationSchema,
} from '../../schemas/allergen'

export type CreateAllergenDTO = z.infer<typeof createAllergenSchema>
export type UpdateAllergenDTO = z.infer<typeof updateAllergenSchema>
export type AllergenTranslationDTO = z.infer<typeof allergenTranslationSchema>
export type AllergenIdParamDTO = z.infer<typeof allergenIdParamSchema>
