import type { Allergen as PrismaAllergen } from '@prisma/client';
import type { AllergenTranslation } from './allergenTranslation'; // Importación actualizada

export interface Allergen extends Omit<PrismaAllergen, 'translations'> {
  translations?: AllergenTranslation[];
}
