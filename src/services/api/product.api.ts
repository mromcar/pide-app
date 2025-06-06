import {
  ProductCreateDTO,
  ProductUpdateDTO,
  ProductResponseDTO,
  ProductWithRelationsResponseDTO,
} from '@/types/dtos/product';
import { handleApiResponse, handleCaughtError, ApiError } from '@/utils/apiUtils'; // Actualizado
import { ProductApiError } from '@/types/errors/product.api.error';

const API_BASE_URL = '/api/restaurants'; // Asumiendo que los productos están bajo un restaurante

/**
 * Obtiene todos los productos para un establecimiento específico.
 * @param restaurantId - El ID del restaurante.
 * @param categoryId - (Opcional) El ID de la categoría para filtrar productos.
 * @returns Una promesa que resuelve a un array de ProductResponseDTO.
 */
async function getAllProductsByRestaurant(
  restaurantId: number,
  categoryId?: number
): Promise<ProductResponseDTO[]> {
  try {
    let url = `${API_BASE_URL}/${restaurantId}/menu/products`;
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
        // Añadir cabeceras de autenticación si son necesarias
      },
    });
    // Asume que la API devuelve directamente ProductResponseDTO[] o un objeto que handleApiResponse puede manejar.
    // Si la API devuelve { products: ProductResponseDTO[] }, entonces T sería { products: ProductResponseDTO[] }
    // y harías: const result = await handleApiResponse<{ products: ProductResponseDTO[] }>(response); return result.products;
    return await handleApiResponse<ProductResponseDTO[]>(response);
  } catch (error) {
    throw handleCaughtError(error, ProductApiError, 'Error de red al obtener productos.');
  }
}

/**
 * Obtiene un producto específico por su ID, incluyendo relaciones.
 * @param restaurantId - El ID del restaurante.
 * @param productId - El ID del producto.
 * @returns Una promesa que resuelve a ProductWithRelationsResponseDTO o null si no se encuentra.
 */
async function getProductById(
  restaurantId: number,
  productId: number
): Promise<ProductWithRelationsResponseDTO | null> { // O ProductResponseDTO | null
  try {
    const response = await fetch(`${API_BASE_URL}/${restaurantId}/menu/products/${productId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 404) return null;

    return await handleApiResponse<ProductWithRelationsResponseDTO>(response); // O ProductResponseDTO
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
        return null; 
    }
    throw handleCaughtError(error, ProductApiError, 'Error de red al obtener el producto.');
  }
}

/**
 * Crea un nuevo producto para un establecimiento.
 * @param restaurantId - El ID del restaurante.
 * @param productData - Los datos para el nuevo producto.
 * @returns Una promesa que resuelve al ProductResponseDTO creado.
 */
async function createProduct(
  restaurantId: number,
  productData: ProductCreateDTO
): Promise<ProductResponseDTO> {
  try {
    const response = await fetch(`${API_BASE_URL}/${restaurantId}/menu/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });
    return await handleApiResponse<ProductResponseDTO>(response);
  } catch (error) {
    throw handleCaughtError(error, ProductApiError, 'Error de red al crear el producto.');
  }
}

/**
 * Actualiza un producto existente.
 * @param restaurantId - El ID del restaurante.
 * @param productId - El ID del producto a actualizar.
 * @param productData - Los datos para actualizar el producto.
 * @returns Una promesa que resuelve al ProductResponseDTO actualizado.
 */
async function updateProduct(
  restaurantId: number,
  productId: number,
  productData: ProductUpdateDTO
): Promise<ProductResponseDTO> {
  try {
    const response = await fetch(`${API_BASE_URL}/${restaurantId}/menu/products/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });
    return await handleApiResponse<ProductResponseDTO>(response);
  } catch (error) {
    throw handleCaughtError(error, ProductApiError, 'Error de red al actualizar el producto.');
  }
}

/**
 * Elimina un producto.
 * @param restaurantId - El ID del restaurante.
 * @param productId - El ID del producto a eliminar.
 * @returns Una promesa que resuelve cuando el producto ha sido eliminado.
 */
async function deleteProduct(restaurantId: number, productId: number): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/${restaurantId}/menu/products/${productId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    await handleApiResponse<void>(response); // Asume 204 No Content o similar para DELETE exitoso
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