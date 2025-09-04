import type { AllergenTranslation } from '../entities/allergenTranslation';

// ✅ DTO para crear nueva traducción
export interface CreateAllergenTranslationDTO {
  languageCode: string;
  name: string;
  description?: string | null; // ✅ CORREGIR: Permitir null como en BD
}

// ✅ DTO para actualizar traducción existente
export interface UpdateAllergenTranslationDTO extends Partial<CreateAllergenTranslationDTO> {
  translationId?: number; // Para identificar la traducción existente al actualizar
  languageCode: string;   // Requerido para identificar o crear
}

// ✅ Type alias en lugar de interface vacía
export type AllergenTranslationResponseDTO = AllergenTranslation;
