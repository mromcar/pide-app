import { CategoryTranslationCreateDTO, CategoryTranslationDTO, CategoryTranslationUpdateDTO } from './categoryTranslation';

export interface CategoryCreateDTO {
  establishment_id: number;
  name: string;
  image_url?: string | null;
  sort_order?: number | null;
  is_active?: boolean | null;
  translations?: CategoryTranslationCreateDTO[];
}

export interface CategoryUpdateDTO {
  name?: string;
  image_url?: string | null;
  sort_order?: number | null;
  is_active?: boolean | null;
  translations?: (CategoryTranslationCreateDTO | CategoryTranslationUpdateDTO)[]; // Allow creating new or updating existing translations
}

export interface CategoryDTO {
  category_id: number;
  establishment_id: number;
  name: string;
  image_url?: string | null;
  sort_order?: number | null;
  is_active?: boolean | null;
  created_at?: string | null; // Dates as strings for DTOs
  updated_at?: string | null;
  deleted_at?: string | null;
  translations?: CategoryTranslationDTO[];
}
