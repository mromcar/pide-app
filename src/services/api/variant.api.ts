import {
  ProductVariantCreateDTO,
  ProductVariantUpdateDTO,
  ProductVariantResponseDTO,
} from '@/types/dtos/productVariant';
import { handleApiResponse, handleCaughtError } from '@/utils/apiUtils';
import { VariantApiError } from '@/types/errors/variant.api.error';

const API_BASE_URL = '/api/restaurants';

/**
 * Obtiene todas las variantes de un producto específico.
 */
async function getAllVariantsByProduct(
  restaurantId: number,
  productId: number
): Promise<ProductVariantResponseDTO[]> {
  try {
    const url = `${API_BASE_URL}/${restaurantId}/menu/products/${productId}/variants`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await handleApiResponse<ProductVariantResponseDTO[]>(response);
    return data;
  } catch (error) {
    throw handleCaughtError(error, VariantApiError, 'Error de red al obtener variantes del producto.');
  }
}

/**
 * Obtiene una variante específica por su ID.
 */
async function getVariantById(
  restaurantId: number,
  productId: number,
  variantId: number
): Promise<ProductVariantResponseDTO> {
  try {
    const url = `${API_BASE_URL}/${restaurantId}/menu/products/${productId}/variants/${variantId}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await handleApiResponse<ProductVariantResponseDTO>(response);
    return data;
  } catch (error) {
    throw handleCaughtError(error, VariantApiError, 'Error de red al obtener la variante.');
  }
}

/**
 * Crea una nueva variante para un producto.
 */
async function createVariant(
  restaurantId: number,
  productId: number,
  variantData: ProductVariantCreateDTO
): Promise<ProductVariantResponseDTO> {
  try {
    const url = `${API_BASE_URL}/${restaurantId}/menu/products/${productId}/variants`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(variantData),
      credentials: 'include',
    });
    const data = await handleApiResponse<ProductVariantResponseDTO>(response);
    return data;
  } catch (error) {
    throw handleCaughtError(error, VariantApiError, 'Error de red al crear la variante.');
  }
}

/**
 * Actualiza una variante existente.
 */
async function updateVariant(
  restaurantId: number,
  productId: number,
  variantId: number,
  variantData: ProductVariantUpdateDTO
): Promise<ProductVariantResponseDTO> {
  try {
    const url = `${API_BASE_URL}/${restaurantId}/menu/products/${productId}/variants/${variantId}`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(variantData),
      credentials: 'include',
    });
    const data = await handleApiResponse<ProductVariantResponseDTO>(response);
    return data;
  } catch (error) {
    throw handleCaughtError(error, VariantApiError, 'Error de red al actualizar la variante.');
  }
}

/**
 * Elimina una variante existente.
 */
async function deleteVariant(
  restaurantId: number,
  productId: number,
  variantId: number
): Promise<void> {
  try {
    const url = `${API_BASE_URL}/${restaurantId}/menu/products/${productId}/variants/${variantId}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    await handleApiResponse<void>(response);
  } catch (error) {
    throw handleCaughtError(error, VariantApiError, 'Error de red al eliminar la variante.');
  }
}

export {
  getAllVariantsByProduct,
  getVariantById,
  createVariant,
  updateVariant,
  deleteVariant,
};
