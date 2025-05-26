// src/types/entities/product.ts

import { UserRole } from '../enums';
import { Category } from './category';
import { Establishment } from './establishment';
import { Allergen } from './allergen';
import { OrderItem } from './order';

export interface ProductTranslation {
  translationId: number;
  productId: number;
  languageCode: string;
  name: string;
  description?: string | null;
  product?: Product;
}

export interface ProductVariantTranslation {
  translationId: number;
  variantId: number;
  languageCode: string;
  variantDescription: string;
  variant?: ProductVariant;
}

export interface ProductVariant {
  variantId: number;
  productId: number;
  establishmentId: number;
  variantDescription: string;
  price: number;
  sku?: string | null;
  sortOrder?: number | null;
  isActive: boolean;
  product?: Product;
  establishment?: Establishment;
  translations?: ProductVariantTranslation[];
  orderItems?: OrderItem[];
}

export interface ProductAllergen {
  productId: number;
  allergenId: number;
  product?: Product;
  allergen?: Allergen;
}

export interface Product {
  productId: number;
  establishmentId: number;
  categoryId: number;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  sortOrder?: number | null;
  isActive: boolean;
  responsibleRole?: UserRole | null;
  category?: Category;
  establishment?: Establishment;
  translations?: ProductTranslation[];
  variants?: ProductVariant[];
  allergens?: ProductAllergen[];
}
