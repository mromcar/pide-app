/**
 * Payment Data Transfer Objects
 * Tipos para manejo de pagos y transacciones
 */

/**
 * Estado de un pago
 */
export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded'
}

/**
 * Métodos de pago disponibles
 */
export enum PaymentMethod {
  STRIPE = 'stripe',
  PAYPAL = 'paypal',
  CARD = 'card',
  CASH = 'cash',
  TRANSFER = 'transfer'
}

/**
 * DTO para crear un nuevo pago
 */
export interface PaymentCreateDTO {
  orderId: number;
  amount: number;
  currency: string;
  paymentMethod: string;
  metadata?: Record<string, unknown>;
  description?: string;
  clientSecret?: string;
}

/**
 * DTO para actualizar un pago existente
 */
export interface PaymentUpdateDTO {
  status?: PaymentStatus;
  amount?: number;
  metadata?: Record<string, unknown>;
  failureReason?: string;
  completedAt?: string;
  refundedAmount?: number;
}

/**
 * DTO de respuesta para un pago
 */
export interface PaymentResponseDTO {
  id: string;
  orderId: number;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: string;
  metadata?: Record<string, unknown>;
  description?: string;
  clientSecret?: string;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  refundedAmount?: number;

  // Información adicional del proveedor de pago
  providerPaymentId?: string;
  providerResponse?: Record<string, unknown>;
}

/**
 * DTO para filtros de búsqueda de pagos
 */
export interface PaymentFilters {
  orderId?: number;
  status?: PaymentStatus;
  paymentMethod?: string;
  fromDate?: string;
  toDate?: string;
  minAmount?: number;
  maxAmount?: number;
  currency?: string;
}

/**
 * DTO para respuesta de lista de pagos con paginación
 */
export interface PaymentListResponseDTO {
  payments: PaymentResponseDTO[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  filters: PaymentFilters;
  stats?: {
    totalAmount: number;
    averageAmount: number;
    statusCounts: Record<PaymentStatus, number>;
  };
}

/**
 * DTO para procesar reembolsos
 */
export interface RefundCreateDTO {
  paymentId: string;
  amount?: number; // Si no se especifica, reembolso completo
  reason?: string;
  metadata?: Record<string, unknown>;
}

/**
 * DTO de respuesta para reembolsos
 */
export interface RefundResponseDTO {
  id: string;
  paymentId: string;
  amount: number;
  status: PaymentStatus;
  reason?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  processedAt?: string;

  // Información del proveedor
  providerRefundId?: string;
  providerResponse?: Record<string, unknown>;
}
