import type { Allergen } from '../entities/allergen';
import type { CreateAllergenTranslationDTO, UpdateAllergenTranslationDTO, AllergenTranslationResponseDTO } from './allergenTranslation';

export interface CreateAllergenDTO extends Omit<Allergen, 'allergenId' | 'translations' | 'productAllergens'> {
  translations?: CreateAllergenTranslationDTO[];
}

export interface UpdateAllergenDTO extends Partial<Omit<CreateAllergenDTO, 'translations'>> {
  translations?: Array<UpdateAllergenTranslationDTO>;
}

export interface AllergenResponseDTO extends Omit<Allergen, 'translations'> {
  translations?: AllergenTranslationResponseDTO[];
}

export interface AllergenListResponseDTO {
  allergens: AllergenResponseDTO[];
  total: number;
}
