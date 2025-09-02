import {
  ProductVariantCreateDTO,
  ProductVariantUpdateDTO,
  ProductVariantResponseDTO,
} from '@/types/dtos/productVariant';
import { handleApiResponse, handleCaughtError, ApiError } from '@/utils/apiUtils';
import { VariantApiError } from '@/types/errors/variant.api.error';
import { getClientApiUrl, debugApiClient } from '@/lib/api-client';

const API_MENU_PATH = '/api/menu';
const API_ADMIN_PATH = '/api/admin/establishments';

/**
 * Fetches all variants of a specific product (public menu).
 * Your API requires productId as query parameter.
 */
async function getAllVariantsByProduct(
  establishmentId: number,
  productId: number
): Promise<ProductVariantResponseDTO[]> {
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

/**
 * Fetches a specific variant by its ID.
 * Since your public API requires productId, we need it as parameter.
 */
async function getVariantById(
  establishmentId: number,
  productId: number,
  variantId: number
): Promise<ProductVariantResponseDTO | null> {
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

/**
 * Creates a new variant for a product (admin).
 */
async function createVariant(
  establishmentId: number,
  variantData: ProductVariantCreateDTO
): Promise<ProductVariantResponseDTO> {
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

/**
 * Updates an existing variant (admin).
 */
async function updateVariant(
  establishmentId: number,
  variantId: number,
  variantData: ProductVariantUpdateDTO
): Promise<ProductVariantResponseDTO> {
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

/**
 * Deletes an existing variant (admin).
 */
async function deleteVariant(
  establishmentId: number,
  variantId: number
): Promise<void> {
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

export const variantApiService = {
  getAllVariantsByProduct,
  getVariantById,
  createVariant,
  updateVariant,
  deleteVariant,
};

export {
  getAllVariantsByProduct,
  getVariantById,
  createVariant,
  updateVariant,
  deleteVariant,
};
