export interface SerializedAllergenTranslation {
  languageCode: string;
  name: string;
  description?: string | null;
}

export interface SerializedAllergen {
  allergenId: number;
  code: string;
  name: string; // Default or translated
  description?: string | null;
  iconUrl?: string | null;
  isMajorAllergen: boolean;
  translations?: SerializedAllergenTranslation[];
}
