import { UserRole } from '@prisma/client';
import { ProductTranslationCreateDTO, ProductTranslationUpdateDTO, ProductTranslationResponseDTO } from './productTranslation';
import { ProductAllergenCreateDTO, ProductAllergenResponseDTO } from './productAllergen';
import { ProductVariantResponseDTO } from './productVariant';

// --- Product DTOs ---
export interface ProductCreateDTO {
  establishmentId: number;
  categoryId: number;
  name: string;
  description?: string | null;
  sortOrder?: number | null;
  isActive?: boolean | null;
  responsibleRole?: UserRole | null;
  createdByUserId?: number | null;
  translations?: ProductTranslationCreateDTO[];
  allergenIds?: number[];
}

export interface ProductUpdateDTO {
  establishmentId?: number;
  categoryId?: number;
  name?: string;
  description?: string | null;
  sortOrder?: number | null;
  isActive?: boolean | null;
  responsibleRole?: UserRole | null;
  translations?: (ProductTranslationCreateDTO | ProductTranslationUpdateDTO)[];
  allergenIds?: number[];
}

export interface ProductResponseDTO {
  productId: number;
  establishmentId: number;
  categoryId: number;
  categoryName?: string;
  name: string;
  description?: string | null;
  sortOrder?: number | null;
  isActive: boolean;
  responsibleRole?: string | null;
  createdByUserId?: number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  deletedAt?: string | null;
  translations?: ProductTranslationResponseDTO[];
  allergens?: ProductAllergenResponseDTO[];
  variants?: ProductVariantResponseDTO[];
  imageUrl?: string | null;
}
