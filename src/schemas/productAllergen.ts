import { z } from 'zod';
// import { allergenResponseSchema } from './allergen'; // If including full allergen details

export const productAllergenIdSchema = z.object({
  product_id: z.number().int().positive(),
  allergen_id: z.number().int().positive(),
});

export const productAllergenCreateSchema = z.object({
  product_id: z.number().int().positive(),
  allergen_id: z.number().int().positive(),
});

// Response schema might just be the IDs or could include nested allergen info
export const productAllergenResponseSchema = z.object({
  product_id: z.number().int().positive(),
  allergen_id: z.number().int().positive(),
  // allergen: allergenResponseSchema.optional(), // If you want to nest allergen details
});