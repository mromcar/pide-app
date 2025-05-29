export interface ProductVariantTranslationCreateDTO {
  language_code: string;
  variant_description: string;
  variant_id?: number; // Optional if created nested
}

export interface ProductVariantTranslationUpdateDTO {
  translation_id?: number;
  language_code?: string;
  variant_description?: string;
}

export interface ProductVariantTranslationResponseDTO {
  translation_id: number;
  variant_id: number;
  language_code: string;
  variant_description: string;
}
