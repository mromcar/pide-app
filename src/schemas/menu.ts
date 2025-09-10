import { z } from 'zod'

export const languageCodeSchema = z.enum(['es', 'en', 'fr'])

export const translationUpsertSchema = z.object({
  languageCode: languageCodeSchema,
  name: z.string().min(1),
  description: z.string().nullable().optional(),
})

export const categoryUpsertSchema = z.object({
  order: z.number().min(0).optional(),
  active: z.boolean().optional(),
  translations: z.array(
    z.object({
      languageCode: z.enum(['es', 'en', 'fr']),
      name: z.string().min(1),
    })
  ),
})

export const productUpsertSchema = z.object({
  categoryId: z.number().int().positive(),
  price: z.number().nonnegative(),
  active: z.boolean(),
  allergenIds: z.array(z.number().int().positive()).default([]),
  translations: z.array(translationUpsertSchema).min(1),
})

export const variantUpsertSchema = z.object({
  productId: z.number().int().positive(),
  priceModifier: z.number().nonnegative(),
  active: z.boolean(),
  translations: z.array(translationUpsertSchema).min(1),
})

export type CategoryUpsertSchema = z.infer<typeof categoryUpsertSchema>
export type ProductUpsertSchema = z.infer<typeof productUpsertSchema>
export type VariantUpsertSchema = z.infer<typeof variantUpsertSchema>
