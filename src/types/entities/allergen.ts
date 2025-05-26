// src/types/entities/allergen.ts

import { ProductAllergen } from './product';

export interface AllergenTranslation {
  translationId: number;
  allergenId: number;
  languageCode: string;
  name: string;
  description?: string | null;
  allergen?: Allergen; // Optional back-reference
}

export interface Allergen {
  allergenId: number;
  code: string;
  name: string;
  description?: string | null;
  iconUrl?: string | null;
  isMajorAllergen: boolean; // Mejor no opcional, ya que el schema lo pone por defecto
  translations?: AllergenTranslation[];
  products?: ProductAllergen[];
}
