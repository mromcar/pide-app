import { z } from 'zod';
import { UserRole } from '@prisma/client';
import { productTranslationCreateSchema } from './productTranslation';

export const productIdSchema = z.object({
  productId: z.coerce.number().int().positive(),
});

export const productCreateSchema = z.object({
  establishmentId: z.number().int().positive(),
  categoryId: z.number().int().positive(),
  name: z.string().min(1).max(255),
  description: z.string().nullable().optional(),
  sortOrder: z.number().int().optional().nullable(),
  isActive: z.boolean().optional().default(true),
  responsibleRole: z.nativeEnum(UserRole).nullable().optional(),
  translations: z.array(productTranslationCreateSchema).optional(),
  allergenIds: z.array(z.number().int().positive()).optional(),
});

export const productUpdateSchema = z.object({
  categoryId: z.number().int().positive().optional(),
  name: z.string().min(1).max(255).optional(),
  description: z.string().nullable().optional(),
  sortOrder: z.number().int().optional().nullable(),
  isActive: z.boolean().optional(),
  responsibleRole: z.nativeEnum(UserRole).nullable().optional(),
  translations: z.array(productTranslationCreateSchema).optional(),
  allergenIds: z.array(z.number().int().positive()).optional(),
});

export type ProductCreateInput = z.infer<typeof productCreateSchema>;
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;

export const productResponseSchema = z.object({
  productId: z.number().int().positive(),
  establishmentId: z.number().int().positive(),
  categoryId: z.number().int().positive(),
  name: z.string(),
  description: z.string().nullable(),
  sortOrder: z.number().int().nullable(),
  isActive: z.boolean().nullable(),
  responsibleRole: z.nativeEnum(UserRole).nullable(),
  createdByUserId: z.number().int().positive().nullable(),
  createdAt: z.string().datetime().nullable(),
  updatedAt: z.string().datetime().nullable(),
  deletedAt: z.string().datetime().nullable(),
});
