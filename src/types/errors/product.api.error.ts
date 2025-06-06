// src/types/errors/category.api.error.ts
import { ApiError } from '@/utils/apiUtils';

export class ProductApiError extends ApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'ProductApiError';
    Object.setPrototypeOf(this, ProductApiError.prototype);
  }
}
