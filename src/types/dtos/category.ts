import { CategoryTranslationCreateDTO, CategoryTranslationDTO, CategoryTranslationUpdateDTO } from './categoryTranslation';

export interface CategoryCreateDTO {
  establishmentId: number;
  name: string;
  sortOrder?: number | null;
  isActive?: boolean | null;
  translations?: CategoryTranslationCreateDTO[]; // ✅ Usa el DTO correcto sin description
}

export interface CategoryUpdateDTO {
  name?: string;
  sortOrder?: number | null;
  isActive?: boolean | null;
  translations?: (CategoryTranslationCreateDTO | CategoryTranslationUpdateDTO)[]; // ✅ Usa DTOs correctos
}

export interface CategoryDTO {
  categoryId: number;
  establishmentId: number;
  name: string;
  sortOrder?: number | null;
  isActive?: boolean | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  deletedAt?: string | null;
  translations?: CategoryTranslationDTO[]; // ✅ Usa el DTO correcto
}

export interface CategoryResponseDTO {
  categoryId: number;
  establishmentId: number;
  name: string;
  sortOrder?: number | null;
  isActive: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
  deletedAt?: string | null;
  // ✅ SIN description - correcto según Prisma schema
}
