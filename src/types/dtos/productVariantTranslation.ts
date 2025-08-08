export interface ProductVariantTranslationCreateDTO {
  languageCode: string;
  variantDescription: string;
  variantId?: number; // Optional if created nested
}

export interface ProductVariantTranslationUpdateDTO {
  translationId?: number;
  languageCode?: string;
  variantDescription?: string;
}

export interface ProductVariantTranslationResponseDTO {
  translationId: number;
  variantId: number;
  languageCode: string;
  variantDescription: string;
}
