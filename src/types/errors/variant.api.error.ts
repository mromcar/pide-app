import { ApiError, ErrorResponse } from '@/utils/apiUtils';

export class VariantApiError extends ApiError {
  constructor(message: string, status: number = 500, errorResponse?: ErrorResponse) {
    super(message, status, errorResponse);
    this.name = 'VariantApiError';
  }
}