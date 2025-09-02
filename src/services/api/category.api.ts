import type { CategoryCreateDTO, CategoryUpdateDTO, CategoryDTO } from '@/types/dtos/category';
import { handleApiResponse, handleCaughtError } from '@/utils/apiUtils';
import { CategoryApiError } from '@/types/errors/category.api.error';
import { getClientApiUrl, debugApiClient } from '@/lib/api-client';

const API_MENU_PATH = '/api/menu';
const API_ADMIN_PATH = '/api/admin/establishments';

/**
 * Fetches all categories for a specific establishment (public API).
 */
async function getAllCategoriesByEstablishment(establishmentId: number): Promise<CategoryDTO[]> {
  try {
    console.log('🔍 CategoryAPI: Fetching categories for establishment:', establishmentId)

    if (process.env.NODE_ENV === 'development') {
      debugApiClient()
    }

    const apiUrl = getClientApiUrl(`${API_MENU_PATH}/${establishmentId}/categories`)

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await handleApiResponse<{ categories: CategoryDTO[] }>(response);
    const categories = data?.categories || [];

    console.log('✅ CategoryAPI: Categories loaded:', categories.length)
    return categories;
  } catch (error) {
    console.error('❌ CategoryAPI: Error fetching categories:', error)
    throw handleCaughtError(error, CategoryApiError, 'Failed to fetch categories');
  }
}

/**
 * Creates a new category for an establishment (admin API).
 */
async function createCategory(establishmentId: number, categoryData: CategoryCreateDTO): Promise<CategoryDTO> {
  try {
    console.log('🔍 CategoryAPI: Creating category for establishment:', establishmentId, categoryData)

    const apiUrl = getClientApiUrl(`${API_ADMIN_PATH}/${establishmentId}/menu/categories`)

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(categoryData),
    });

    const data = await handleApiResponse<{ category: CategoryDTO }>(response);

    console.log('✅ CategoryAPI: Category created:', data.category.categoryId)
    return data.category;
  } catch (error) {
    console.error('❌ CategoryAPI: Error creating category:', error)
    throw handleCaughtError(error, CategoryApiError, 'Failed to create category');
  }
}

/**
 * Updates an existing category (admin API).
 */
async function updateCategory(establishmentId: number, categoryId: number, updateData: CategoryUpdateDTO): Promise<CategoryDTO> {
  try {
    console.log('🔍 CategoryAPI: Updating category:', { establishmentId, categoryId, updateData })

    const apiUrl = getClientApiUrl(`${API_ADMIN_PATH}/${establishmentId}/menu/categories/${categoryId}`)

    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
    });

    const data = await handleApiResponse<{ category: CategoryDTO }>(response);

    console.log('✅ CategoryAPI: Category updated:', data.category.categoryId)
    return data.category;
  } catch (error) {
    console.error('❌ CategoryAPI: Error updating category:', error)
    throw handleCaughtError(error, CategoryApiError, 'Failed to update category');
  }
}

/**
 * Deletes a category (admin API).
 */
async function deleteCategory(establishmentId: number, categoryId: number): Promise<{ message: string; category?: CategoryDTO }> {
  try {
    console.log('🔍 CategoryAPI: Deleting category:', { establishmentId, categoryId })

    const apiUrl = getClientApiUrl(`${API_ADMIN_PATH}/${establishmentId}/menu/categories/${categoryId}`)

    const response = await fetch(apiUrl, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await handleApiResponse<{ message: string; category?: CategoryDTO }>(response);

    console.log('✅ CategoryAPI: Category deleted:', categoryId)
    return data;
  } catch (error) {
    console.error('❌ CategoryAPI: Error deleting category:', error)
    throw handleCaughtError(error, CategoryApiError, 'Failed to delete category');
  }
}

export const categoryApiService = {
  getAllCategoriesByEstablishment,
  createCategory,
  updateCategory,
  deleteCategory,
};

export { getAllCategoriesByEstablishment, createCategory, updateCategory, deleteCategory };
