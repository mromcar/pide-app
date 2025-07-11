// src/types/errors/order.api.error.ts
import { ApiError } from '@/utils/apiUtils';

export class OrderApiError extends ApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'OrderApiError';
    Object.setPrototypeOf(this, OrderApiError.prototype);
  }
}
