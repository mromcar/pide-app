// src/types/errors/user.api.error.ts
import { ApiError } from '@/utils/apiUtils'; // Importar la clase base

// Clase base para errores de usuario
export class UserApiError extends ApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'UserApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, UserApiError.prototype);
  }
}

// Errores específicos de API
export class OrderApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'OrderApiError';
    Object.setPrototypeOf(this, OrderApiError.prototype);
  }
}

export class PaymentApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'PaymentApiError';
    Object.setPrototypeOf(this, PaymentApiError.prototype);
  }
}

export class ValidationApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'ValidationApiError';
    Object.setPrototypeOf(this, ValidationApiError.prototype);
  }
}

export class SecurityApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'SecurityApiError';
    Object.setPrototypeOf(this, SecurityApiError.prototype);
  }
}

export class NetworkApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'NetworkApiError';
    Object.setPrototypeOf(this, NetworkApiError.prototype);
  }
}

export class FileApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'FileApiError';
    Object.setPrototypeOf(this, FileApiError.prototype);
  }
}

// Errores generales (sin sufijo "Api" para compatibilidad)
export class GeneralError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'GeneralError';
    Object.setPrototypeOf(this, GeneralError.prototype);
  }
}

export class ValidationError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class SecurityError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'SecurityError';
    Object.setPrototypeOf(this, SecurityError.prototype);
  }
}

export class NetworkError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'NetworkError';
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

export class FileError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'FileError';
    Object.setPrototypeOf(this, FileError.prototype);
  }
}
