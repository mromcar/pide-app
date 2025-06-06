import {
  OrderCreateDTO,
  OrderUpdateDTO,
  OrderResponseDTO,
} from '@/types/dtos/order';
import { OrderItemCreateDTO, OrderItemUpdateDTO } from '@/types/dtos/orderItem';
import { OrderStatusHistoryCreateDTO } from '@/types/dtos/orderStatusHistory';
import { handleApiResponse, handleCaughtError, ApiError } from '@/utils/apiUtils'; // Actualizado
import { OrderApiError } from '@/types/errors/order.api.error';
import { OrderStatus } from '@prisma/client';

// Base URLs - ajusta según tus rutas reales
const API_BASE_URL_CLIENT = (restaurantId: number) => `/api/restaurants/${restaurantId}/orders/client`;
const API_BASE_URL_EMPLOYEE = (restaurantId: number) => `/api/restaurants/${restaurantId}/orders/employee`;

/**
 * Crea un nuevo pedido para un cliente.
 * @param restaurantId - El ID del restaurante.
 * @param orderData - Los datos del pedido a crear.
 * @returns Una promesa que resuelve a OrderResponseDTO.
 */
export async function createClientOrder(
  restaurantId: number,
  orderData: OrderCreateDTO
): Promise<OrderResponseDTO> {
  try {
    const response = await fetch(API_BASE_URL_CLIENT(restaurantId), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
      credentials: 'include',
    });
    return await handleApiResponse<OrderResponseDTO>(response);
  } catch (error) {
    throw handleCaughtError(error, OrderApiError, 'Error de red al crear el pedido.');
  }
}

/**
 * Obtiene un pedido específico por su ID para un cliente.
 * @param restaurantId - El ID del restaurante.
 * @param orderId - El ID del pedido.
 * @returns Una promesa que resuelve a OrderResponseDTO o null si no se encuentra.
 */
export async function getClientOrderById(
  restaurantId: number,
  orderId: number
): Promise<OrderResponseDTO | null> {
  try {
    const response = await fetch(`${API_BASE_URL_CLIENT(restaurantId)}/${orderId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    if (response.status === 404) return null;
    return await handleApiResponse<OrderResponseDTO>(response);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw handleCaughtError(error, OrderApiError, 'Error de red al obtener el pedido.');
  }
}

/**
 * Obtiene todos los pedidos para un empleado (o administrador) de un restaurante.
 * @param restaurantId - El ID del restaurante.
 * @param status - (Opcional) Filtra por estado del pedido.
 * @returns Una promesa que resuelve a un array de OrderResponseDTO.
 */
export async function getAllEmployeeOrders(
  restaurantId: number,
  status?: OrderStatus
): Promise<OrderResponseDTO[]> {
  try {
    const queryParams = new URLSearchParams();
    if (status) queryParams.append('status', status);
    const url = `${API_BASE_URL_EMPLOYEE(restaurantId)}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    return await handleApiResponse<OrderResponseDTO[]>(response);
  } catch (error) {
    throw handleCaughtError(error, OrderApiError, 'Error de red al obtener los pedidos.');
  }
}

/**
 * Actualiza el estado de un pedido (empleado).
 * @param restaurantId - El ID del restaurante.
 * @param orderId - El ID del pedido.
 * @param statusUpdateData - Datos para actualizar el estado.
 * @returns Una promesa que resuelve a OrderResponseDTO.
 */
export async function updateOrderStatusByEmployee(
  restaurantId: number,
  orderId: number,
  statusUpdateData: { status: OrderStatus; waiter_user_id?: number; notes?: string }
): Promise<OrderResponseDTO> {
  try {
    const response = await fetch(`${API_BASE_URL_EMPLOYEE(restaurantId)}/${orderId}/status`, {
      method: 'PATCH', // O PUT, según tu API
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(statusUpdateData),
      credentials: 'include',
    });
    return await handleApiResponse<OrderResponseDTO>(response);
  } catch (error) {
    throw handleCaughtError(error, OrderApiError, 'Error de red al actualizar el estado del pedido.');
  }
}

/**
 * Actualiza un pedido completo (empleado).
 * Esto podría ser para modificar ítems, notas, etc.
 * @param restaurantId - El ID del restaurante.
 * @param orderId - El ID del pedido.
 * @param orderData - Los datos completos para actualizar el pedido.
 * @returns Una promesa que resuelve a OrderResponseDTO.
 */
export async function updateFullOrderByEmployee(
  restaurantId: number,
  orderId: number,
  orderData: OrderUpdateDTO
): Promise<OrderResponseDTO> {
  try {
    const response = await fetch(`${API_BASE_URL_EMPLOYEE(restaurantId)}/${orderId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
      credentials: 'include',
    });
    return await handleApiResponse<OrderResponseDTO>(response);
  } catch (error) {
    throw handleCaughtError(error, OrderApiError, 'Error de red al actualizar el pedido.');
  }
}

// Podrías añadir más funciones según las necesidades, como:
// - Obtener pedidos de un cliente específico (si la API lo permite y es necesario desde el frontend)
// - Funciones para añadir/actualizar/eliminar ítems de un pedido si la API lo soporta granularmente.

export const orderApiService = {
  createClientOrder,
  getClientOrderById,
  getAllEmployeeOrders,
  updateOrderStatusByEmployee,
  updateFullOrderByEmployee,
};