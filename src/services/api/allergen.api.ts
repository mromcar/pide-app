import type { AllergenResponseDTO } from '@/types/dtos/allergen'
import { handleApiResponse, handleCaughtError, ApiError } from '@/utils/apiUtils'
import { getClientApiUrl, debugApiClient } from '@/lib/api-client'

const API_MENU_PATH = '/api/menu'
const API_ADMIN_PATH = '/api/admin/establishments'

type FetchOpts = {
  signal?: AbortSignal
  cache?: RequestCache
}

/**
 * Public: obtiene todos los alérgenos de un establecimiento (modo lectura).
 * Recomendado para UI pública (QR menu).
 */
export async function getAllAllergens(
  establishmentId: number,
  opts?: FetchOpts
): Promise<AllergenResponseDTO[]> {
  try {
    console.log('🔍 AllergenAPI: Fetching public allergens for establishment:', establishmentId)

    if (process.env.NODE_ENV === 'development') {
      debugApiClient()
    }

    const apiUrl = getClientApiUrl(`${API_MENU_PATH}/${establishmentId}/allergens`)

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: opts?.signal,
      cache: opts?.cache,
    })

    const allergens = await handleApiResponse<AllergenResponseDTO[]>(response)

    console.log('✅ AllergenAPI: Public allergens loaded:', allergens.length)
    return Array.isArray(allergens) ? allergens : []
  } catch (error) {
    console.error('❌ AllergenAPI: Error fetching public allergens:', error)
    throw handleCaughtError(error, ApiError, 'Failed to fetch allergens')
  }
}

/**
 * Admin: obtiene todos los alérgenos para gestión (protegido).
 * Usado en el panel de administración (checkboxes).
 */
export async function getAllergensForAdmin(
  establishmentId: number,
  opts?: FetchOpts
): Promise<AllergenResponseDTO[]> {
  try {
    console.log('🔍 AllergenAPI: Fetching admin allergens for establishment:', establishmentId)

    const apiUrl = getClientApiUrl(`${API_ADMIN_PATH}/${establishmentId}/menu/allergens`)

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: opts?.signal,
      cache: 'no-store',
    })

    const allergens = await handleApiResponse<AllergenResponseDTO[]>(response)

    console.log('✅ AllergenAPI: Admin allergens loaded:', allergens.length)
    return Array.isArray(allergens) ? allergens : []
  } catch (error) {
    console.error('❌ AllergenAPI: Error fetching admin allergens:', error)
    throw handleCaughtError(error, ApiError, 'Failed to fetch admin allergens')
  }
}

/**
 * Alias para mantener compatibilidad con AdminMenuManager (getAdminAllergens).
 */
export function getAdminAllergens(
  establishmentId: number,
  opts?: FetchOpts
): Promise<AllergenResponseDTO[]> {
  return getAllergensForAdmin(establishmentId, opts)
}

/**
 * Admin: obtiene un alérgeno por ID (protegido).
 */
export async function getAllergenById(
  establishmentId: number,
  allergenId: number,
  opts?: FetchOpts
): Promise<AllergenResponseDTO | null> {
  try {
    console.log('🔍 AllergenAPI: Fetching allergen by ID:', { establishmentId, allergenId })

    const apiUrl = getClientApiUrl(`${API_ADMIN_PATH}/${establishmentId}/menu/allergens/${allergenId}`)

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: opts?.signal,
      cache: 'no-store',
    })

    if (response.status === 404) {
      console.log('⚠️ AllergenAPI: Allergen not found:', allergenId)
      return null
    }

    const data = await handleApiResponse<{ allergen: AllergenResponseDTO }>(response)

    console.log('✅ AllergenAPI: Allergen loaded:', data.allergen.name)
    return data.allergen
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null
    }
    console.error('❌ AllergenAPI: Error fetching allergen:', error)
    throw handleCaughtError(error, ApiError, 'Failed to fetch allergen')
  }
}

export const allergenApiService = {
  getAllAllergens,
  getAllergensForAdmin,
  getAdminAllergens,
  getAllergenById,
}

export { getAllAllergens as getPublicAllergens }
