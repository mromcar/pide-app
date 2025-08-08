import { Product } from './product';

export interface ProductTranslation {
  translationId: number;
  productId: number;
  languageCode: string;
  name: string;
  description?: string | null;

  // Relations
  product?: Product;
}
