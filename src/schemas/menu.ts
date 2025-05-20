import { z } from 'zod'

// Base schemas for common fields
const baseFields = {
  name: z.string().min(1, "Name is required"),
  sort_order: z.number().int().optional(),
}

// Category schemas
export const createCategorySchema = z.object({
  ...baseFields,
})

export const updateCategorySchema = z.object({
  category_id: z.number().int().positive(),
  ...baseFields,
})

// Product schemas
export const createProductSchema = z.object({
  ...baseFields,
  price: z.number().min(0, "Price must be positive"),
  category_id: z.number().int().positive(),
  description: z.string().optional(),
})

export const updateProductSchema = z.object({
  product_id: z.number().int().positive(),
  ...baseFields,
  price: z.number().min(0, "Price must be positive"),
  description: z.string().optional(),
})

// Delete schemas
export const deleteSchema = z.object({
  category_id: z.number().int().positive(),
}).or(z.object({
  product_id: z.number().int().positive(),
}))

// Types
export type CreateCategoryInput = z.infer<typeof createCategorySchema>
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>
export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>
export type DeleteInput = z.infer<typeof deleteSchema>
