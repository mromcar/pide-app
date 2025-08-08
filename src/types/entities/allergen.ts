import type { Allergen as PrismaAllergen } from '@prisma/client';
import type { AllergenTranslation } from './allergenTranslation';

export interface Allergen extends Omit<PrismaAllergen, 'translations' | 'allergen_id'> {
  allergenId: number;
  translations?: AllergenTranslation[];
}
