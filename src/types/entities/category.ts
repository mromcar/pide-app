// src/types/entities/category.ts

import { Establishment } from './establishment'; // Assuming you'll create this
import { Product } from './product';

export interface CategoryTranslation {
  translationId: number;
  categoryId: number;
  languageCode: string;
  name: string;
  category?: Category; // Optional back-reference
}

export interface Category {
  categoryId: number;
  establishmentId: number;
  name: string;
  imageUrl?: string | null;
  sortOrder?: number | null;
  isActive?: boolean | null;
  establishment?: Establishment;
  translations?: CategoryTranslation[];
  products?: Product[];
}
