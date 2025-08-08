export interface CategoryTranslationCreateDTO {
  languageCode: string;
  name: string;
}

export interface CategoryTranslationUpdateDTO {
  translationId?: number; // Optional: for identifying existing translations to update
  languageCode?: string;
  name?: string;
}

export interface CategoryTranslationDTO {
  translationId: number;
  categoryId: number;
  languageCode: string;
  name: string;
}
