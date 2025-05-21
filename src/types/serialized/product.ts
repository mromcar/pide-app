// src/types/serialized/product.ts

import { UserRole } from '../enums';

// This is an example. Adjust to what you need to send to the client.
export interface SerializedProductVariantTranslation {
  languageCode: string;
  variantDescription: string;
}

export interface SerializedProductVariant {
  variantId: number;
  variantDescription: string; // Default description
  price: number;
  sku?: string | null;
  isActive: boolean;
  translations?: SerializedProductVariantTranslation[]; // Or just the current language
}

export interface SerializedProductTranslation {
  languageCode: string;
  name: string;
  description?: string | null;
}

export interface SerializedAllergenInfo {
  allergenId: number;
  code: string;
  name: string; // Default name
  iconUrl?: string | null;
}

export interface SerializedProduct {
  productId: number;
  establishmentId: number;
  categoryId: number;
  name: string; // Default name
  description?: string | null; // Default description
  imageUrl?: string | null;
  sortOrder?: number;
  isActive: boolean;
  responsibleRole?: UserRole | null;
  translations?: SerializedProductTranslation[]; // Or just the current language
  variants?: SerializedProductVariant[];
  allergens?: SerializedAllergenInfo[]; // Simplified allergen info
  // categoryName?: string; // Example of denormalized data
}
