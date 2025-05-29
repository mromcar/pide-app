import type { AllergenTranslation as PrismaAllergenTranslation } from '@prisma/client';

export interface AllergenTranslation extends Omit<PrismaAllergenTranslation, 'allergen_id'> {
  // allergen_id se gestionará a través de la relación con Allergen
}
