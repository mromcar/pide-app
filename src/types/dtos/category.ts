import { CategoryTranslationCreateDTO, CategoryTranslationDTO, CategoryTranslationUpdateDTO } from './categoryTranslation';

export interface CategoryCreateDTO {
  establishmentId: number;
  name: string;
  sortOrder?: number | null;
  isActive?: boolean | null;
  translations?: CategoryTranslationCreateDTO[];
}

export interface CategoryUpdateDTO {
  name?: string;
  sortOrder?: number | null;
  isActive?: boolean | null;
  translations?: (CategoryTranslationCreateDTO | CategoryTranslationUpdateDTO)[];
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
  translations?: CategoryTranslationDTO[];
}
