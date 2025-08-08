import {
  ProductCreateDTO,
  ProductUpdateDTO,
  ProductResponseDTO,
  ProductWithRelationsResponseDTO,
} from '@/types/dtos/product';
import { handleApiResponse, handleCaughtError, ApiError } from '@/utils/apiUtils';
import { ProductApiError } from '@/types/errors/product.api.error';

const ENV_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
const API_SERVICE_PATH = '/api/restaurants';

/**
 * Obtiene todos los productos para un establecimiento específico.
 */
async function getAllProductsByRestaurant(
  restaurantId: number,
  categoryId?: number
): Promise<ProductResponseDTO[]> {
  try {
    let url = `${ENV_API_BASE_URL}${API_SERVICE_PATH}/${restaurantId}/menu/products`;
    const queryParams = new URLSearchParams();
    if (categoryId) {
      queryParams.append('categoryId', categoryId.toString());
    }
    if (queryParams.toString()) {
      url += `?${queryParams.toString()}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const result = await handleApiResponse<ProductResponseDTO[]>(response);
    return result;
  } catch (error) {
    throw handleCaughtError(error, ProductApiError, 'Error de red al obtener productos.');
  }
}

/**
 * Obtiene un producto específico por su ID, incluyendo relaciones.
 */
async function getProductById(
  restaurantId: number,
  productId: number
): Promise<ProductWithRelationsResponseDTO | null> {
  try {
    const response = await fetch(`${ENV_API_BASE_URL}${API_SERVICE_PATH}/${restaurantId}/menu/products/${productId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 404) return null;

    const result = await handleApiResponse<ProductWithRelationsResponseDTO>(response);
    return result;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
        return null;
    }
    throw handleCaughtError(error, ProductApiError, 'Error de red al obtener el producto.');
  }
}

/**
 * Crea un nuevo producto para un establecimiento.
 */
async function createProduct(
  restaurantId: number,
  productData: ProductCreateDTO
): Promise<ProductResponseDTO> {
  try {
    const response = await fetch(`${ENV_API_BASE_URL}${API_SERVICE_PATH}/${restaurantId}/menu/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });
    const result = await handleApiResponse<ProductResponseDTO>(response);
    return result;
  } catch (error) {
    throw handleCaughtError(error, ProductApiError, 'Error de red al crear el producto.');
  }
}

/**
 * Actualiza un producto existente.
 */
async function updateProduct(
  restaurantId: number,
  productId: number,
  productData: ProductUpdateDTO
): Promise<ProductResponseDTO> {
  try {
    const response = await fetch(`${ENV_API_BASE_URL}${API_SERVICE_PATH}/${restaurantId}/menu/products/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });
    const result = await handleApiResponse<ProductResponseDTO>(response);
    return result;
  } catch (error) {
    throw handleCaughtError(error, ProductApiError, 'Error de red al actualizar el producto.');
  }
}

/**
 * Elimina un producto.
 */
async function deleteProduct(restaurantId: number, productId: number): Promise<void> {
  try {
    const response = await fetch(`${ENV_API_BASE_URL}${API_SERVICE_PATH}/${restaurantId}/menu/products/${productId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    await handleApiResponse<void>(response);
  } catch (error) {
    throw handleCaughtError(error, ProductApiError, 'Error de red al eliminar el producto.');
  }
}

export const productApiService = {
  getAllProductsByRestaurant,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
