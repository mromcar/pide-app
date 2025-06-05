import { EstablishmentCreateDTO, EstablishmentUpdateDTO, EstablishmentResponseDTO } from '@/types/dtos/establishment';
import { handleApiResponse, ApiError } from '@/utils/api'; // Asumiendo que existe este helper

const API_BASE_URL = '/api/restaurants';

// Tipos de error personalizados
export class EstablishmentApiError extends Error {
  constructor(message: string, public statusCode: number) {
    super(message);
    this.name = 'EstablishmentApiError';
  }
}

// Interfaces para las respuestas
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Función helper para manejar errores
const handleError = (error: unknown) => {
  console.error('Establishment API Error:', error);
  if (error instanceof EstablishmentApiError) {
    throw error;
  }
  throw new EstablishmentApiError(
    error instanceof Error ? error.message : 'An unexpected error occurred',
    500
  );
};

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
      `${API_BASE_URL}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`,
      { credentials: 'include' } // Para incluir las cookies de autenticación
    );

    const data = await handleApiResponse<ApiResponse<EstablishmentResponseDTO[]>>(response);
    return data.data || [];
  } catch (error) {
    handleError(error);
    return []; // TypeScript necesita este retorno aunque nunca se alcance
  }
}

/**
 * Obtiene un establecimiento específico por ID
 * @param id ID del establecimiento
 */
export async function getEstablishmentById(id: number): Promise<EstablishmentResponseDTO | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      credentials: 'include'
    });

    if (response.status === 404) return null;

    const data = await handleApiResponse<ApiResponse<EstablishmentResponseDTO>>(response);
    return data.data || null;
  } catch (error) {
    handleError(error);
    return null;
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
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(establishmentData),
    });

    const data = await handleApiResponse<ApiResponse<EstablishmentResponseDTO>>(response);
    if (!data.data) throw new EstablishmentApiError('Failed to create establishment', 500);
    return data.data;
  } catch (error) {
    handleError(error);
    throw error; // Para satisfacer TypeScript
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
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    const data = await handleApiResponse<ApiResponse<EstablishmentResponseDTO>>(response);
    if (!data.data) throw new EstablishmentApiError('Failed to update establishment', 500);
    return data.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
}

/**
 * Elimina un establecimiento
 * @param id ID del establecimiento a eliminar
 */
export async function deleteEstablishment(id: number): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    await handleApiResponse(response);
  } catch (error) {
    handleError(error);
  }
}

/**
 * Añade un administrador a un establecimiento
 * @param establishmentId ID del establecimiento
 * @param userId ID del usuario a añadir como administrador
 */
export async function addAdministrator(establishmentId: number, userId: number): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/${establishmentId}/administrators`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: userId }),
    });

    await handleApiResponse(response);
  } catch (error) {
    handleError(error);
  }
}

/**
 * Elimina un administrador de un establecimiento
 * @param establishmentId ID del establecimiento
 * @param userId ID del usuario a eliminar como administrador
 */
export async function removeAdministrator(establishmentId: number, userId: number): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/${establishmentId}/administrators/${userId}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    await handleApiResponse(response);
  } catch (error) {
    handleError(error);
  }
}