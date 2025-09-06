import type { AllergenResponseDTO } from '@/types/dtos/allergen';
import { handleApiResponse, handleCaughtError, ApiError } from '@/utils/apiUtils';
import { getClientApiUrl, debugApiClient } from '@/lib/api-client';

const API_MENU_PATH = '/api/menu';
const API_ADMIN_PATH = '/api/admin/establishments';

/**
 * Fetches all available allergens (public API).
 * Usa el endpoint público que requiere establishmentId por consistencia
 */
async function getAllAllergens(establishmentId: number): Promise<AllergenResponseDTO[]> {
  try {
    console.log('🔍 AllergenAPI: Fetching allergens for establishment:', establishmentId)

    if (process.env.NODE_ENV === 'development') {
      debugApiClient()
    }

    const apiUrl = getClientApiUrl(`${API_MENU_PATH}/${establishmentId}/allergens`);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    const allergens = await handleApiResponse<AllergenResponseDTO[]>(response);

    console.log('✅ AllergenAPI: Allergens loaded:', allergens.length)
    return Array.isArray(allergens) ? allergens : [];
  } catch (error) {
    console.error('❌ AllergenAPI: Error fetching allergens:', error)
    throw handleCaughtError(error, ApiError, 'Failed to fetch allergens');
  }
}

/**
 * Fetches allergens for admin management
 */
async function getAllergensForAdmin(establishmentId: number): Promise<AllergenResponseDTO[]> {
  try {
    console.log('🔍 AllergenAPI: Fetching allergens for admin:', establishmentId)

    const apiUrl = getClientApiUrl(`${API_ADMIN_PATH}/${establishmentId}/menu/allergens`);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    const allergens = await handleApiResponse<AllergenResponseDTO[]>(response);

    console.log('✅ AllergenAPI: Admin allergens loaded:', allergens.length)
    return Array.isArray(allergens) ? allergens : [];
  } catch (error) {
    console.error('❌ AllergenAPI: Error fetching admin allergens:', error)
    throw handleCaughtError(error, ApiError, 'Failed to fetch admin allergens');
  }
}

/**
 * Fetches a specific allergen by ID (admin API).
 */
async function getAllergenById(establishmentId: number, allergenId: number): Promise<AllergenResponseDTO | null> {
  try {
    console.log('🔍 AllergenAPI: Fetching allergen by ID:', allergenId)

    const apiUrl = getClientApiUrl(`${API_ADMIN_PATH}/${establishmentId}/menu/allergens/${allergenId}`);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.status === 404) {
      console.log('⚠️ AllergenAPI: Allergen not found:', allergenId)
      return null;
    }

    const data = await handleApiResponse<{ allergen: AllergenResponseDTO }>(response);

    console.log('✅ AllergenAPI: Allergen loaded:', data.allergen.name)
    return data.allergen;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    console.error('❌ AllergenAPI: Error fetching allergen:', error)
    throw handleCaughtError(error, ApiError, 'Failed to fetch allergen');
  }
}

export const allergenApiService = {
  getAllAllergens,
  getAllergensForAdmin,
  getAllergenById,
};

export { getAllAllergens, getAllergensForAdmin, getAllergenById };
