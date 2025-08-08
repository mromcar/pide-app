import { z } from 'zod';

export const categoryTranslationIdSchema = z.object({
  translationId: z.coerce.number().int().positive(),
});

export const categoryTranslationCreateSchema = z.object({
  languageCode: z.string().min(2).max(10),
  name: z.string().min(1).max(255),
});

export const categoryTranslationUpdateSchema = z.object({
  translationId: z.number().int().positive().optional(), // For identifying the translation to update
  languageCode: z.string().min(2).max(10).optional(),
  name: z.string().min(1).max(255).optional(),
});

export type CategoryTranslationCreateInput = z.infer<typeof categoryTranslationCreateSchema>;
export type CategoryTranslationUpdateInput = z.infer<typeof categoryTranslationUpdateSchema>;
