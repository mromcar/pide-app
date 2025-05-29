import { ProductVariantTranslationCreateDTO, ProductVariantTranslationUpdateDTO, ProductVariantTranslationResponseDTO } from './productVariantTranslation';

export interface ProductVariantCreateDTO {
  product_id: number;
  establishment_id: number;
  variant_description: string;
  price: number; // Use number for DTOs, will be converted to Decimal by Prisma
  sku?: string | null;
  sort_order?: number | null;
  is_active?: boolean | null;
  created_by_user_id?: number | null;
  translations?: ProductVariantTranslationCreateDTO[];
}

export interface ProductVariantUpdateDTO {
  product_id?: number;
  establishment_id?: number;
  variant_description?: string;
  price?: number;
  sku?: string | null;
  sort_order?: number | null;
  is_active?: boolean | null;
  translations?: (ProductVariantTranslationCreateDTO | ProductVariantTranslationUpdateDTO)[];
}

export interface ProductVariantResponseDTO {
  variant_id: number;
  product_id: number;
  establishment_id: number;
  variant_description: string;
  price: number; // Or string, depending on how you want to handle decimals in responses
  sku?: string | null;
  sort_order?: number | null;
  is_active?: boolean | null;
  created_by_user_id?: number | null;
  created_at?: string | null; // Dates as ISO strings
  updated_at?: string | null;
  deleted_at?: string | null;
  translations?: ProductVariantTranslationResponseDTO[];
}
