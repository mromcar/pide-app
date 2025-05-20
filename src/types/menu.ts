import type { Prisma } from '@prisma/client';

// Enums
export enum UserRole {
  client = 'client',
  waiter = 'waiter',
  cook = 'cook',
  establishment_admin = 'establishment_admin',
  general_admin = 'general_admin'
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PREPARING = 'PREPARING',
  READY = 'READY',
  DELIVERED = 'DELIVERED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum OrderItemStatus {
  PENDING = 'PENDING',
  PREPARING = 'PREPARING',
  READY = 'READY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

// Base Translation Types
export type CategoryTranslation = {
  translation_id: number;
  category_id: number;
  language_code: string;
  name: string;
};

export type ProductTranslation = {
  translation_id: number;
  product_id: number;
  language_code: string;
  name: string;
  description: string | null;
};

export type ProductVariantTranslation = {
  translation_id: number;
  variant_id: number;
  language_code: string;
  variant_description: string;
};

export type AllergenTranslation = {
  translation_id: number;
  allergen_id: number;
  language_code: string;
  name: string;
  description?: string | null;
};

// Main Entity Types (Representing the structure as returned by Prisma Client by default)
export type Category = {
  category_id: number;
  establishment_id: number;
  name: string;
  image_url: string | null;
  sort_order: number | null;
  is_active: boolean | null;
  translations: CategoryTranslation[];
  products: Product[];
};

export type Product = {
  product_id: number;
  establishment_id: number;
  category_id: number;
  name: string;
  description: string | null;
  image_url: string | null;
  sort_order: number | null;
  is_active: boolean | null;
  translations: ProductTranslation[];
  variants: ProductVariant[];
  // Si tu consulta de Prisma SIEMPRE incluye el objeto Allergen completo anidado dentro de ProductAllergen
  // entonces ProductAllergen debería tener la propiedad `allergen: Allergen`.
  // Si no, si solo devuelve product_id y allergen_id, se mantiene como estaba originalmente (sin 'allergen').
  // Por ahora, asumimos que sí lo incluyes para la serialización.
  allergens: ProductAllergen[];
};

export type ProductVariant = {
  variant_id: number;
  product_id: number;
  establishment_id: number;
  variant_description: string;
  price: Prisma.Decimal;
  sku: string | null;
  sort_order: number | null;
  is_active: boolean | null;
  translations: ProductVariantTranslation[];
};

export type Allergen = {
  allergen_id: number;
  code: string;
  name: string;
  description: string | null;
  icon_url: string | null;
  is_major_allergen: boolean;
  translations: AllergenTranslation[];
};

export type ProductAllergen = {
  product_id: number;
  allergen_id: number;
  // Añadimos 'allergen' aquí porque es lo que esperarías incluir para poder serializarlo.
  // Tu query de Prisma debería usar `include: { allergen: true }` para esto.
  allergen: Allergen;
};

// Serialized Types (Designed for API responses or transformed data for the frontend)
export type SerializedCategory = {
  category_id: number;
  establishment_id: number;
  name: string; // Ya traducido
  image_url: string | null;
  sort_order: number | null;
  is_active: boolean | null;
  // La propiedad 'translations' se elimina aquí, ya que el 'name' ya está traducido.
  products: SerializedProduct[];
};

export type SerializedProduct = {
  product_id: number;
  establishment_id: number;
  category_id: number;
  name: string; // Ya traducido
  description: string | null; // Ya traducido
  image_url: string | null;
  sort_order: number | null;
  is_active: boolean | null;
  // La propiedad 'translations' se elimina aquí, ya que 'name' y 'description' ya están traducidos.
  variants: SerializedProductVariant[];
  allergens: SerializedProductAllergen[];
};

export type SerializedProductVariant = {
  variant_id: number;
  product_id: number;
  establishment_id: number;
  variant_description: string; // Ya traducido
  price: number; // CAMBIO: Convertido de Prisma.Decimal a number para el frontend
  sku: string | null;
  sort_order: number | null;
  is_active: boolean | null;
  // La propiedad 'translations' se elimina aquí, ya que 'variant_description' ya está traducida.
};

export type SerializedProductAllergen = {
  product_id: number;
  allergen_id: number;
  allergen: SerializedAllergen; // Aquí se incluye el objeto Allergen ya serializado
};

export type SerializedAllergen = {
  allergen_id: number;
  code: string;
  name: string; // Ya traducido
  description: string | null; // Ya traducido
  icon_url: string | null;
  is_major_allergen: boolean;
  // La propiedad 'translations' se elimina aquí, ya que 'name' y 'description' ya están traducido.
};

// Order Related Types
// Estos tipos se serializan para el frontend o para ser usados en la lógica del cliente.
export type SerializedOrderItem = {
  order_item_id: number;
  order_id: number;
  variant_id: number;
  quantity: number;
  unit_price: number; // CAMBIO: De Prisma.Decimal a number
  item_total_price: number | null; // CAMBIO: De Prisma.Decimal a number
  status: OrderItemStatus | null;
  notes: string | null;
  // Añadimos información de la variante y el producto para display en el frontend
  variant: SerializedProductVariant & { product: Pick
