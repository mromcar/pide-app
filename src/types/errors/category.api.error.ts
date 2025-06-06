// src/types/errors/category.api.error.ts
import { ApiError } from '@/utils/apiUtils';

export class CategoryApiError extends ApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'CategoryApiError';
    Object.setPrototypeOf(this, CategoryApiError.prototype);
  }
}