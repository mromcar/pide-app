import type { CategoryCreateDTO, CategoryUpdateDTO, CategoryDTO } from '@/types/dtos/category'
import { handleApiResponse, handleCaughtError } from '@/utils/apiUtils'
import { CategoryApiError } from '@/types/errors/category.api.error'
import { getClientApiUrl, debugApiClient } from '@/lib/api-client'

const API_MENU_PATH = '/api/menu'
const API_ADMIN_PATH = '/api/admin/establishments'

// Public
export async function getAllCategoriesByEstablishment(establishmentId: number): Promise<CategoryDTO[]> {
  try {
    if (process.env.NODE_ENV === 'development') debugApiClient()
    const apiUrl = getClientApiUrl(`${API_MENU_PATH}/${establishmentId}/categories`)
    const response = await fetch(apiUrl, { method: 'GET', headers: { 'Content-Type': 'application/json' } })
    const data = await handleApiResponse<{ categories: CategoryDTO[] }>(response)
    return data?.categories || []
  } catch (error) {
    throw handleCaughtError(error, CategoryApiError, 'Failed to fetch categories')
  }
}

// Admin CRUD
export async function createCategory(establishmentId: number, categoryData: CategoryCreateDTO): Promise<CategoryDTO> {
  try {
    const apiUrl = getClientApiUrl(`${API_ADMIN_PATH}/${establishmentId}/menu/categories`)
    const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(categoryData) })
    const data = await handleApiResponse<{ category: CategoryDTO }>(response)
    return data.category
  } catch (error) {
    throw handleCaughtError(error, CategoryApiError, 'Failed to create category')
  }
}

export async function updateCategory(establishmentId: number, categoryId: number, updateData: CategoryUpdateDTO): Promise<CategoryDTO> {
  try {
    const apiUrl = getClientApiUrl(`${API_ADMIN_PATH}/${establishmentId}/menu/categories/${categoryId}`)
    const response = await fetch(apiUrl, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updateData) })
    const data = await handleApiResponse<{ category: CategoryDTO }>(response)
    return data.category
  } catch (error) {
    throw handleCaughtError(error, CategoryApiError, 'Failed to update category')
  }
}

export async function deleteCategory(establishmentId: number, categoryId: number): Promise<{ message: string; category?: CategoryDTO }> {
  try {
    const apiUrl = getClientApiUrl(`${API_ADMIN_PATH}/${establishmentId}/menu/categories/${categoryId}`)
    const response = await fetch(apiUrl, { method: 'DELETE', headers: { 'Content-Type': 'application/json' } })
    return await handleApiResponse<{ message: string; category?: CategoryDTO }>(response)
  } catch (error) {
    throw handleCaughtError(error, CategoryApiError, 'Failed to delete category')
  }
}

// Admin (list/create/update/delete used by AdminMenuManager)
type CategoriesResponse = { categories: CategoryDTO[] }
type CategoryOneResponse = { category: CategoryDTO }

export async function getAdminCategories(establishmentId: number): Promise<CategoryDTO[]> {
  const res = await fetch(getClientApiUrl(`${API_ADMIN_PATH}/${establishmentId}/menu/categories`), { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to fetch categories')
  const json: CategoriesResponse = await res.json()
  return json.categories
}

export async function createAdminCategory(establishmentId: number, body: unknown): Promise<CategoryDTO> {
  const res = await fetch(getClientApiUrl(`${API_ADMIN_PATH}/${establishmentId}/menu/categories`), {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error('Failed to create category')
  const json: CategoryOneResponse = await res.json()
  return json.category
}

export async function updateAdminCategory(establishmentId: number, id: number, body: unknown): Promise<CategoryDTO> {
  const res = await fetch(getClientApiUrl(`${API_ADMIN_PATH}/${establishmentId}/menu/categories/${id}`), {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error('Failed to update category')
  const json: CategoryOneResponse = await res.json()
  return json.category
}

export async function deleteAdminCategory(establishmentId: number, categoryId: number): Promise<void> {
  const res = await fetch(getClientApiUrl(`${API_ADMIN_PATH}/${establishmentId}/menu/categories/${categoryId}`), { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete category')
}
