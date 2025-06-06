import { ApiError, ErrorResponse } from '@/utils/apiUtils';

export class CategoryApiError extends ApiError {
  constructor(message: string = 'Error en la API de categorías', status: number = 500, errorResponse?: ErrorResponse) {
    super(message, status, errorResponse);
    this.name = 'CategoryApiError';
  }
}