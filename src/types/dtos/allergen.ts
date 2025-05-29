import type { Allergen } from '../entities/allergen';
import type { CreateAllergenTranslationDTO, UpdateAllergenTranslationDTO, AllergenTranslationResponseDTO } from './allergenTranslation'; // Importación actualizada

export interface CreateAllergenDTO extends Omit<Allergen, 'allergen_id' | 'translations' | 'product_allergens'> {
  translations?: CreateAllergenTranslationDTO[];
}

export interface UpdateAllergenDTO extends Partial<Omit<CreateAllergenDTO, 'translations'>> {
  // Se espera un array de traducciones. El servicio se encargará de 
  // crear, actualizar o eliminar según sea necesario.
  translations?: Array<UpdateAllergenTranslationDTO>; 
}

export interface AllergenResponseDTO extends Omit<Allergen, 'translations'> {
    translations?: AllergenTranslationResponseDTO[];
}

export interface AllergenListResponseDTO {
  allergens: AllergenResponseDTO[];
  total: number;
}