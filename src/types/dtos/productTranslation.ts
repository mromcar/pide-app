export interface ProductTranslationCreateDTO {
  language_code: string;
  name: string;
  description?: string | null;
  // product_id will be implicitly set when creating through a nested Product write
  // or explicitly if creating/updating translations separately
  product_id?: number;
}

export interface ProductTranslationUpdateDTO {
  translation_id?: number; // Needed if updating standalone, or to identify within a list
  language_code?: string;
  name?: string;
  description?: string | null;
}

export interface ProductTranslationResponseDTO {
  translation_id: number;
  product_id: number;
  language_code: string;
  name: string;
  description?: string | null;
}
