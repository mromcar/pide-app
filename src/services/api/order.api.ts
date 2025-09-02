import {
  OrderCreateDTO,
  OrderUpdateDTO,
  OrderResponseDTO,
  OrderFilters,
} from '@/types/dtos/order';
import { handleApiResponse, handleCaughtError, ApiError } from '@/utils/apiUtils';
import { OrderApiError } from '@/types/errors/order.api.error';
import { OrderStatus } from '@prisma/client';
import { getClientApiUrl, debugApiClient } from '@/lib/api-client';

const API_ORDERS_PATH = '/api/orders';

/**
 * Creates a new order.
 */
async function createOrder(orderData: OrderCreateDTO): Promise<OrderResponseDTO> {
  try {
    const itemsCount = orderData.orderItems ? orderData.orderItems.length : 0;
    console.log('🔍 OrderAPI: Creating order with items:', itemsCount, {
      establishmentId: orderData.establishmentId,
      totalAmount: orderData.totalAmount
    })

    if (process.env.NODE_ENV === 'development') {
      debugApiClient()
    }

    const apiUrl = getClientApiUrl(API_ORDERS_PATH);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
      credentials: 'include',
    });

    const data = await handleApiResponse<OrderResponseDTO>(response);

    console.log('✅ OrderAPI: Order created successfully:', {
      orderId: data.orderId,
      status: data.status,
      totalAmount: data.totalAmount
    })
    return data;
  } catch (error) {
    console.error('❌ OrderAPI: Error creating order:', error)
    throw handleCaughtError(error, OrderApiError, 'Failed to create order');
  }
}

/**
 * Fetches a specific order by ID.
 */
async function getOrderById(orderId: number): Promise<OrderResponseDTO | null> {
  try {
    console.log('🔍 OrderAPI: Fetching order by ID:', orderId)

    const apiUrl = getClientApiUrl(`${API_ORDERS_PATH}/${orderId}`);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (response.status === 404) {
      console.log('⚠️ OrderAPI: Order not found:', orderId)
      return null;
    }

    const data = await handleApiResponse<OrderResponseDTO>(response);

    console.log('✅ OrderAPI: Order loaded:', {
      orderId: data.orderId,
      status: data.status,
      itemsCount: data.orderItems?.length || 0
    })
    return data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    console.error('❌ OrderAPI: Error fetching order:', error)
    throw handleCaughtError(error, OrderApiError, 'Failed to fetch order');
  }
}

// ========================================
// 🚧 FUNCIONES FUTURAS (endpoints no implementados aún)
// ========================================

/**
 * Fetches orders with filtering and pagination.
 * 🚧 BACKEND TODO: Implement GET /api/orders with query parameters
 */
async function getAllOrders(filters?: OrderFilters): Promise<OrderResponseDTO[]> {
  console.warn('🚧 getAllOrders: Backend endpoint not implemented yet')
  console.log('📋 Filters that would be used:', filters)

  // TODO: When backend is ready, implement:
  // const queryParams = new URLSearchParams();
  // if (filters?.status) queryParams.append('status', filters.status);
  // if (filters?.establishmentId) queryParams.append('establishmentId', filters.establishmentId.toString());
  // if (filters?.clientUserId) queryParams.append('clientUserId', filters.clientUserId.toString());
  // if (filters?.waiterUserId) queryParams.append('waiterUserId', filters.waiterUserId.toString());
  // if (filters?.fromDate) queryParams.append('fromDate', filters.fromDate);
  // if (filters?.toDate) queryParams.append('toDate', filters.toDate);
  //
  // const apiUrl = getClientApiUrl(`${API_ORDERS_PATH}?${queryParams.toString()}`);

  throw new OrderApiError('Backend endpoint not implemented: GET /api/orders with filters', 501);
}

/**
 * Updates order status.
 * 🚧 BACKEND TODO: Implement PATCH /api/orders/[orderId]/status
 */
async function updateOrderStatus(
  orderId: number,
  status: OrderStatus,
  notes?: string
): Promise<OrderResponseDTO> {
  console.warn('🚧 updateOrderStatus: Backend endpoint not implemented yet')
  console.log('📋 Update that would be performed:', { orderId, status, notes })

  // TODO: When backend is ready, implement:
  // const apiUrl = getClientApiUrl(`${API_ORDERS_PATH}/${orderId}/status`);
  // const response = await fetch(apiUrl, {
  //   method: 'PATCH',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ status, notes }),
  //   credentials: 'include',
  // });

  throw new OrderApiError('Backend endpoint not implemented: PATCH /api/orders/[orderId]/status', 501);
}

/**
 * Updates complete order.
 * 🚧 BACKEND TODO: Implement PUT /api/orders/[orderId]
 */
async function updateOrder(orderId: number, orderData: OrderUpdateDTO): Promise<OrderResponseDTO> {
  console.warn('🚧 updateOrder: Backend endpoint not implemented yet')
  console.log('📋 Update that would be performed:', { orderId, orderData })

  // TODO: When backend is ready, implement:
  // const apiUrl = getClientApiUrl(`${API_ORDERS_PATH}/${orderId}`);
  // const response = await fetch(apiUrl, {
  //   method: 'PUT',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(orderData),
  //   credentials: 'include',
  // });

  throw new OrderApiError('Backend endpoint not implemented: PUT /api/orders/[orderId]', 501);
}

/**
 * Deletes an order.
 * 🚧 BACKEND TODO: Implement DELETE /api/orders/[orderId]
 */
async function deleteOrder(orderId: number): Promise<void> {
  console.warn('🚧 deleteOrder: Backend endpoint not implemented yet')
  console.log('📋 Delete that would be performed:', { orderId })

  // TODO: When backend is ready, implement:
  // const apiUrl = getClientApiUrl(`${API_ORDERS_PATH}/${orderId}`);
  // const response = await fetch(apiUrl, {
  //   method: 'DELETE',
  //   headers: { 'Content-Type': 'application/json' },
  //   credentials: 'include',
  // });

  throw new OrderApiError('Backend endpoint not implemented: DELETE /api/orders/[orderId]', 501);
}

export const orderApiService = {
  // ✅ IMPLEMENTADO en tu backend
  createOrder,
  getOrderById,

  // 🚧 FUNCIONES FUTURAS (documentadas para implementar después)
  getAllOrders,
  updateOrderStatus,
  updateOrder,
  deleteOrder,
};

export {
  createOrder,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  updateOrder,
  deleteOrder,
};
