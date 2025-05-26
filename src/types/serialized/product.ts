// src/types/serialized/product.ts

import { UserRole } from '../enums';

// This is an example. Adjust to what you need to send to the client.
export interface SerializedProductVariantTranslation {
  languageCode: string;
  variantDescription: string;
}

export interface SerializedProductVariant {
  variantId: number;
  variantDescription: string;
  price: number;
  sku?: string | null;
  isActive: boolean;
  translations?: SerializedProductVariantTranslation[];
}

export interface SerializedProductTranslation {
  languageCode: string;
  name: string;
  description?: string | null;
}

export interface SerializedAllergenInfo {
  allergenId: number;
  code: string;
  name: string;
  iconUrl?: string | null;
}

export interface SerializedProduct {
  productId: number;
  establishmentId: number;
  categoryId: number;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  sortOrder?: number;
  isActive: boolean;
  responsibleRole?: UserRole | null;
  translations?: SerializedProductTranslation[];
  variants?: SerializedProductVariant[];
  allergens?: SerializedAllergenInfo[];
}
