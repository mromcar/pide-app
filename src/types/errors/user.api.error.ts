// src/types/errors/user.api.error.ts
import { ApiError } from '@/utils/apiUtils'; // Importar la clase base

export class UserApiError extends ApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'UserApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, UserApiError.prototype);
  }
}

export class OrderApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'OrderApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, OrderApiError.prototype);
  }
}

export class PaymentApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'PaymentApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, PaymentApiError.prototype);
  }
}

export class GeneralApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'GeneralApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, GeneralApiError.prototype);
  }
}

export class ValidationApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'ValidationApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, ValidationApiError.prototype);
  }
}

export class SecurityApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'SecurityApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, SecurityApiError.prototype);
  }
}

export class NetworkApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'NetworkApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, NetworkApiError.prototype);
  }
}

export class FileApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'FileApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, FileApiError.prototype);
  }
}

export class GeneralError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'GeneralError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, GeneralError.prototype);
  }
}

export class ValidationError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'ValidationError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class SecurityError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'SecurityError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, SecurityError.prototype);
  }
}

export class NetworkError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'NetworkError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

export class FileError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'FileError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, FileError.prototype);
  }
}

export class GeneralApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'GeneralApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, GeneralApiError.prototype);
  }
}

export class ValidationApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'ValidationApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, ValidationApiError.prototype);
  }
}

export class SecurityApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'SecurityApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, SecurityApiError.prototype);
  }
}

export class NetworkApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'NetworkApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, NetworkApiError.prototype);
  }
}

export class FileApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'FileApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, FileApiError.prototype);
  }
}

export class GeneralError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'GeneralError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, GeneralError.prototype);
  }
}

export class ValidationError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'ValidationError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class SecurityError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'SecurityError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, SecurityError.prototype);
  }
}

export class NetworkError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'NetworkError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

export class FileError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'FileError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, FileError.prototype);
  }
}

export class GeneralApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'GeneralApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, GeneralApiError.prototype);
  }
}

export class ValidationApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'ValidationApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, ValidationApiError.prototype);
  }
}

export class SecurityApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'SecurityApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, SecurityApiError.prototype);
  }
}

export class NetworkApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'NetworkApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, NetworkApiError.prototype);
  }
}

export class FileApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'FileApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, FileApiError.prototype);
  }
}

export class GeneralError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'GeneralError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, GeneralError.prototype);
  }
}

export class ValidationError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'ValidationError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class SecurityError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'SecurityError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, SecurityError.prototype);
  }
}

export class NetworkError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'NetworkError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

export class FileError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'FileError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, FileError.prototype);
  }
}

export class GeneralApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'GeneralApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, GeneralApiError.prototype);
  }
}

export class ValidationApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'ValidationApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, ValidationApiError.prototype);
  }
}

export class SecurityApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'SecurityApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, SecurityApiError.prototype);
  }
}

export class NetworkApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'NetworkApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, NetworkApiError.prototype);
  }
}

export class FileApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'FileApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, FileApiError.prototype);
  }
}

export class GeneralError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'GeneralError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, GeneralError.prototype);
  }
}

export class ValidationError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'ValidationError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class SecurityError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'SecurityError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, SecurityError.prototype);
  }
}

export class NetworkError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'NetworkError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

export class FileError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'FileError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, FileError.prototype);
  }
}

export class GeneralApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'GeneralApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, GeneralApiError.prototype);
  }
}

export class ValidationApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'ValidationApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, ValidationApiError.prototype);
  }
}

export class SecurityApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'SecurityApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, SecurityApiError.prototype);
  }
}

export class NetworkApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'NetworkApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, NetworkApiError.prototype);
  }
}

export class FileApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'FileApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, FileApiError.prototype);
  }
}

export class GeneralError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'GeneralError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, GeneralError.prototype);
  }
}

export class ValidationError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'ValidationError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class SecurityError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'SecurityError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, SecurityError.prototype);
  }
}

export class NetworkError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'NetworkError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

export class FileError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'FileError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, FileError.prototype);
  }
}

export class GeneralApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'GeneralApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, GeneralApiError.prototype);
  }
}

export class ValidationApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'ValidationApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, ValidationApiError.prototype);
  }
}

export class SecurityApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'SecurityApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, SecurityApiError.prototype);
  }
}

export class NetworkApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'NetworkApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, NetworkApiError.prototype);
  }
}

export class FileApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'FileApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, FileApiError.prototype);
  }
}

export class GeneralError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'GeneralError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, GeneralError.prototype);
  }
}

export class ValidationError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'ValidationError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class SecurityError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'SecurityError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, SecurityError.prototype);
  }
}

export class NetworkError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'NetworkError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

export class FileError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'FileError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, FileError.prototype);
  }
}

export class GeneralApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'GeneralApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, GeneralApiError.prototype);
  }
}

export class ValidationApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'ValidationApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, ValidationApiError.prototype);
  }
}

export class SecurityApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'SecurityApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, SecurityApiError.prototype);
  }
}

export class NetworkApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'NetworkApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, NetworkApiError.prototype);
  }
}

export class FileApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'FileApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, FileApiError.prototype);
  }
}

export class GeneralError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'GeneralError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, GeneralError.prototype);
  }
}

export class ValidationError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'ValidationError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class SecurityError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'SecurityError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, SecurityError.prototype);
  }
}

export class NetworkError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'NetworkError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

export class FileError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'FileError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, FileError.prototype);
  }
}

export class GeneralApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'GeneralApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, GeneralApiError.prototype);
  }
}

export class ValidationApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'ValidationApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, ValidationApiError.prototype);
  }
}

export class SecurityApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'SecurityApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, SecurityApiError.prototype);
  }
}

export class NetworkApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'NetworkApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, NetworkApiError.prototype);
  }
}

export class FileApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'FileApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, FileApiError.prototype);
  }
}

export class GeneralError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'GeneralError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, GeneralError.prototype);
  }
}

export class ValidationError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'ValidationError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class SecurityError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'SecurityError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, SecurityError.prototype);
  }
}

export class NetworkError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'NetworkError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

export class FileError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'FileError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, FileError.prototype);
  }
}

export class GeneralApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'GeneralApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, GeneralApiError.prototype);
  }
}

export class ValidationApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'ValidationApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, ValidationApiError.prototype);
  }
}

export class SecurityApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'SecurityApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, SecurityApiError.prototype);
  }
}

export class NetworkApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'NetworkApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, NetworkApiError.prototype);
  }
}

export class FileApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'FileApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, FileApiError.prototype);
  }
}

export class GeneralError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'GeneralError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, GeneralError.prototype);
  }
}

export class ValidationError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'ValidationError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class SecurityError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'SecurityError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, SecurityError.prototype);
  }
}

export class NetworkError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'NetworkError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

export class FileError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'FileError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, FileError.prototype);
  }
}

export class GeneralApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'GeneralApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, GeneralApiError.prototype);
  }
}

export class ValidationApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'ValidationApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, ValidationApiError.prototype);
  }
}

export class SecurityApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'SecurityApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, SecurityApiError.prototype);
  }
}

export class NetworkApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'NetworkApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, NetworkApiError.prototype);
  }
}

export class FileApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'FileApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, FileApiError.prototype);
  }
}

export class GeneralError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'GeneralError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, GeneralError.prototype);
  }
}

export class ValidationError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'ValidationError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class SecurityError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'SecurityError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, SecurityError.prototype);
  }
}

export class NetworkError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'NetworkError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

export class FileError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'FileError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, FileError.prototype);
  }
}

export class GeneralApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'GeneralApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, GeneralApiError.prototype);
  }
}

export class ValidationApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'ValidationApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, ValidationApiError.prototype);
  }
}

export class SecurityApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'SecurityApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, SecurityApiError.prototype);
  }
}

export class NetworkApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'NetworkApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, NetworkApiError.prototype);
  }
}

export class FileApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'FileApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, FileApiError.prototype);
  }
}

export class GeneralError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'GeneralError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, GeneralError.prototype);
  }
}

export class ValidationError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'ValidationError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class SecurityError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'SecurityError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, SecurityError.prototype);
  }
}

export class NetworkError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'NetworkError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

export class FileError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'FileError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, FileError.prototype);
  }
}

export class GeneralApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'GeneralApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, GeneralApiError.prototype);
  }
}

export class ValidationApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'ValidationApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, ValidationApiError.prototype);
  }
}

export class SecurityApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'SecurityApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, SecurityApiError.prototype);
  }
}

export class NetworkApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'NetworkApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, NetworkApiError.prototype);
  }
}

export class FileApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'FileApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, FileApiError.prototype);
  }
}

export class GeneralError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'GeneralError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, GeneralError.prototype);
  }
}

export class ValidationError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'ValidationError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class SecurityError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'SecurityError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, SecurityError.prototype);
  }
}

export class NetworkError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'NetworkError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

export class FileError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'FileError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, FileError.prototype);
  }
}

export class GeneralApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'GeneralApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, GeneralApiError.prototype);
  }
}

export class ValidationApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'ValidationApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, ValidationApiError.prototype);
  }
}

export class SecurityApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'SecurityApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, SecurityApiError.prototype);
  }
}

export class NetworkApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'NetworkApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, NetworkApiError.prototype);
  }
}

export class FileApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'FileApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, FileApiError.prototype);
  }
}

export class GeneralError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'GeneralError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, GeneralError.prototype);
  }
}

export class ValidationError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'ValidationError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class SecurityError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'SecurityError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, SecurityError.prototype);
  }
}

export class NetworkError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'NetworkError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

export class FileError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'FileError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, FileError.prototype);
  }
}

export class GeneralApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'GeneralApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, GeneralApiError.prototype);
  }
}

export class ValidationApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'ValidationApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, ValidationApiError.prototype);
  }
}

export class SecurityApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'SecurityApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, SecurityApiError.prototype);
  }
}

export class NetworkApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'NetworkApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, NetworkApiError.prototype);
  }
}

export class FileApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'FileApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, FileApiError.prototype);
  }
}

export class GeneralError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'GeneralError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, GeneralError.prototype);
  }
}

export class ValidationError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'ValidationError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class SecurityError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'SecurityError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, SecurityError.prototype);
  }
}

export class NetworkError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'NetworkError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

export class FileError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'FileError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, FileError.prototype);
  }
}

export class GeneralApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'GeneralApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, GeneralApiError.prototype);
  }
}

export class ValidationApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'ValidationApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, ValidationApiError.prototype);
  }
}

export class SecurityApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'SecurityApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, SecurityApiError.prototype);
  }
}

export class NetworkApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'NetworkApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, NetworkApiError.prototype);
  }
}

export class FileApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'FileApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, FileApiError.prototype);
  }
}

export class GeneralError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'GeneralError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, GeneralError.prototype);
  }
}

export class ValidationError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'ValidationError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class SecurityError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'SecurityError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, SecurityError.prototype);
  }
}

export class NetworkError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'NetworkError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

export class FileError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'FileError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, FileError.prototype);
  }
}

export class GeneralApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'GeneralApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, GeneralApiError.prototype);
  }
}

export class ValidationApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'ValidationApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, ValidationApiError.prototype);
  }
}

export class SecurityApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'SecurityApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, SecurityApiError.prototype);
  }
}

export class NetworkApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'NetworkApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, NetworkApiError.prototype);
  }
}

export class FileApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'FileApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, FileApiError.prototype);
  }
}

export class GeneralError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'GeneralError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, GeneralError.prototype);
  }
}

export class ValidationError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'ValidationError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class SecurityError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'SecurityError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, SecurityError.prototype);
  }
}

export class NetworkError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'NetworkError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

export class FileError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'FileError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, FileError.prototype);
  }
}

export class GeneralApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'GeneralApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, GeneralApiError.prototype);
  }
}

export class ValidationApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'ValidationApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, ValidationApiError.prototype);
  }
}

export class SecurityApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'SecurityApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, SecurityApiError.prototype);
  }
}

export class NetworkApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'NetworkApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, NetworkApiError.prototype);
  }
}

export class FileApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'FileApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, FileApiError.prototype);
  }
}

export class GeneralError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'GeneralError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, GeneralError.prototype);
  }
}

export class ValidationError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'ValidationError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class SecurityError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'SecurityError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, SecurityError.prototype);
  }
}

export class NetworkError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'NetworkError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

export class FileError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'FileError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, FileError.prototype);
  }
}

export class GeneralApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'GeneralApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, GeneralApiError.prototype);
  }
}

export class ValidationApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'ValidationApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, ValidationApiError.prototype);
  }
}

export class SecurityApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'SecurityApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, SecurityApiError.prototype);
  }
}

export class NetworkApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'NetworkApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, NetworkApiError.prototype);
  }
}

export class FileApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'FileApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, FileApiError.prototype);
  }
}

export class GeneralError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'GeneralError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, GeneralError.prototype);
  }
}

export class ValidationError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'ValidationError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class SecurityError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'SecurityError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, SecurityError.prototype);
  }
}

export class NetworkError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'NetworkError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

export class FileError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'FileError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, FileError.prototype);
  }
}

export class GeneralApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'GeneralApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, GeneralApiError.prototype);
  }
}

export class ValidationApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'ValidationApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, ValidationApiError.prototype);
  }
}

export class SecurityApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'SecurityApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, SecurityApiError.prototype);
  }
}

export class NetworkApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'NetworkApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, NetworkApiError.prototype);
  }
}

export class FileApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'FileApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, FileApiError.prototype);
  }
}

export class GeneralError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'GeneralError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, GeneralError.prototype);
  }
}

export class ValidationError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'ValidationError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class SecurityError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'SecurityError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, SecurityError.prototype);
  }
}

export class NetworkError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'NetworkError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

export class FileError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'FileError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, FileError.prototype);
  }
}

export class GeneralApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'GeneralApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, GeneralApiError.prototype);
  }
}

export class ValidationApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'ValidationApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, ValidationApiError.prototype);
  }
}

export class SecurityApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'SecurityApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, SecurityApiError.prototype);
  }
}

export class NetworkApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'NetworkApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, NetworkApiError.prototype);
  }
}

export class FileApiError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'FileApiError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, FileApiError.prototype);
  }
}

export class GeneralError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'GeneralError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, GeneralError.prototype);
  }
}

export class ValidationError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'ValidationError';

    // Asegurar que el prototipo se establece correctamente para la clase derivada
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class SecurityError extends UserApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'SecurityError';