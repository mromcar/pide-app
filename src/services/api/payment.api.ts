import { handleApiResponse, handleCaughtError } from '@/utils/apiUtils';
import { PaymentApiError } from '@/types/errors/payment.api.error';
import camelcaseKeys from 'camelcase-keys'; // <-- Añade este import

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

const API_BASE_URL = '/api/payments';

/**
 * Inicia un nuevo proceso de pago
 * @param paymentData - Datos necesarios para iniciar el pago
 * @returns Información del pago creado
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
    return camelcaseKeys(data, { deep: true }) as PaymentResponseDTO;
  } catch (error) {
    throw handleCaughtError(error, PaymentApiError, 'Error al procesar el pago.');
  }
}

/**
 * Obtiene el estado de un pago específico
 * @param paymentId - ID del pago
 * @returns Información actualizada del pago
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
    return camelcaseKeys(data, { deep: true }) as PaymentResponseDTO;
  } catch (error) {
    throw handleCaughtError(error, PaymentApiError, 'Error al obtener el estado del pago.');
  }
}

/**
 * Procesa un reembolso para un pago específico
 * @param paymentId - ID del pago a reembolsar
 * @param amount - Cantidad a reembolsar (opcional, si no se especifica se reembolsa el total)
 * @returns Información del reembolso procesado
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
    return camelcaseKeys(data, { deep: true }) as PaymentResponseDTO;
  } catch (error) {
    throw handleCaughtError(error, PaymentApiError, 'Error al procesar el reembolso.');
  }
}

/**
 * Obtiene el historial de pagos de un pedido
 * @param orderId - ID del pedido
 * @returns Lista de pagos asociados al pedido
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
    return camelcaseKeys(data, { deep: true }) as PaymentResponseDTO[];
  } catch (error) {
    throw handleCaughtError(error, PaymentApiError, 'Error al obtener el historial de pagos del pedido.');
  }
}

export const paymentApiService = {
  createPayment,
  getPaymentStatus,
  refundPayment,
  getOrderPayments,
};
