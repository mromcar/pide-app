import { ApiError, ErrorResponse } from '@/utils/apiUtils';

export class ProductApiError extends ApiError {
  constructor(message: string = 'Error en la API de productos', status: number = 500, errorResponse?: ErrorResponse) {
    super(message, status, errorResponse);
    this.name = 'ProductApiError';
  }
}
// Object.setPrototypeOf(this, ProductApiError.prototype); // Necesario si se transpila a ES5 y se quiere usar instanceof correctamente
