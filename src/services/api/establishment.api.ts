import {
  EstablishmentCreateDTO,
  EstablishmentUpdateDTO,
  EstablishmentResponseDTO,
} from '@/types/dtos/establishment';
import { handleApiResponse, handleCaughtError, ApiError } from '@/utils/apiUtils';
import { getClientApiUrl, debugApiClient } from '@/lib/api-client';

const API_PUBLIC_PATH = '/api/establishments';
const API_ADMIN_PATH = '/api/admin/establishments';
const API_SUPER_ADMIN_PATH = '/api/super-admin/establishments';

/**
 * Fetches public information of a specific establishment.
 * Used for menu display and public access.
 */
async function getEstablishmentPublic(establishmentId: number): Promise<EstablishmentResponseDTO | null> {
  try {
    console.log('🔍 EstablishmentAPI: Fetching public establishment info:', establishmentId)

    if (process.env.NODE_ENV === 'development') {
      debugApiClient()
    }

    const apiUrl = getClientApiUrl(`${API_PUBLIC_PATH}/${establishmentId}`);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.status === 404) {
      console.log('⚠️ EstablishmentAPI: Public establishment not found:', establishmentId)
      return null;
    }

    const establishment = await handleApiResponse<EstablishmentResponseDTO>(response);

    console.log('✅ EstablishmentAPI: Public establishment loaded:', establishment.name)
    return establishment;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    console.error('❌ EstablishmentAPI: Error fetching public establishment:', error)
    throw handleCaughtError(error, ApiError, 'Failed to fetch establishment');
  }
}

/**
 * Fetches detailed establishment information for admin users.
 * Used in admin panels.
 */
async function getEstablishmentById(establishmentId: number): Promise<EstablishmentResponseDTO | null> {
  try {
    console.log('🔍 EstablishmentAPI: Fetching establishment by ID (admin):', establishmentId)

    const apiUrl = getClientApiUrl(`${API_ADMIN_PATH}/${establishmentId}`);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (response.status === 404) {
      console.log('⚠️ EstablishmentAPI: Establishment not found:', establishmentId)
      return null;
    }

    const establishment = await handleApiResponse<EstablishmentResponseDTO>(response);

    console.log('✅ EstablishmentAPI: Establishment loaded:', establishment.name)
    return establishment;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    console.error('❌ EstablishmentAPI: Error fetching establishment:', error)
    throw handleCaughtError(error, ApiError, 'Failed to fetch establishment');
  }
}

/**
 * Fetches all establishments with pagination (super admin only).
 */
async function getAllEstablishments(
  page?: number,
  pageSize?: number,
  isActive?: boolean
): Promise<{ establishments: EstablishmentResponseDTO[]; total: number; page: number; pageSize: number }> {
  try {
    console.log('🔍 EstablishmentAPI: Fetching all establishments (super admin)', { page, pageSize, isActive })

    const queryParams = new URLSearchParams();
    if (page) queryParams.append('page', page.toString());
    if (pageSize) queryParams.append('pageSize', pageSize.toString());
    if (isActive !== undefined) queryParams.append('isActive', isActive.toString());

    const apiUrl = getClientApiUrl(
      `${API_SUPER_ADMIN_PATH}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    );

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    const data = await handleApiResponse<{
      establishments: EstablishmentResponseDTO[];
      total: number;
      page: number;
      pageSize: number;
    }>(response);

    console.log('✅ EstablishmentAPI: All establishments loaded:', data.establishments.length)
    return data;
  } catch (error) {
    console.error('❌ EstablishmentAPI: Error fetching all establishments:', error)
    throw handleCaughtError(error, ApiError, 'Failed to fetch establishments');
  }
}

/**
 * Creates a new establishment (super admin only).
 */
async function createEstablishment(establishmentData: EstablishmentCreateDTO): Promise<EstablishmentResponseDTO> {
  try {
    console.log('🔍 EstablishmentAPI: Creating establishment:', establishmentData.name)

    const apiUrl = getClientApiUrl(API_SUPER_ADMIN_PATH);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(establishmentData),
    });

    const establishment = await handleApiResponse<EstablishmentResponseDTO>(response);

    console.log('✅ EstablishmentAPI: Establishment created:', establishment.establishmentId)
    return establishment;
  } catch (error) {
    console.error('❌ EstablishmentAPI: Error creating establishment:', error)
    throw handleCaughtError(error, ApiError, 'Failed to create establishment');
  }
}

/**
 * Updates an existing establishment.
 * Super admins can update any establishment, establishment admins can only update their own.
 */
async function updateEstablishment(
  establishmentId: number,
  updateData: EstablishmentUpdateDTO,
  isSuperAdmin: boolean = false
): Promise<EstablishmentResponseDTO> {
  try {
    console.log('🔍 EstablishmentAPI: Updating establishment:', establishmentId, { isSuperAdmin })

    const basePath = isSuperAdmin ? API_SUPER_ADMIN_PATH : API_ADMIN_PATH;
    const apiUrl = getClientApiUrl(`${basePath}/${establishmentId}`);

    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(updateData),
    });

    const establishment = await handleApiResponse<EstablishmentResponseDTO>(response);

    console.log('✅ EstablishmentAPI: Establishment updated:', establishment.establishmentId)
    return establishment;
  } catch (error) {
    console.error('❌ EstablishmentAPI: Error updating establishment:', error)
    throw handleCaughtError(error, ApiError, 'Failed to update establishment');
  }
}

/**
 * Deletes an establishment (super admin only).
 */
async function deleteEstablishment(establishmentId: number): Promise<void> {
  try {
    console.log('🔍 EstablishmentAPI: Deleting establishment:', establishmentId)

    const apiUrl = getClientApiUrl(`${API_SUPER_ADMIN_PATH}/${establishmentId}`);

    const response = await fetch(apiUrl, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    await handleApiResponse<void>(response);

    console.log('✅ EstablishmentAPI: Establishment deleted:', establishmentId)
  } catch (error) {
    console.error('❌ EstablishmentAPI: Error deleting establishment:', error)
    throw handleCaughtError(error, ApiError, 'Failed to delete establishment');
  }
}

/**
 * Toggles establishment active status (super admin only).
 */
async function toggleEstablishmentStatus(establishmentId: number, isActive: boolean): Promise<EstablishmentResponseDTO> {
  try {
    console.log('🔍 EstablishmentAPI: Toggling establishment status:', { establishmentId, isActive })

    const apiUrl = getClientApiUrl(`${API_SUPER_ADMIN_PATH}/${establishmentId}/toggle-status`);

    const response = await fetch(apiUrl, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ isActive }),
    });

    const establishment = await handleApiResponse<EstablishmentResponseDTO>(response);

    console.log('✅ EstablishmentAPI: Establishment status toggled:', establishment.establishmentId)
    return establishment;
  } catch (error) {
    console.error('❌ EstablishmentAPI: Error toggling establishment status:', error)
    throw handleCaughtError(error, ApiError, 'Failed to toggle establishment status');
  }
}

/**
 * Gets establishments managed by current admin user.
 */
async function getMyEstablishments(): Promise<EstablishmentResponseDTO[]> {
  try {
    console.log('🔍 EstablishmentAPI: Fetching my establishments')

    const apiUrl = getClientApiUrl(`${API_ADMIN_PATH}/my-establishments`);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    const establishments = await handleApiResponse<EstablishmentResponseDTO[]>(response);

    console.log('✅ EstablishmentAPI: My establishments loaded:', establishments.length)
    return establishments;
  } catch (error) {
    console.error('❌ EstablishmentAPI: Error fetching my establishments:', error)
    throw handleCaughtError(error, ApiError, 'Failed to fetch my establishments');
  }
}

export const establishmentApiService = {
  getEstablishmentPublic,
  getEstablishmentById,
  getAllEstablishments,
  createEstablishment,
  updateEstablishment,
  deleteEstablishment,
  toggleEstablishmentStatus,
  getMyEstablishments,
};

export {
  getEstablishmentPublic,
  getEstablishmentById,
  getAllEstablishments,
  createEstablishment,
  updateEstablishment,
  deleteEstablishment,
  toggleEstablishmentStatus,
  getMyEstablishments,
};
