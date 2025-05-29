export interface CategoryTranslationCreateDTO {
  language_code: string;
  name: string;
}

export interface CategoryTranslationUpdateDTO {
  translation_id?: number; // Optional: for identifying existing translations to update
  language_code?: string;
  name?: string;
}

export interface CategoryTranslationDTO {
  translation_id: number;
  category_id: number;
  language_code: string;
  name: string;
}
