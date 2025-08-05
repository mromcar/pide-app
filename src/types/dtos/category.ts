import { CategoryTranslationCreateDTO, CategoryTranslationDTO, CategoryTranslationUpdateDTO } from './categoryTranslation';

export interface CategoryCreateDTO {
  establishment_id: number;
  name: string;
  sort_order?: number | null;
  is_active?: boolean | null;
  translations?: CategoryTranslationCreateDTO[];
}

export interface CategoryUpdateDTO {
  name?: string;
  sort_order?: number | null;
  is_active?: boolean | null;
  translations?: (CategoryTranslationCreateDTO | CategoryTranslationUpdateDTO)[];
}

export interface CategoryDTO {
  category_id: number;
  establishment_id: number;
  name: string;
  sort_order?: number | null;
  is_active?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
  translations?: CategoryTranslationDTO[];
}
