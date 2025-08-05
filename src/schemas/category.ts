import { z } from 'zod';
import { categoryTranslationCreateSchema, categoryTranslationUpdateSchema } from './categoryTranslation';

export const categoryIdSchema = z.object({
  categoryId: z.coerce.number().int().positive(),
});

export const categoryCreateSchema = z.object({
  establishment_id: z.number().int().positive(),
  name: z.string().min(1).max(255),
  sort_order: z.number().int().optional().nullable(),
  is_active: z.boolean().optional().nullable(),
  translations: z.array(categoryTranslationCreateSchema).optional(),
});

export const categoryUpdateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  sort_order: z.number().int().optional().nullable(),
  is_active: z.boolean().optional().nullable(),
  translations: z.array(categoryTranslationCreateSchema).optional(),
});

export type CategoryCreateInput = z.infer<typeof categoryCreateSchema>;
export type CategoryUpdateInput = z.infer<typeof categoryUpdateSchema>;
export type CategoryTranslationCreateInput = z.infer<typeof categoryTranslationCreateSchema>;
export type CategoryTranslationUpdateInput = z.infer<typeof categoryTranslationUpdateSchema>;
