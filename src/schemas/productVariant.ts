import { z } from 'zod';
import { productVariantTranslationCreateSchema, productVariantTranslationUpdateSchema } from './productVariantTranslation'; // Assuming these exist

export const productVariantIdSchema = z.object({
  variantId: z.number().int().positive(),
});

export const productVariantCreateSchema = z.object({
  productId: z.number().int().positive(),
  establishmentId: z.number().int().positive(),
  variantDescription: z.string().min(1).max(100),
  price: z.number().positive(), // Zod schema uses number for decimals
  sku: z.string().max(50).nullable().optional(),
  sortOrder: z.number().int().optional().nullable().default(0),
  isActive: z.boolean().optional().nullable().default(true),
  createdByUserId: z.number().int().positive().nullable().optional(),
  translations: z.array(productVariantTranslationCreateSchema).optional(),
});

export const productVariantUpdateSchema = z.object({
  productId: z.number().int().positive().optional(),
  establishmentId: z.number().int().positive().optional(),
  variantDescription: z.string().min(1).max(100).optional(),
  price: z.number().positive().optional(),
  sku: z.string().max(50).nullable().optional(),
  sortOrder: z.number().int().optional().nullable(),
  isActive: z.boolean().optional().nullable(),
  translations: z.array(z.union([productVariantTranslationCreateSchema, productVariantTranslationUpdateSchema])).optional(),
});

export const productVariantResponseSchema = z.object({
  variantId: z.number().int().positive(),
  productId: z.number().int().positive(),
  establishmentId: z.number().int().positive(),
  variantDescription: z.string(),
  price: z.number(), // Or z.string() if you prefer string representation for decimals
  sku: z.string().nullable(),
  sortOrder: z.number().int().nullable(),
  isActive: z.boolean().nullable(),
  createdByUserId: z.number().int().positive().nullable(),
  createdAt: z.string().datetime().nullable(),
  updatedAt: z.string().datetime().nullable(),
  deletedAt: z.string().datetime().nullable(),
  // translations: z.array(productVariantTranslationResponseSchema).optional(), // Add if needed
});
