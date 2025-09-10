import { z } from 'zod';
import { categoryTranslationCreateSchema, categoryTranslationUpdateSchema } from './categoryTranslation';

export const categoryIdSchema = z.object({
  categoryId: z.coerce.number().int().positive(),
});

export const categoryCreateSchema = z.object({
  establishmentId: z.number().int().positive(),
  name: z.string().min(1).max(255),
  sortOrder: z.number().int().min(0).nullable().optional().default(0), // ✅ Default to 0, ensure min validation
  isActive: z.boolean().nullable().optional().default(true), // ✅ Default to true
  translations: z.array(categoryTranslationCreateSchema).optional(),
});

export const categoryUpdateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  sortOrder: z.number().int().min(0).nullable().optional(), // ✅ Min validation
  isActive: z.boolean().nullable().optional(),
  translations: z.array(categoryTranslationCreateSchema).optional(),
});

export type CategoryCreateInput = z.infer<typeof categoryCreateSchema>;
export type CategoryUpdateInput = z.infer<typeof categoryUpdateSchema>;
export type CategoryTranslationCreateInput = z.infer<typeof categoryTranslationCreateSchema>;
export type CategoryTranslationUpdateInput = z.infer<typeof categoryTranslationUpdateSchema>;
