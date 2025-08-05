import { z } from 'zod';
import { UserRole } from '@prisma/client';
import { productTranslationCreateSchema, productTranslationUpdateSchema } from './productTranslation';

export const productIdSchema = z.object({
  product_id: z.coerce.number().int().positive(),
});

export const productCreateSchema = z.object({
  establishment_id: z.number().int().positive(),
  category_id: z.number().int().positive(),
  name: z.string().min(1).max(255),
  description: z.string().nullable().optional(),
  sort_order: z.number().int().optional().nullable(),
  is_active: z.boolean().optional().default(true),
  responsible_role: z.nativeEnum(UserRole).nullable().optional(),
  translations: z.array(productTranslationCreateSchema).optional(),
  allergen_ids: z.array(z.number().int().positive()).optional(),
});

export const productUpdateSchema = z.object({
  category_id: z.number().int().positive().optional(),
  name: z.string().min(1).max(255).optional(),
  description: z.string().nullable().optional(),
  sort_order: z.number().int().optional().nullable(),
  is_active: z.boolean().optional(),
  responsible_role: z.nativeEnum(UserRole).nullable().optional(),
  translations: z.array(productTranslationCreateSchema).optional(),
  allergen_ids: z.array(z.number().int().positive()).optional(),
});

export type ProductCreateInput = z.infer<typeof productCreateSchema>;
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;

export const productResponseSchema = z.object({
  product_id: z.number().int().positive(),
  establishment_id: z.number().int().positive(),
  category_id: z.number().int().positive(),
  name: z.string(),
  description: z.string().nullable(),
  sort_order: z.number().int().nullable(),
  is_active: z.boolean().nullable(),
  responsible_role: z.nativeEnum(UserRole).nullable(),
  created_by_user_id: z.number().int().positive().nullable(),
  created_at: z.string().datetime().nullable(),
  updated_at: z.string().datetime().nullable(),
  deleted_at: z.string().datetime().nullable(),
});