import { EstablishmentCreateDTO, EstablishmentUpdateDTO, EstablishmentResponseDTO } from '@/types/dtos/establishment';
import { handleApiResponse, handleCaughtError, ApiError } from '@/utils/apiUtils';
import camelcaseKeys from 'camelcase-keys';

const ENV_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
const API_SERVICE_PATH = '/api/restaurants';

/**
 * Obtiene todos los establecimientos
 */
export async function getAllEstablishments(
  page?: number,
  pageSize?: number
): Promise<EstablishmentResponseDTO[]> {
  try {
    const queryParams = new URLSearchParams();
    if (page) queryParams.append('page', page.toString());
    if (pageSize) queryParams.append('pageSize', pageSize.toString());

    const response = await fetch(
      `${ENV_API_BASE_URL}${API_SERVICE_PATH}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`,
      {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      }
    );
    const data = await handleApiResponse<EstablishmentResponseDTO[]>(response);
    // Transformar a camelCase antes de devolver
    return camelcaseKeys(data, { deep: true }) as EstablishmentResponseDTO[];
  } catch (error) {
    throw handleCaughtError(error, ApiError, 'Error al obtener los establecimientos.');
  }
}

/**
 * Obtiene un establecimiento específico por ID
 */
export async function getEstablishmentById(id: number): Promise<EstablishmentResponseDTO | null> {
  try {
    const response = await fetch(`${ENV_API_BASE_URL}${API_SERVICE_PATH}/${id}`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });

    if (response.status === 404) return null;

    const data = await handleApiResponse<EstablishmentResponseDTO>(response);
    return camelcaseKeys(data, { deep: true }) as EstablishmentResponseDTO;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    throw handleCaughtError(error, ApiError, 'Error inesperado obteniendo establecimiento.');
  }
}

/**
 * Crea un nuevo establecimiento
 */
export async function createEstablishment(
  establishmentData: EstablishmentCreateDTO
): Promise<EstablishmentResponseDTO> {
  try {
    const response = await fetch(`${ENV_API_BASE_URL}${API_SERVICE_PATH}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(establishmentData),
    });

    const data = await handleApiResponse<EstablishmentResponseDTO>(response);
    return camelcaseKeys(data, { deep: true }) as EstablishmentResponseDTO;
  } catch (error) {
    throw handleCaughtError(error, ApiError, 'Error inesperado creando establecimiento.');
  }
}

/**
 * Actualiza un establecimiento existente
 */
export async function updateEstablishment(
  id: number,
  updateData: EstablishmentUpdateDTO
): Promise<EstablishmentResponseDTO> {
  try {
    const response = await fetch(`${ENV_API_BASE_URL}${API_SERVICE_PATH}/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
    });
    const data = await handleApiResponse<EstablishmentResponseDTO>(response);
    return camelcaseKeys(data, { deep: true }) as EstablishmentResponseDTO;
  } catch (error) {
    throw handleCaughtError(error, ApiError, 'Error inesperado actualizando establecimiento.');
  }
}

/**
 * Elimina un establecimiento
 */
export async function deleteEstablishment(id: number): Promise<void> {
  try {
    const response = await fetch(`${ENV_API_BASE_URL}${API_SERVICE_PATH}/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    await handleApiResponse<void>(response);
  } catch (error) {
    throw handleCaughtError(error, ApiError, 'Error inesperado eliminando establecimiento.');
  }
}

export const establishmentApiService = {
  getAllEstablishments,
  getEstablishmentById,
  createEstablishment,
  updateEstablishment,
  deleteEstablishment,
};
