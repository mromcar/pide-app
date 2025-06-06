import {
  ProductCreateDTO,
  ProductUpdateDTO,
  ProductResponseDTO,
  ProductWithRelationsResponseDTO, // Mantener si es un tipo definido, o usar ProductResponseDTO
} from '@/types/dtos/product';
import { handleApiResponse, ApiError, NetworkError, UnexpectedResponseError } from '@/utils/apiUtils';
import { ProductApiError } from '@/types/errors/product.api.error'; // Nueva importación

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
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new NetworkError('Error de red al obtener productos.');
    }
    if (error instanceof ApiError) {
      throw new ProductApiError(error.message, error.status, error.errorResponse);
    }
    console.error('Error inesperado en getAllProductsByRestaurant:', error);
    throw new UnexpectedResponseError('Error inesperado obteniendo productos.');
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
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new NetworkError('Error de red al obtener el producto.');
    }
    if (error instanceof ApiError && error.status === 404) {
        // Para 404, podrías querer lanzar ProductApiError o simplemente devolver null como antes
        // Si devuelves null, el throw de ProductApiError no se alcanzaría para 404.
        // Si quieres que 404 también sea un ProductApiError, elimina la condición específica de 404 aquí
        // y deja que el siguiente bloque lo capture.
        return null; 
    }
    if (error instanceof ApiError) {
      throw new ProductApiError(error.message, error.status, error.errorResponse);
    }
    console.error('Error inesperado en getProductById:', error);
    throw new UnexpectedResponseError('Error inesperado obteniendo el producto.');
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
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new NetworkError('Error de red al crear el producto.');
    }
    if (error instanceof ApiError) {
      throw new ProductApiError(error.message, error.status, error.errorResponse);
    }
    console.error('Error inesperado en createProduct:', error);
    throw new UnexpectedResponseError('Error inesperado creando el producto.');
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
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new NetworkError('Error de red al actualizar el producto.');
    }
    if (error instanceof ApiError) {
      throw new ProductApiError(error.message, error.status, error.errorResponse);
    }
    console.error('Error inesperado en updateProduct:', error);
    throw new UnexpectedResponseError('Error inesperado actualizando el producto.');
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
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new NetworkError('Error de red al eliminar el producto.');
    }
    if (error instanceof ApiError) {
      throw new ProductApiError(error.message, error.status, error.errorResponse);
    }
    console.error('Error inesperado en deleteProduct:', error);
    throw new UnexpectedResponseError('Error inesperado eliminando el producto.');
  }
}

export const productApiService = {
  getAllProductsByRestaurant,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};