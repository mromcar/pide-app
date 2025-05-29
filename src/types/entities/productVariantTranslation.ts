import { ProductVariant } from './productVariant';

export interface ProductVariantTranslation {
  translation_id: number;
  variant_id: number;
  language_code: string;
  variant_description: string;

  // Relations
  variant?: ProductVariant;
}