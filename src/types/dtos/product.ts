import { UserRole } from '@prisma/client';
import { ProductTranslationCreateDTO, ProductTranslationUpdateDTO, ProductTranslationResponseDTO } from './productTranslation';
import { ProductAllergenCreateDTO, ProductAllergenResponseDTO } from './productAllergen'; // Assuming ProductAllergen DTOs exist
import { ProductVariantResponseDTO } from './productVariant'; // Assuming ProductVariant DTOs exist

// --- Product DTOs ---
export interface ProductCreateDTO {
  establishment_id: number;
  category_id: number;
  name: string;
  description?: string | null;
  sort_order?: number | null;
  is_active?: boolean | null;
  responsible_role?: UserRole | null;
  created_by_user_id?: number | null;
  translations?: ProductTranslationCreateDTO[];
  allergen_ids?: number[];
}

export interface ProductUpdateDTO {
  establishment_id?: number;
  category_id?: number;
  name?: string;
  description?: string | null;
  sort_order?: number | null;
  is_active?: boolean | null;
  responsible_role?: UserRole | null;
  translations?: (ProductTranslationCreateDTO | ProductTranslationUpdateDTO)[];
  allergen_ids?: number[];
}

export interface ProductResponseDTO {
  product_id: number;
  establishment_id: number;
  category_id: number;
  name: string;
  description?: string | null;
  sort_order?: number | null;
  is_active: boolean;
  responsible_role?: string | null;
  created_by_user_id?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
  translations?: ProductTranslationResponseDTO[];
  allergens?: ProductAllergenResponseDTO[];
  variants?: ProductVariantResponseDTO[];
}
