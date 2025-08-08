import { ApiError } from '@/utils/apiUtils';

export class PaymentApiError extends ApiError {
  constructor(message: string, status: number, details?: unknown) {
    super(message, status, details as string | Record<string, unknown> | null | undefined);
    this.name = 'PaymentApiError';
  }
}
