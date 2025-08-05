import type { CategoryCreateDTO, CategoryUpdateDTO, CategoryDTO } from '@/types/dtos/category';
// Quitar el import de handleApiResponse de @/utils/api si existía y el ApiError local
import { handleApiResponse, handleCaughtError } from '@/utils/apiUtils'; // NUEVA IMPORTACIÓN
import { CategoryApiError } from '@/types/errors/category.api.error';

const ENV_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
const API_SERVICE_PATH = '/api/restaurants'; // Mantén la parte específica del servicio aquí

// Ya no necesitamos CategoryApiError local si ApiError es suficiente.
// Si necesitas campos específicos en CategoryApiError, puedes hacer que extienda ApiError:
// export class CategoryApiError extends ApiError { constructor(...) { super(...); this.name = 'CategoryApiError'; } }
// Por ahora, usaremos ApiError directamente para simplificar.

// Ya no necesitamos el handleError local, usaremos el throw directo de handleApiResponse
// o capturaremos ApiError.

/**
 * Obtiene todas las categorías para un establecimiento específico.
 * @param restaurantId - El ID del restaurante.
 * @returns Una promesa que resuelve a un array de CategoryDTO.
 * @throws {ApiError} Si ocurre un error en la API.
 * @throws {NetworkError} Si hay un problema de red.
 */
async function getAllCategoriesByEstablishment(restaurantId: number): Promise<CategoryDTO[]> { // Asumiendo que CategoryDTO es el tipo correcto
  try {
    const response = await fetch(`${ENV_API_BASE_URL}${API_SERVICE_PATH}/${restaurantId}/menu/categories`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Aquí podrías añadir cabeceras de autenticación si son necesarias
      },
    });
    // Asumimos que la API devuelve un objeto con una propiedad 'categories'
    // o directamente un array de categorías. Ajusta el tipo esperado en handleApiResponse.
    // Si la API devuelve { data: CategoryDTO[] } o similar, el tipo en handleApiResponse sería ese.
    // Si la API devuelve directamente CategoryDTO[], entonces el tipo es CategoryDTO[].
    // Basado en tu código original, parece que esperas { categories: CategoryDTO[] }
    // pero el handleApiResponse que te di devuelve T directamente.
    // Vamos a asumir que la API devuelve directamente el array o un objeto que handleApiResponse puede manejar.
    // Si tu backend envuelve todo en un { data: ... }, necesitarías: const result = await handleApiResponse<{ data: CategoryDTO[] }>(response); return result.data;
    // Para este ejemplo, asumiré que la API devuelve directamente CategoryDTO[] o que handleApiResponse se adapta.
    // Si tu API devuelve { success: boolean, data?: T, error?: string }, handleApiResponse necesitaría ser ajustado o el tipo T sería ese wrapper.
    // El handleApiResponse que te di espera que el cuerpo de la respuesta sea T directamente en caso de éxito.
    // Si tu backend envuelve la respuesta, por ejemplo: { categories: [...] }
    // entonces T sería { categories: CategoryDTO[] }
    const data = await handleApiResponse<{ categories: CategoryDTO[] }>(response); // Ajusta T según la estructura real de tu respuesta
    return data?.categories || []; // Si la respuesta es { categories: [...] }
    // Si la respuesta es directamente CategoryDTO[], entonces: return await handleApiResponse<CategoryDTO[]>(response);
  } catch (error) {
    // handleCaughtError se encarga de la lógica de conversión y relanzamiento
    throw handleCaughtError(error, CategoryApiError, 'Error al obtener las categorías.');
  }
}

/**
 * Crea una nueva categoría para un establecimiento.
 * @param restaurantId - El ID del restaurante.
 * @param categoryData - Los datos para la nueva categoría.
 * @returns Una promesa que resuelve a la CategoryDTO creada.
 * @throws {ApiError} Si ocurre un error en la API.
 */
async function createCategory(restaurantId: number, categoryData: CategoryCreateDTO): Promise<CategoryDTO> {
  try {
    const response = await fetch(`${ENV_API_BASE_URL}${API_SERVICE_PATH}/${restaurantId}/menu/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(categoryData),
    });
    // Asumimos que la API devuelve { category: CategoryDTO } o directamente CategoryDTO
    // Ajusta T según la estructura real de tu respuesta.
    const data = await handleApiResponse<{ category: CategoryDTO }>(response); // Si es { category: ...}
    return data.category;
    // Si es directamente CategoryDTO: return await handleApiResponse<CategoryDTO>(response);
  } catch (error) {
    throw handleCaughtError(error, CategoryApiError, 'Error inesperado creando categoría.');
  }
}

/**
 * Actualiza una categoría existente.
 * @param restaurantId - El ID del restaurante.
 * @param categoryId - El ID de la categoría a actualizar.
 * @param updateData - Los datos para actualizar la categoría.
 * @returns Una promesa que resuelve a la CategoryDTO actualizada.
 * @throws {ApiError} Si ocurre un error en la API o la categoría no se encuentra.
 */
async function updateCategory(restaurantId: number, categoryId: number, updateData: CategoryUpdateDTO): Promise<CategoryDTO> {
  try {
    const response = await fetch(`${ENV_API_BASE_URL}${API_SERVICE_PATH}/${restaurantId}/menu/categories/${categoryId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });
    const data = await handleApiResponse<{ category: CategoryDTO }>(response); // Si es { category: ...}
    return data.category;
    // Si es directamente CategoryDTO: return await handleApiResponse<CategoryDTO>(response);
  } catch (error) {
    throw handleCaughtError(error, CategoryApiError, 'Error inesperado actualizando categoría.');
  }
}

/**
 * Elimina una categoría.
 * @param restaurantId - El ID del restaurante.
 * @param categoryId - El ID de la categoría a eliminar.
 * @returns Una promesa que resuelve cuando la categoría ha sido eliminada (o con el mensaje de éxito).
 * @throws {ApiError} Si ocurre un error en la API o la categoría no se encuentra.
 */
async function deleteCategory(restaurantId: number, categoryId: number): Promise<{ message: string; category?: CategoryDTO }> {
  try {
    const response = await fetch(`${ENV_API_BASE_URL}${API_SERVICE_PATH}/${restaurantId}/menu/categories/${categoryId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    // El backend para DELETE podría devolver un 204 (sin contenido) o un JSON con un mensaje.
    // Si es 204, handleApiResponse devolverá null (si T lo permite) o fallará si T no es nullable.
    // Si devuelve JSON, T debe coincidir.
    // Tu código original esperaba { message: string; category: CategoryDTO }
    // Si es 204, esto no se cumplirá. Hay que decidir el contrato de la API para DELETE.
    // Asumamos que devuelve un JSON con mensaje y opcionalmente la categoría eliminada.
    return await handleApiResponse<{ message: string; category?: CategoryDTO }>(response);
  } catch (error) {
    throw handleCaughtError(error, CategoryApiError, 'Error inesperado eliminando categoría.');
  }
}

export const categoryApiService = {
  getAllCategoriesByEstablishment,
  createCategory,
  updateCategory,
  deleteCategory,
  // Ya no es necesario exportar CategoryApiError si se usa ApiError directamente
};