import type { CategoryCreateDTO, CategoryUpdateDTO, CategoryDTO } from '@/types/dtos/category'
import { handleApiResponse, handleCaughtError } from '@/utils/apiUtils'
import { CategoryApiError } from '@/types/errors/category.api.error'
import { getClientApiUrl, debugApiClient } from '@/lib/api-client'

const API_MENU_PATH = '/api/menu'
const API_ADMIN_PATH = '/api/admin/establishments'

// Types for API responses
type CategoriesResponse = { categories: CategoryDTO[] }
type CategoryOneResponse = { category: CategoryDTO }

// Public API - for QR menu access
export async function getAllCategoriesByEstablishment(establishmentId: number): Promise<CategoryDTO[]> {
  try {
    if (process.env.NODE_ENV === 'development') debugApiClient()
    const apiUrl = getClientApiUrl(`${API_MENU_PATH}/${establishmentId}/categories`)
    const response = await fetch(apiUrl, { method: 'GET', headers: { 'Content-Type': 'application/json' } })
    const data = await handleApiResponse<CategoriesResponse>(response)
    return data?.categories || []
  } catch (error) {
    throw handleCaughtError(error, CategoryApiError, 'Failed to fetch categories')
  }
}

// Admin API - used by TanStack Query hooks in AdminMenuManager
export async function getAdminCategories(establishmentId: number): Promise<CategoryDTO[]> {
  const response = await fetch(getClientApiUrl(`${API_ADMIN_PATH}/${establishmentId}/menu/categories`), {
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json' }
  })

  if (!response.ok) {
    console.error('[API] Failed to fetch categories:', response.status, response.statusText)
    throw new Error(`Failed to fetch categories: ${response.statusText}`)
  }

  const json: CategoriesResponse = await response.json()
  return json.categories || []
}

export async function createAdminCategory(establishmentId: number, categoryData: CategoryCreateDTO): Promise<CategoryDTO> {
  // Transform to match API expected format (categoryUpsertSchema)
  const payload = {
    order: categoryData.sortOrder ?? 0,
    active: categoryData.isActive ?? true,
    translations: categoryData.translations || []
  }

  const response = await fetch(getClientApiUrl(`${API_ADMIN_PATH}/${establishmentId}/menu/categories`), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('[API] Failed to create category:', response.status, errorText)
    throw new Error(`Failed to create category: ${response.statusText}`)
  }

  const json: CategoryOneResponse = await response.json()
  return json.category
}

export async function updateAdminCategory(establishmentId: number, categoryId: number, updateData: CategoryUpdateDTO): Promise<CategoryDTO> {
  // Transform to match API expected format
  const payload = {
    order: updateData.sortOrder ?? 0,
    active: updateData.isActive ?? true,
    translations: updateData.translations || []
  }

  const response = await fetch(getClientApiUrl(`${API_ADMIN_PATH}/${establishmentId}/menu/categories/${categoryId}`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('[API] Failed to update category:', response.status, errorText)
    throw new Error(`Failed to update category: ${response.statusText}`)
  }

  const json: CategoryOneResponse = await response.json()
  return json.category
}

export async function deleteAdminCategory(establishmentId: number, categoryId: number): Promise<void> {
  const response = await fetch(getClientApiUrl(`${API_ADMIN_PATH}/${establishmentId}/menu/categories/${categoryId}`), {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' }
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('[API] Failed to delete category:', response.status, errorText)
    throw new Error(`Failed to delete category: ${response.statusText}`)
  }
}

// Legacy functions for backward compatibility (if needed elsewhere)
export async function createCategory(establishmentId: number, categoryData: CategoryCreateDTO): Promise<CategoryDTO> {
  return createAdminCategory(establishmentId, categoryData)
}

export async function updateCategory(establishmentId: number, categoryId: number, updateData: CategoryUpdateDTO): Promise<CategoryDTO> {
  return updateAdminCategory(establishmentId, categoryId, updateData)
}

export async function deleteCategory(establishmentId: number, categoryId: number): Promise<{ message: string; category?: CategoryDTO }> {
  await deleteAdminCategory(establishmentId, categoryId)
  return { message: 'Category deleted successfully' }
}
