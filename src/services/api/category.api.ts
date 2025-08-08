import type { CategoryCreateDTO, CategoryUpdateDTO, CategoryDTO } from '@/types/dtos/category';
import { handleApiResponse, handleCaughtError } from '@/utils/apiUtils';
import { CategoryApiError } from '@/types/errors/category.api.error';
import camelcaseKeys from 'camelcase-keys';

const ENV_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
const API_SERVICE_PATH = '/api/restaurants';

/**
 * Obtiene todas las categorías para un establecimiento específico.
 */
async function getAllCategoriesByEstablishment(restaurantId: number): Promise<CategoryDTO[]> {
  try {
    const response = await fetch(`${ENV_API_BASE_URL}${API_SERVICE_PATH}/${restaurantId}/menu/categories`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await handleApiResponse<{ categories: CategoryDTO[] }>(response);
    // Transformar a camelCase antes de devolver
    return camelcaseKeys(data?.categories || [], { deep: true }) as CategoryDTO[];
  } catch (error) {
    throw handleCaughtError(error, CategoryApiError, 'Error al obtener las categorías.');
  }
}

/**
 * Crea una nueva categoría para un establecimiento.
 */
async function createCategory(restaurantId: number, categoryData: CategoryCreateDTO): Promise<CategoryDTO> {
  try {
    const response = await fetch(`${ENV_API_BASE_URL}${API_SERVICE_PATH}/${restaurantId}/menu/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(categoryData),
    });
    const data = await handleApiResponse<{ category: CategoryDTO }>(response);
    // Transformar a camelCase antes de devolver
    return camelcaseKeys(data.category, { deep: true }) as CategoryDTO;
  } catch (error) {
    throw handleCaughtError(error, CategoryApiError, 'Error inesperado creando categoría.');
  }
}

/**
 * Actualiza una categoría existente.
 */
async function updateCategory(restaurantId: number, categoryId: number, updateData: CategoryUpdateDTO): Promise<CategoryDTO> {
  try {
    const response = await fetch(`${ENV_API_BASE_URL}${API_SERVICE_PATH}/${restaurantId}/menu/categories/${categoryId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
    });
    const data = await handleApiResponse<{ category: CategoryDTO }>(response);
    // Transformar a camelCase antes de devolver
    return camelcaseKeys(data.category, { deep: true }) as CategoryDTO;
  } catch (error) {
    throw handleCaughtError(error, CategoryApiError, 'Error inesperado actualizando categoría.');
  }
}

/**
 * Elimina una categoría.
 */
async function deleteCategory(restaurantId: number, categoryId: number): Promise<{ message: string; category?: CategoryDTO }> {
  try {
    const response = await fetch(`${ENV_API_BASE_URL}${API_SERVICE_PATH}/${restaurantId}/menu/categories/${categoryId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await handleApiResponse<{ message: string; category?: CategoryDTO }>(response);
    // Transformar a camelCase la categoría eliminada si existe
    return {
      ...data,
      category: data.category ? camelcaseKeys(data.category, { deep: true }) as CategoryDTO : undefined,
    };
  } catch (error) {
    throw handleCaughtError(error, CategoryApiError, 'Error inesperado eliminando categoría.');
  }
}

export const categoryApiService = {
  getAllCategoriesByEstablishment,
  createCategory,
  updateCategory,
  deleteCategory,
};
