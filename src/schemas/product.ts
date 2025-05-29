import { z } from 'zod';
import { UserRole } from '@prisma/client'; // Assuming UserRole enum is accessible
import { productTranslationCreateSchema, productTranslationUpdateSchema } from './productTranslation'; // Assuming these exist

export const productIdSchema = z.object({
  product_id: z.number().int().positive(),
});

export const productCreateSchema = z.object({
  establishment_id: z.number().int().positive(),
  category_id: z.number().int().positive(),
  name: z.string().min(1).max(255),
  description: z.string().nullable().optional(),
  image_url: z.string().url().nullable().optional(),
  sort_order: z.number().int().optional().nullable().default(0),
  is_active: z.boolean().optional().nullable().default(true),
  responsible_role: z.nativeEnum(UserRole).nullable().optional(),
  created_by_user_id: z.number().int().positive().nullable().optional(),
  translations: z.array(productTranslationCreateSchema).optional(),
  allergen_ids: z.array(z.number().int().positive()).optional(), // For associating allergens by ID
});

export const productUpdateSchema = z.object({
  establishment_id: z.number().int().positive().optional(),
  category_id: z.number().int().positive().optional(),
  name: z.string().min(1).max(255).optional(),
  description: z.string().nullable().optional(),
  image_url: z.string().url().nullable().optional(),
  sort_order: z.number().int().optional().nullable(),
  is_active: z.boolean().optional().nullable(),
  responsible_role: z.nativeEnum(UserRole).nullable().optional(),
  translations: z.array(z.union([productTranslationCreateSchema, productTranslationUpdateSchema])).optional(),
  allergen_ids: z.array(z.number().int().positive()).optional(),
});

// Basic response schema, can be expanded with relations
export const productResponseSchema = z.object({
  product_id: z.number().int().positive(),
  establishment_id: z.number().int().positive(),
  category_id: z.number().int().positive(),
  name: z.string(),
  description: z.string().nullable(),
  image_url: z.string().url().nullable(),
  sort_order: z.number().int().nullable(),
  is_active: z.boolean().nullable(),
  responsible_role: z.nativeEnum(UserRole).nullable(),
  created_by_user_id: z.number().int().positive().nullable(),
  created_at: z.string().datetime().nullable(), // Assuming ISO string format for dates
  updated_at: z.string().datetime().nullable(),
  deleted_at: z.string().datetime().nullable(),
  // translations, variants, allergens can be added here if needed, using their respective response schemas
});