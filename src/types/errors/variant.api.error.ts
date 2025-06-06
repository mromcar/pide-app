// src/types/errors/variant.api.error.ts
import { ApiError } from '@/utils/apiUtils';

export class VariantApiError extends ApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'VariantApiError';
    Object.setPrototypeOf(this, VariantApiError.prototype);
  }
}
