import {
  ProductVariantCreateDTO,
  ProductVariantUpdateDTO,
  ProductVariantResponseDTO,
} from '@/types/dtos/productVariant'
import { handleApiResponse, handleCaughtError, ApiError } from '@/utils/apiUtils'
import { VariantApiError } from '@/types/errors/variant.api.error'
import { getClientApiUrl, debugApiClient } from '@/lib/api-client'

const API_MENU_PATH = '/api/menu'
const API_ADMIN_PATH = '/api/admin/establishments'

// Public
export async function getAllVariantsByProduct(establishmentId: number, productId: number): Promise<ProductVariantResponseDTO[]> {
  try {
    console.log('🔍 VariantAPI: Fetching variants for product:', { establishmentId, productId })

    if (process.env.NODE_ENV === 'development') {
      debugApiClient()
    }

    const apiUrl = getClientApiUrl(`${API_MENU_PATH}/${establishmentId}/variants?productId=${productId}`);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    const variants = await handleApiResponse<ProductVariantResponseDTO[]>(response);

    console.log('✅ VariantAPI: Product variants loaded:', variants.length)
    return Array.isArray(variants) ? variants : [];
  } catch (error) {
    console.error('❌ VariantAPI: Error fetching product variants:', error)
    throw handleCaughtError(error, VariantApiError, 'Failed to fetch product variants');
  }
}

export async function getVariantById(establishmentId: number, productId: number, variantId: number): Promise<ProductVariantResponseDTO | null> {
  try {
    console.log('🔍 VariantAPI: Fetching variant by ID:', { establishmentId, productId, variantId })

    const variants = await getAllVariantsByProduct(establishmentId, productId);
    const variant = variants.find(v => v.variantId === variantId);

    if (!variant) {
      console.log('⚠️ VariantAPI: Variant not found:', variantId)
      return null;
    }

    console.log('✅ VariantAPI: Variant loaded:', variant.variantDescription)
    return variant;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    console.error('❌ VariantAPI: Error fetching variant:', error)
    throw handleCaughtError(error, VariantApiError, 'Failed to fetch variant');
  }
}

// Admin CRUD (simple)
export async function createVariant(establishmentId: number, variantData: ProductVariantCreateDTO): Promise<ProductVariantResponseDTO> {
  try {
    console.log('🔍 VariantAPI: Creating variant for establishment:', {
      establishmentId,
      variantDescription: variantData.variantDescription,
      productId: variantData.productId,
      price: variantData.price
    })

    const apiUrl = getClientApiUrl(`${API_ADMIN_PATH}/${establishmentId}/menu/variants`);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(variantData),
      credentials: 'include',
    });

    const data = await handleApiResponse<ProductVariantResponseDTO>(response);

    console.log('✅ VariantAPI: Variant created successfully:', {
      variantId: data.variantId,
      variantDescription: data.variantDescription
    })
    return data;
  } catch (error) {
    console.error('❌ VariantAPI: Error creating variant:', error)
    throw handleCaughtError(error, VariantApiError, 'Failed to create variant');
  }
}

export async function updateVariant(establishmentId: number, variantId: number, variantData: ProductVariantUpdateDTO): Promise<ProductVariantResponseDTO> {
  try {
    console.log('🔍 VariantAPI: Updating variant:', {
      establishmentId,
      variantId,
      variantDescription: variantData.variantDescription,
      price: variantData.price
    })

    const apiUrl = getClientApiUrl(`${API_ADMIN_PATH}/${establishmentId}/menu/variants/${variantId}`);

    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(variantData),
      credentials: 'include',
    });

    const data = await handleApiResponse<ProductVariantResponseDTO>(response);

    console.log('✅ VariantAPI: Variant updated successfully:', {
      variantId: data.variantId,
      variantDescription: data.variantDescription
    })
    return data;
  } catch (error) {
    console.error('❌ VariantAPI: Error updating variant:', error)
    throw handleCaughtError(error, VariantApiError, 'Failed to update variant');
  }
}

export async function deleteVariant(establishmentId: number, variantId: number): Promise<void> {
  try {
    console.log('🔍 VariantAPI: Deleting variant:', { establishmentId, variantId })

    const apiUrl = getClientApiUrl(`${API_ADMIN_PATH}/${establishmentId}/menu/variants/${variantId}`);

    const response = await fetch(apiUrl, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    await handleApiResponse<void>(response);

    console.log('✅ VariantAPI: Variant deleted successfully:', variantId)
  } catch (error) {
    console.error('❌ VariantAPI: Error deleting variant:', error)
    throw handleCaughtError(error, VariantApiError, 'Failed to delete variant');
  }
}

// Admin (list/create/update/delete used by AdminMenuManager)
type VariantsResponse = { variants: ProductVariantResponseDTO[] }
type VariantOneResponse = { variant: ProductVariantResponseDTO }

export async function getAdminVariants(establishmentId: number, productId: number): Promise<ProductVariantResponseDTO[]> {
  const q = new URLSearchParams({ productId: String(productId) })
  const res = await fetch(getClientApiUrl(`${API_ADMIN_PATH}/${establishmentId}/menu/variants?${q}`), { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to fetch variants')
  const json: VariantsResponse = await res.json()
  return json.variants
}

export async function createAdminVariant(establishmentId: number, body: unknown): Promise<ProductVariantResponseDTO> {
  const res = await fetch(getClientApiUrl(`${API_ADMIN_PATH}/${establishmentId}/menu/variants`), {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error('Failed to create variant')
  const json: VariantOneResponse = await res.json()
  return json.variant
}

export async function updateAdminVariant(establishmentId: number, id: number, body: unknown): Promise<ProductVariantResponseDTO> {
  const res = await fetch(getClientApiUrl(`${API_ADMIN_PATH}/${establishmentId}/menu/variants/${id}`), {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error('Failed to update variant')
  const json: VariantOneResponse = await res.json()
  return json.variant
}

export async function deleteAdminVariant(establishmentId: number, id: number): Promise<void> {
  const res = await fetch(getClientApiUrl(`${API_ADMIN_PATH}/${establishmentId}/menu/variants/${id}`), { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete variant')
}
