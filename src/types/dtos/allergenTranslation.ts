import type { AllergenTranslation } from '../entities/allergenTranslation';

// Ahora omite tanto 'translationId' como 'allergenId'
export interface CreateAllergenTranslationDTO extends Omit<AllergenTranslation, 'translationId' | 'allergenId'> {}

export interface UpdateAllergenTranslationDTO extends Partial<CreateAllergenTranslationDTO> {
  translationId?: number; // Para identificar la traducción existente al actualizar
  languageCode: string;   // Requerido para identificar o crear
}

export interface AllergenTranslationResponseDTO extends AllergenTranslation {}
