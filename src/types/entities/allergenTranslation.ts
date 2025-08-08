import type { AllergenTranslation as PrismaAllergenTranslation } from '@prisma/client';

export interface AllergenTranslation extends Omit<PrismaAllergenTranslation, 'allergen_id' | 'translation_id' | 'language_code'> {
  translationId: number;
  languageCode: string;
  // allergenId?: number; // Si necesitas la relación explícita
}
