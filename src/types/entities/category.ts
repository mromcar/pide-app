import { CategoryTranslation } from './categoryTranslation';

export interface Category {
  category_id: number;
  establishment_id: number;
  name: string;
  image_url?: string | null;
  sort_order?: number | null;
  is_active?: boolean | null;
  created_at?: Date | null;
  updated_at?: Date | null;
  deleted_at?: Date | null;
  translations?: CategoryTranslation[]; // Relation to translations
  // products: Product[]; // Assuming Product type will be defined elsewhere
}