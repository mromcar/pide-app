export interface ProductTranslationCreateDTO {
  languageCode: string;
  name: string;
  description?: string | null;
  // productId will be implicitly set when creating through a nested Product write
  // or explicitly if creating/updating translations separately
  productId?: number;
}

export interface ProductTranslationUpdateDTO {
  translationId?: number; // Needed if updating standalone, or to identify within a list
  languageCode?: string;
  name?: string;
  description?: string | null;
}

export interface ProductTranslationResponseDTO {
  translationId: number;
  productId: number;
  languageCode: string;
  name: string;
  description?: string | null;
}
