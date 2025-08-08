import { ProductVariant } from './productVariant';

export interface ProductVariantTranslation {
  translationId: number;
  variantId: number;
  languageCode: string;
  variantDescription: string;

  // Relations
  variant?: ProductVariant;
}
