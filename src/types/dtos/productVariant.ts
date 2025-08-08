import { ProductVariantTranslationCreateDTO, ProductVariantTranslationUpdateDTO, ProductVariantTranslationResponseDTO } from './productVariantTranslation';

export interface ProductVariantCreateDTO {
  productId: number;
  establishmentId: number;
  variantDescription: string;
  price: number; // Use number for DTOs, will be converted to Decimal by Prisma
  sku?: string | null;
  sortOrder?: number | null;
  isActive?: boolean | null;
  createdByUserId?: number | null;
  translations?: ProductVariantTranslationCreateDTO[];
}

export interface ProductVariantUpdateDTO {
  productId?: number;
  establishmentId?: number;
  variantDescription?: string;
  price?: number;
  sku?: string | null;
  sortOrder?: number | null;
  isActive?: boolean | null;
  translations?: (ProductVariantTranslationCreateDTO | ProductVariantTranslationUpdateDTO)[];
}

export interface ProductVariantResponseDTO {
  variantId: number;
  productId: number;
  establishmentId: number;
  variantDescription: string;
  price: number; // Or string, depending on how you want to handle decimals in responses
  sku?: string | null;
  sortOrder?: number | null;
  isActive?: boolean | null;
  createdByUserId?: number | null;
  createdAt?: string | null; // Dates as ISO strings
  updatedAt?: string | null;
  deletedAt?: string | null;
  translations?: ProductVariantTranslationResponseDTO[];
}
