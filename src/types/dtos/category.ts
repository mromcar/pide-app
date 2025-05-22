// src/types/dtos/category.ts
import { z } from 'zod';
import {
  createCategorySchema,
  updateCategorySchema,
  categoryIdParamSchema,
  categoryTranslationSchema,
} from '../../schemas/category'; // Ajusta la ruta si es necesario

// Tipos inferidos de los esquemas Zod para el cuerpo de la solicitud (request body)
export type CreateCategoryDTO = z.infer<typeof createCategorySchema>;
export type UpdateCategoryDTO = z.infer<typeof updateCategorySchema>;
export type CategoryTranslationDTO = z.infer<typeof categoryTranslationSchema>;

// Tipos inferidos para parámetros de ruta (route params)
export type CategoryIdParamDTO = z.infer<typeof categoryIdParamSchema>;
