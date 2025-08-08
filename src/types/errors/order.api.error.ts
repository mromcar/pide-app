// src/types/errors/order.api.error.ts
import { ApiError } from '@/utils/apiUtils';

export class OrderApiError extends ApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details as string | Record<string, unknown> | null | undefined);
    this.name = 'OrderApiError';
    Object.setPrototypeOf(this, OrderApiError.prototype);
  }
}
