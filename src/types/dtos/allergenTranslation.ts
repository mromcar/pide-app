import type { AllergenTranslation } from '../entities/allergenTranslation';

export interface CreateAllergenTranslationDTO extends Omit<AllergenTranslation, 'translation_id'> {}

export interface UpdateAllergenTranslationDTO extends Partial<CreateAllergenTranslationDTO> {
  translation_id?: number; // Para identificar la traducción existente al actualizar
  language_code: string; // Requerido para identificar o crear
}

export interface AllergenTranslationResponseDTO extends AllergenTranslation {}