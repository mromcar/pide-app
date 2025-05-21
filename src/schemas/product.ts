// src/schemas/product.ts
import { z } from 'zod';
import { UserRole } from '../types/enums'; // Asegúrate que la ruta sea correcta
import { idSchema, languageCodeSchema, optionalString, optionalUrl, nonNegativeInt, positiveInt } from './common';

// Esquema para Traducción de Producto
export const productTranslationSchema = z.object({
  languageCode: languageCodeSchema,
  name: z.string().min(1).max(255),
  description: optionalString,
});
export type ProductTranslationInput = z.infer<typeof productTranslationSchema>;

// Esquema para Traducción de Variante de Producto
export const productVariantTranslationSchema = z.object({
  languageCode: languageCodeSchema,
  variantDescription: z.string().min(1).max(255),
});
export type ProductVariantTranslationInput = z.infer<typeof productVariantTranslationSchema>;

// Esquema para Variante de Producto (para creación)
export const createProductVariantSchema = z.object({
  variantDescription: z.string().min(1, "Variant description is required").max(100),
  price: z.number().positive("Price must be positive"),
  sku: optionalString.max(50, "SKU cannot exceed 50 characters"),
  sortOrder: nonNegativeInt.default(0).optional(),
  isActive: z.boolean().default(true).optional(),
  translations: z.array(productVariantTranslationSchema).optional(),
});
export type CreateProductVariantInput = z.infer<typeof createProductVariantSchema>;

// Esquema para Actualizar Variante de Producto
export const updateProductVariantSchema = createProductVariantSchema.partial().extend({
  variantId: idSchema.optional(), // Para identificar la variante existente si se actualizan en lote
});
export type UpdateProductVariantInput = z.infer<typeof updateProductVariantSchema>;

// Esquema para Crear Producto
export const createProductSchema = z.object({
  establishmentId: idSchema,
  categoryId: idSchema,
  name: z.string().min(1, "Product name is required").max(255), // Nombre por defecto
  description: optionalString, // Descripción por defecto
  imageUrl: optionalUrl,
  sortOrder: nonNegativeInt.default(0).optional(),
  isActive: z.boolean().default(true).optional(),
  responsibleRole: z.nativeEnum(UserRole).refine(
    role => role === UserRole.COOK || role === UserRole.WAITER,
    { message: "Responsible role must be 'cook' or 'waiter'" }
  ).optional().nullable(),
  translations: z.array(productTranslationSchema).optional(),
  variants: z.array(createProductVariantSchema).min(1, "Product must have at least one variant"),
  allergenIds: z.array(idSchema).optional(), // IDs de alérgenos a asociar
});
export type CreateProductInput = z.infer<typeof createProductSchema>;

// Esquema para Actualizar Producto
export const updateProductSchema = createProductSchema.partial().extend({
  // Las variantes y alérgenos en una actualización podrían necesitar manejo especial:
  // - variants: ¿reemplazar todas, o permitir añadir/modificar/eliminar individuales?
  //   `updateProductVariantSchema` incluye un `variantId` opcional para ayudar con esto.
  // - allergenIds: ¿reemplazar la lista, o tener operaciones de añadir/quitar?
  // Por ahora, `partial()` las hace opcionales, implicando que si se envían, reemplazan.
  variants: z.array(updateProductVariantSchema).optional(),
});
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

// Esquema para parámetros de ruta (e.g., /api/products/:productId)
export const productIdParamSchema = z.object({
  productId: z.coerce.number().int().positive(),
});
export type ProductIdParam = z.infer<typeof productIdParamSchema>;

export const productVariantIdParamSchema = z.object({
  productId: z.coerce.number().int().positive(),
  variantId: z.coerce.number().int().positive(),
});
export type ProductVariantIdParam = z.infer<typeof productVariantIdParamSchema>;
