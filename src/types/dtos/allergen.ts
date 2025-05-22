// src/types/dtos/allergen.ts
import { z } from 'zod';
import {
  createAllergenSchema,
  updateAllergenSchema,
  allergenIdParamSchema,
  allergenTranslationSchema,
} from '../../schemas/allergen';

// Tipos inferidos de los esquemas Zod para el cuerpo de la solicitud (request body)
export type CreateAllergenDTO = z.infer<typeof createAllergenSchema>;
export type UpdateAllergenDTO = z.infer<typeof updateAllergenSchema>;
export type AllergenTranslationDTO = z.infer<typeof allergenTranslationSchema>;

// Tipos inferidos para parámetros de ruta (route params)
export type AllergenIdParamDTO = z.infer<typeof allergenIdParamSchema>;
