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
  image_url?: string | null;
  sort_order?: number | null;
  is_active?: boolean | null;
  responsible_role?: UserRole | null;
  created_by_user_id?: number | null;
  translations?: ProductTranslationCreateDTO[];
  // Allergens might be associated separately or via a list of allergen_ids
  allergen_ids?: number[];
}

export interface ProductUpdateDTO {
  establishment_id?: number;
  category_id?: number;
  name?: string;
  description?: string | null;
  image_url?: string | null;
  sort_order?: number | null;
  is_active?: boolean | null;
  responsible_role?: UserRole | null;
  // created_by_user_id should generally not be updated
  translations?: (ProductTranslationCreateDTO | ProductTranslationUpdateDTO)[]; // To create new or update existing
  allergen_ids?: number[]; // To update associated allergens
}

export interface ProductResponseDTO {
  product_id: number;
  establishment_id: number;
  category_id: number;
  name: string;
  description?: string | null;
  image_url?: string | null;
  sort_order?: number | null;
  is_active: boolean; // Asumiendo que siempre tendrá un valor (default true en el servicio)
  responsible_role?: string | null; // UserRole es un enum, pero en DTO puede ser string
  created_by_user_id?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
  translations?: ProductTranslationResponseDTO[];
  allergens?: ProductAllergenResponseDTO[];
  variants?: ProductVariantResponseDTO[]; // <--- AÑADIR ESTA LÍNEA
}
  // history is usually not sent in main product response unless specifically requested
