import { EstablishmentCreateDTO, EstablishmentUpdateDTO, EstablishmentResponseDTO } from '@/types/dtos/establishment';
// Quitar el import de handleApiResponse de @/utils/api si existía y el ApiError local
import { handleApiResponse, handleCaughtError, ApiError } from '@/utils/apiUtils'; // NUEVA IMPORTACIÓN

const ENV_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
const API_SERVICE_PATH = '/api/restaurants';

// Ya no necesitamos EstablishmentApiError local si ApiError es suficiente.
// Ya no necesitamos el handleError local.

// Interfaces para las respuestas - Estas son DTOs, no el wrapper ApiResponse que tenías antes.
// El handleApiResponse que te di espera que el cuerpo de la respuesta sea T directamente.
// Si tu API devuelve { success: boolean, data?: T, error?: string }, entonces T en handleApiResponse sería ese wrapper.
// Por ahora, asumiré que la API devuelve directamente EstablishmentResponseDTO[] o EstablishmentResponseDTO.

/**
 * Obtiene todos los establecimientos
 * @param page Número de página (opcional)
 * @param pageSize Tamaño de página (opcional)
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
        credentials: 'include', // Para incluir las cookies de autenticación
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
    // Asume que la API devuelve directamente EstablishmentResponseDTO[]
    // o un objeto que handleApiResponse puede manejar y extraer T.
    // Si tu backend envuelve en { data: [...] }, T sería { data: EstablishmentResponseDTO[] }
    // y luego harías: const result = await handleApiResponse<{ data: EstablishmentResponseDTO[] }>(response); return result.data;
    // Para este ejemplo, asumimos que la API devuelve directamente el array.
    return await handleApiResponse<EstablishmentResponseDTO[]>(response);
  } catch (error) {
    // Lanza ApiError genérico o puedes crear EstablishmentApiError si lo prefieres.
    throw handleCaughtError(error, ApiError, 'Error al obtener los establecimientos.');
  }
}

/**
 * Obtiene un establecimiento específico por ID
 * @param id ID del establecimiento
 */
export async function getEstablishmentById(id: number): Promise<EstablishmentResponseDTO | null> {
  try {
    const response = await fetch(`${ENV_API_BASE_URL}${API_SERVICE_PATH}/${id}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    // handleApiResponse lanzará un ApiError para 404. Si quieres tratar 404 como null:
    if (response.status === 404) return null;

    return await handleApiResponse<EstablishmentResponseDTO>(response);
  } catch (error) {
    // Si el error es un ApiError con status 404 y no lo manejaste antes, se propagará.
    // Si quieres convertir específicamente el ApiError 404 a null aquí:
    if (error instanceof ApiError && error.status === 404) {
        // Esto es redundante si ya verificaste response.status === 404 antes de handleApiResponse
        // pero es una forma de manejarlo si handleApiResponse es la primera verificación.
        return null;
    }
    throw handleCaughtError(error, ApiError, 'Error inesperado obteniendo establecimiento.');
  }
}

/**
 * Crea un nuevo establecimiento
 * @param establishmentData Datos del establecimiento a crear
 */
export async function createEstablishment(
  establishmentData: EstablishmentCreateDTO
): Promise<EstablishmentResponseDTO> {
  try {
    const response = await fetch(`${ENV_API_BASE_URL}${API_SERVICE_PATH}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(establishmentData),
    });

    return await handleApiResponse<EstablishmentResponseDTO>(response);
  } catch (error) {
    throw handleCaughtError(error, ApiError, 'Error inesperado creando establecimiento.');
  }
}

/**
 * Actualiza un establecimiento existente
 * @param id ID del establecimiento
 * @param updateData Datos a actualizar
 */
export async function updateEstablishment(
  id: number,
  updateData: EstablishmentUpdateDTO
): Promise<EstablishmentResponseDTO> {
  try {
    const response = await fetch(`${ENV_API_BASE_URL}${API_SERVICE_PATH}/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });
    return await handleApiResponse<EstablishmentResponseDTO>(response);
  } catch (error) {
    throw handleCaughtError(error, ApiError, 'Error inesperado actualizando establecimiento.');
  }
}

/**
 * Elimina un establecimiento
 * @param id ID del establecimiento a eliminar
 */
export async function deleteEstablishment(id: number): Promise<void> { // O el tipo que devuelva tu API
  try {
    const response = await fetch(`${ENV_API_BASE_URL}${API_SERVICE_PATH}/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    // Si DELETE devuelve 204 No Content, T sería void.
    // handleApiResponse devolverá null en este caso, que es compatible con Promise<void>.
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
  // Ya no es necesario exportar EstablishmentApiError si se usa ApiError directamente
};