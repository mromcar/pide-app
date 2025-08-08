import {
  OrderCreateDTO,
  OrderUpdateDTO,
  OrderResponseDTO,
} from '@/types/dtos/order';
import { OrderItemCreateDTO, OrderItemUpdateDTO } from '@/types/dtos/orderItem';
import { OrderStatusHistoryCreateDTO } from '@/types/dtos/orderStatusHistory';
import { handleApiResponse, handleCaughtError, ApiError } from '@/utils/apiUtils';
import { PaymentApiError } from '@/types/errors/payment.api.error';
import { OrderApiError } from '@/types/errors/order.api.error';
import { OrderStatus } from '@prisma/client';

// Tipos para los DTOs de pagos
interface PaymentCreateDTO {
  orderId: number;
  amount: number;
  currency: string;
  paymentMethod: string;
  metadata?: Record<string, unknown>;
}

interface PaymentResponseDTO {
  id: string;
  orderId: number;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

const API_BASE_URL_CLIENT = (restaurantId: number) => `/api/restaurants/${restaurantId}/orders/client`;
const API_BASE_URL_EMPLOYEE = (restaurantId: number) => `/api/restaurants/${restaurantId}/orders/employee`;
const API_BASE_URL = '/api/payments';

// Crea un nuevo pedido para un cliente
export async function createClientOrder(
  restaurantId: number,
  orderData: OrderCreateDTO
): Promise<OrderResponseDTO> {
  try {
    const response = await fetch(API_BASE_URL_CLIENT(restaurantId), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
      credentials: 'include',
    });
    const data = await handleApiResponse<OrderResponseDTO>(response);
    return data;
  } catch (error) {
    throw handleCaughtError(error, OrderApiError, 'Error de red al crear el pedido.');
  }
}

// Obtiene un pedido específico por su ID para un cliente
export async function getClientOrderById(
  restaurantId: number,
  orderId: number
): Promise<OrderResponseDTO | null> {
  try {
    const response = await fetch(`${API_BASE_URL_CLIENT(restaurantId)}/${orderId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    if (response.status === 404) return null;
    const data = await handleApiResponse<OrderResponseDTO>(response);
    return data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw handleCaughtError(error, OrderApiError, 'Error de red al obtener el pedido.');
  }
}

// Obtiene todos los pedidos para un empleado (o administrador) de un restaurante
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
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    const data = await handleApiResponse<OrderResponseDTO[]>(response);
    return data;
  } catch (error) {
    throw handleCaughtError(error, OrderApiError, 'Error de red al obtener los pedidos.');
  }
}

// Actualiza el estado de un pedido (empleado)
export async function updateOrderStatusByEmployee(
  restaurantId: number,
  orderId: number,
  statusUpdateData: { status: OrderStatus; waiter_user_id?: number; notes?: string }
): Promise<OrderResponseDTO> {
  try {
    const response = await fetch(`${API_BASE_URL_EMPLOYEE(restaurantId)}/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(statusUpdateData),
      credentials: 'include',
    });
    const data = await handleApiResponse<OrderResponseDTO>(response);
    return data;
  } catch (error) {
    throw handleCaughtError(error, OrderApiError, 'Error de red al actualizar el estado del pedido.');
  }
}

// Actualiza un pedido completo (empleado)
export async function updateFullOrderByEmployee(
  restaurantId: number,
  orderId: number,
  orderData: OrderUpdateDTO
): Promise<OrderResponseDTO> {
  try {
    const response = await fetch(`${API_BASE_URL_EMPLOYEE(restaurantId)}/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
      credentials: 'include',
    });
    const data = await handleApiResponse<OrderResponseDTO>(response);
    return data;
  } catch (error) {
    throw handleCaughtError(error, OrderApiError, 'Error de red al actualizar el pedido.');
  }
}

/**
 * Inicia un nuevo proceso de pago
 */
async function createPayment(paymentData: PaymentCreateDTO): Promise<PaymentResponseDTO> {
  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
      credentials: 'include',
    });
    const data = await handleApiResponse<PaymentResponseDTO>(response);
    return data;
  } catch (error) {
    throw handleCaughtError(error, PaymentApiError, 'Error al procesar el pago.');
  }
}

/**
 * Obtiene el estado de un pago específico
 */
async function getPaymentStatus(paymentId: string): Promise<PaymentResponseDTO> {
  try {
    const response = await fetch(`${API_BASE_URL}/${paymentId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    const data = await handleApiResponse<PaymentResponseDTO>(response);
    return data;
  } catch (error) {
    throw handleCaughtError(error, PaymentApiError, 'Error al obtener el estado del pago.');
  }
}

/**
 * Procesa un reembolso para un pago específico
 */
async function refundPayment(paymentId: string, amount?: number): Promise<PaymentResponseDTO> {
  try {
    const response = await fetch(`${API_BASE_URL}/${paymentId}/refund`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount }),
      credentials: 'include',
    });
    const data = await handleApiResponse<PaymentResponseDTO>(response);
    return data;
  } catch (error) {
    throw handleCaughtError(error, PaymentApiError, 'Error al procesar el reembolso.');
  }
}

/**
 * Obtiene el historial de pagos de un pedido
 */
async function getOrderPayments(orderId: number): Promise<PaymentResponseDTO[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/order/${orderId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    const data = await handleApiResponse<PaymentResponseDTO[]>(response);
    return data;
  } catch (error) {
    throw handleCaughtError(error, PaymentApiError, 'Error al obtener el historial de pagos del pedido.');
  }
}

export const orderApiService = {
  createClientOrder,
  getClientOrderById,
  getAllEmployeeOrders,
  updateOrderStatusByEmployee,
  updateFullOrderByEmployee,
};

export const paymentApiService = {
  createPayment,
  getPaymentStatus,
  refundPayment,
  getOrderPayments,
};
