// src/types/dtos/product.ts
import { z } from 'zod';
import {
  createProductSchema,
  updateProductSchema,
  productIdParamSchema,
  productTranslationSchema,
  createProductVariantSchema,
  updateProductVariantSchema,
  productVariantIdParamSchema,
  productVariantTranslationSchema,
} from '../../schemas/product'; // Ajusta la ruta si es necesario

// --- Product DTOs ---
export type CreateProductDTO = z.infer<typeof createProductSchema>;
export type UpdateProductDTO = z.infer<typeof updateProductSchema>;
export type ProductTranslationDTO = z.infer<typeof productTranslationSchema>;

// --- Product Variant DTOs ---
export type CreateProductVariantDTO = z.infer<typeof createProductVariantSchema>;
export type UpdateProductVariantDTO = z.infer<typeof updateProductVariantSchema>;
export type ProductVariantTranslationDTO = z.infer<typeof productVariantTranslationSchema>;

// --- Route Param DTOs ---
export type ProductIdParamDTO = z.infer<typeof productIdParamSchema>;
export type ProductVariantIdParamDTO = z.infer<typeof productVariantIdParamSchema>;
