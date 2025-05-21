// src/types/dtos/product.ts
import { z } from 'zod';
import {
  createProductSchema,
  updateProductSchema,
  createProductVariantSchema,
  updateProductVariantSchema,
  productIdParamSchema,
  productVariantIdParamSchema,
  productTranslationSchema, // Si necesitas este tipo directamente
  productVariantTranslationSchema // Si necesitas este tipo directamente
} from '../../schemas/product'; // Asegúrate que la ruta sea correcta

import {
  createCategorySchema,
  updateCategorySchema,
  categoryIdParamSchema,
  categoryTranslationSchema // Si necesitas este tipo directamente
} from '../../schemas/category'; // Asegúrate que la ruta sea correcta

import {
  createAllergenSchema,
  updateAllergenSchema,
  allergenIdParamSchema,
  allergenTranslationSchema // Si necesitas este tipo directamente
} from '../../schemas/allergen'; // Asegúrate que la ruta sea correcta

// --- Product DTOs ---
export type CreateProductDTO = z.infer<typeof createProductSchema>;
export type UpdateProductDTO = z.infer<typeof updateProductSchema>;
export type ProductTranslationDTO = z.infer<typeof productTranslationSchema>;

// --- Product Variant DTOs ---
export type CreateProductVariantDTO = z.infer<typeof createProductVariantSchema>;
export type UpdateProductVariantDTO = z.infer<typeof updateProductVariantSchema>;
export type ProductVariantTranslationDTO = z.infer<typeof productVariantTranslationSchema>;

// --- Category DTOs (si los gestionas o necesitas aquí) ---
export type CreateCategoryDTO = z.infer<typeof createCategorySchema>;
export type UpdateCategoryDTO = z.infer<typeof updateCategorySchema>;
export type CategoryTranslationDTO = z.infer<typeof categoryTranslationSchema>;

// --- Allergen DTOs (si los gestionas o necesitas aquí) ---
export type CreateAllergenDTO = z.infer<typeof createAllergenSchema>;
export type UpdateAllergenDTO = z.infer<typeof updateAllergenSchema>;
export type AllergenTranslationDTO = z.infer<typeof allergenTranslationSchema>;

// --- Route Param DTOs ---
export type ProductIdParamDTO = z.infer<typeof productIdParamSchema>;
export type ProductVariantIdParamDTO = z.infer<typeof productVariantIdParamSchema>;
export type CategoryIdParamDTO = z.infer<typeof categoryIdParamSchema>;
export type AllergenIdParamDTO = z.infer<typeof allergenIdParamSchema>;
