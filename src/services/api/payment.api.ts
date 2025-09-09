import {
  PaymentCreateDTO,
  PaymentResponseDTO,
  PaymentStatus,
} from '@/types/dtos/payment';
// Comentar imports no utilizados hasta que se implementen los endpoints
// import { handleApiResponse, handleCaughtError, ApiError } from '@/utils/apiUtils';
import { handleCaughtError, ApiError } from '@/utils/apiUtils';
import { PaymentApiError } from '@/types/errors/payment.api.error';
// import { getClientApiUrl, debugApiClient } from '@/lib/api-client';

// Comentar hasta que se implemente
// const API_PAYMENTS_PATH = '/api/payments';

/**
 * Creates a new payment for an order.
 * 🚧 BACKEND TODO: Implement POST /api/payments
 */
async function createPayment(paymentData: PaymentCreateDTO): Promise<PaymentResponseDTO> {
  try {
    console.log('🚧 PaymentAPI: Creating payment for order:', paymentData.orderId, {
      amount: paymentData.amount,
      currency: paymentData.currency,
      method: paymentData.paymentMethod
    })

    // TODO: When backend is ready, uncomment these lines:
    // if (process.env.NODE_ENV === 'development') {
    //   debugApiClient()
    // }
    // const apiUrl = getClientApiUrl(API_PAYMENTS_PATH);
    // const response = await fetch(apiUrl, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(paymentData),
    //   credentials: 'include',
    // });
    // const data = await handleApiResponse<PaymentResponseDTO>(response);
    // console.log('✅ PaymentAPI: Payment created:', data.id)
    // return data;

    console.warn('🚧 createPayment: Backend endpoint not implemented yet')
    throw new PaymentApiError('Backend endpoint not implemented: POST /api/payments', 501);
  } catch (error) {
    console.error('❌ PaymentAPI: Error creating payment:', error)
    throw handleCaughtError(error, PaymentApiError, 'Failed to create payment');
  }
}

/**
 * Fetches payment status by payment ID.
 * 🚧 BACKEND TODO: Implement GET /api/payments/[paymentId]
 */
async function getPaymentStatus(paymentId: string): Promise<PaymentResponseDTO | null> {
  try {
    console.log('🚧 PaymentAPI: Fetching payment status:', paymentId)

    // TODO: When backend is ready, uncomment these lines:
    // const apiUrl = getClientApiUrl(`${API_PAYMENTS_PATH}/${paymentId}`);
    // const response = await fetch(apiUrl, {
    //   method: 'GET',
    //   headers: { 'Content-Type': 'application/json' },
    //   credentials: 'include',
    // });
    // if (response.status === 404) {
    //   console.log('⚠️ PaymentAPI: Payment not found:', paymentId)
    //   return null;
    // }
    // const data = await handleApiResponse<PaymentResponseDTO>(response);
    // console.log('✅ PaymentAPI: Payment status loaded:', data.status)
    // return data;

    console.warn('🚧 getPaymentStatus: Backend endpoint not implemented yet')
    throw new PaymentApiError('Backend endpoint not implemented: GET /api/payments/[paymentId]', 501);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    console.error('❌ PaymentAPI: Error fetching payment status:', error)
    throw handleCaughtError(error, PaymentApiError, 'Failed to fetch payment status');
  }
}

/**
 * Processes a refund for a specific payment.
 * 🚧 BACKEND TODO: Implement POST /api/payments/[paymentId]/refund
 */
async function refundPayment(paymentId: string, amount?: number): Promise<PaymentResponseDTO> {
  try {
    console.log('🚧 PaymentAPI: Processing refund for payment:', paymentId, { amount })

    // TODO: When backend is ready, uncomment these lines:
    // const apiUrl = getClientApiUrl(`${API_PAYMENTS_PATH}/${paymentId}/refund`);
    // const response = await fetch(apiUrl, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ amount }),
    //   credentials: 'include',
    // });
    // const data = await handleApiResponse<PaymentResponseDTO>(response);
    // console.log('✅ PaymentAPI: Refund processed:', data.id)
    // return data;

    console.warn('🚧 refundPayment: Backend endpoint not implemented yet')
    throw new PaymentApiError('Backend endpoint not implemented: POST /api/payments/[paymentId]/refund', 501);
  } catch (error) {
    console.error('❌ PaymentAPI: Error processing refund:', error)
    throw handleCaughtError(error, PaymentApiError, 'Failed to process refund');
  }
}

/**
 * Fetches payment history for a specific order.
 * 🚧 BACKEND TODO: Implement GET /api/payments/order/[orderId]
 */
async function getOrderPayments(orderId: number): Promise<PaymentResponseDTO[]> {
  try {
    console.log('🚧 PaymentAPI: Fetching payment history for order:', orderId)

    // TODO: When backend is ready, uncomment these lines:
    // const apiUrl = getClientApiUrl(`${API_PAYMENTS_PATH}/order/${orderId}`);
    // const response = await fetch(apiUrl, {
    //   method: 'GET',
    //   headers: { 'Content-Type': 'application/json' },
    //   credentials: 'include',
    // });
    // const data = await handleApiResponse<PaymentResponseDTO[]>(response);
    // console.log('✅ PaymentAPI: Payment history loaded:', data.length)
    // return data;

    console.warn('🚧 getOrderPayments: Backend endpoint not implemented yet')
    throw new PaymentApiError('Backend endpoint not implemented: GET /api/payments/order/[orderId]', 501);
  } catch (error) {
    console.error('❌ PaymentAPI: Error fetching order payments:', error)
    throw handleCaughtError(error, PaymentApiError, 'Failed to fetch order payment history');
  }
}

/**
 * Updates payment status (for webhooks from payment providers).
 * 🚧 BACKEND TODO: Implement PATCH /api/payments/[paymentId]/status
 */
async function updatePaymentStatus(
  paymentId: string,
  status: PaymentStatus,
  _metadata?: Record<string, unknown>
): Promise<PaymentResponseDTO> {
  try {
    console.log('🚧 PaymentAPI: Updating payment status:', paymentId, { status })

    // TODO: When backend is ready, uncomment these lines:
    // const apiUrl = getClientApiUrl(`${API_PAYMENTS_PATH}/${paymentId}/status`);
    // const response = await fetch(apiUrl, {
    //   method: 'PATCH',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ status, metadata: _metadata }),
    //   credentials: 'include',
    // });
    // const data = await handleApiResponse<PaymentResponseDTO>(response);
    // console.log('✅ PaymentAPI: Payment status updated:', data.status)
    // return data;

    console.warn('🚧 updatePaymentStatus: Backend endpoint not implemented yet')
    throw new PaymentApiError('Backend endpoint not implemented: PATCH /api/payments/[paymentId]/status', 501);
  } catch (error) {
    console.error('❌ PaymentAPI: Error updating payment status:', error)
    throw handleCaughtError(error, PaymentApiError, 'Failed to update payment status');
  }
}

export const paymentApiService = {
  createPayment,
  getPaymentStatus,
  refundPayment,
  getOrderPayments,
  updatePaymentStatus,
};

export {
  createPayment,
  getPaymentStatus,
  refundPayment,
  getOrderPayments,
  updatePaymentStatus,
};
