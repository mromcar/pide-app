import {
  ProductVariantCreateDTO,
  ProductVariantUpdateDTO,
  ProductVariantResponseDTO,
} from '@/types/dtos/productVariant';
import { handleApiResponse, handleCaughtError } from '@/utils/apiUtils'; // Actualizado
import { VariantApiError } from '@/types/errors/variant.api.error';

const API_BASE_URL = '/api/restaurants';

/**
 * Obtiene todas las variantes de un producto específico.
 * @param restaurantId - El ID del restaurante.
 * @param productId - El ID del producto.
 * @returns Una promesa que resuelve a un array de ProductVariantResponseDTO.
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
    return await handleApiResponse<ProductVariantResponseDTO[]>(response);
  } catch (error) {
    throw handleCaughtError(error, VariantApiError, 'Error de red al obtener variantes del producto.');
  }
}

/**
 * Obtiene una variante específica por su ID.
 * @param restaurantId - El ID del restaurante.
 * @param productId - El ID del producto.
 * @param variantId - El ID de la variante.
 * @returns Una promesa que resuelve a ProductVariantResponseDTO.
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
    return await handleApiResponse<ProductVariantResponseDTO>(response);
  } catch (error) {
    throw handleCaughtError(error, VariantApiError, 'Error de red al obtener la variante.');
  }
}

/**
 * Crea una nueva variante para un producto.
 * @param restaurantId - El ID del restaurante.
 * @param productId - El ID del producto.
 * @param variantData - Los datos de la variante a crear.
 * @returns Una promesa que resuelve a ProductVariantResponseDTO.
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
    return await handleApiResponse<ProductVariantResponseDTO>(response);
  } catch (error) {
    throw handleCaughtError(error, VariantApiError, 'Error de red al crear la variante.');
  }
}

/**
 * Actualiza una variante existente.
 * @param restaurantId - El ID del restaurante.
 * @param productId - El ID del producto.
 * @param variantId - El ID de la variante.
 * @param variantData - Los datos actualizados de la variante.
 * @returns Una promesa que resuelve a ProductVariantResponseDTO.
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
    return await handleApiResponse<ProductVariantResponseDTO>(response);
  } catch (error) {
    throw handleCaughtError(error, VariantApiError, 'Error de red al actualizar la variante.');
  }
}

/**
 * Elimina una variante existente.
 * @param restaurantId - El ID del restaurante.
 * @param productId - El ID del producto.
 * @param variantId - El ID de la variante.
 * @returns Una promesa que resuelve a void.
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