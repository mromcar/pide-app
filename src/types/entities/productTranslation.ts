import { Product } from './product';

export interface ProductTranslation {
  translation_id: number;
  product_id: number;
  language_code: string;
  name: string;
  description?: string | null;

  // Relations
  product?: Product;
}