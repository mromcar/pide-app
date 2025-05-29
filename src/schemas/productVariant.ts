import { z } from 'zod';
import { productVariantTranslationCreateSchema, productVariantTranslationUpdateSchema } from './productVariantTranslation'; // Assuming these exist

export const productVariantIdSchema = z.object({
  variant_id: z.number().int().positive(),
});

export const productVariantCreateSchema = z.object({
  product_id: z.number().int().positive(),
  establishment_id: z.number().int().positive(),
  variant_description: z.string().min(1).max(100),
  price: z.number().positive(), // Zod schema uses number for decimals
  sku: z.string().max(50).nullable().optional(),
  sort_order: z.number().int().optional().nullable().default(0),
  is_active: z.boolean().optional().nullable().default(true),
  created_by_user_id: z.number().int().positive().nullable().optional(),
  translations: z.array(productVariantTranslationCreateSchema).optional(),
});

export const productVariantUpdateSchema = z.object({
  product_id: z.number().int().positive().optional(),
  establishment_id: z.number().int().positive().optional(),
  variant_description: z.string().min(1).max(100).optional(),
  price: z.number().positive().optional(),
  sku: z.string().max(50).nullable().optional(),
  sort_order: z.number().int().optional().nullable(),
  is_active: z.boolean().optional().nullable(),
  translations: z.array(z.union([productVariantTranslationCreateSchema, productVariantTranslationUpdateSchema])).optional(),
});

export const productVariantResponseSchema = z.object({
  variant_id: z.number().int().positive(),
  product_id: z.number().int().positive(),
  establishment_id: z.number().int().positive(),
  variant_description: z.string(),
  price: z.number(), // Or z.string() if you prefer string representation for decimals
  sku: z.string().nullable(),
  sort_order: z.number().int().nullable(),
  is_active: z.boolean().nullable(),
  created_by_user_id: z.number().int().positive().nullable(),
  created_at: z.string().datetime().nullable(),
  updated_at: z.string().datetime().nullable(),
  deleted_at: z.string().datetime().nullable(),
  // translations: z.array(productVariantTranslationResponseSchema).optional(), // Add if needed
});