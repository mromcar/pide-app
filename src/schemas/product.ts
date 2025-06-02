import { z } from 'zod';
import { UserRole } from '@prisma/client';
import { productTranslationCreateSchema, productTranslationUpdateSchema } from './productTranslation'; // Asumiendo que productTranslationUpdateSchema también es para crear en el contexto de updateProduct

export const productIdSchema = z.object({
  product_id: z.coerce.number().int().positive(),
});

export const productCreateSchema = z.object({
  establishment_id: z.number().int().positive(),
  category_id: z.number().int().positive(),
  name: z.string().min(1).max(255),
  description: z.string().nullable().optional(),
  image_url: z.string().url().max(255).nullable().optional(),
  sort_order: z.number().int().optional().nullable(),
  is_active: z.boolean().optional().default(true),
  responsible_role: z.nativeEnum(UserRole).nullable().optional(),
  translations: z.array(productTranslationCreateSchema).optional(), // productTranslationCreateSchema ya valida language_code y name
  allergen_ids: z.array(z.number().int().positive()).optional(),
  // created_by_user_id se añadirá en el servicio
});

export const productUpdateSchema = z.object({
  category_id: z.number().int().positive().optional(),
  name: z.string().min(1).max(255).optional(),
  description: z.string().nullable().optional(),
  image_url: z.string().url().max(255).nullable().optional(),
  sort_order: z.number().int().optional().nullable(),
  is_active: z.boolean().optional(),
  responsible_role: z.nativeEnum(UserRole).nullable().optional(),
  // Para las traducciones en la actualización, si se proporcionan, deben ser válidas para la creación.
  // productTranslationCreateSchema asegura que language_code y name son strings no vacíos.
  translations: z.array(productTranslationCreateSchema).optional(), 
  allergen_ids: z.array(z.number().int().positive()).optional(),
});

export type ProductCreateInput = z.infer<typeof productCreateSchema>;
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;

// No es necesario productResponseSchema si los DTOs de respuesta se manejan manualmente
// o si se quiere un control más granular sobre lo que se expone.
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