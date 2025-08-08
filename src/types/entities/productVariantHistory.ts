import { Prisma } from '@prisma/client';
import { ProductVariant } from './productVariant';

export interface ProductVariantHistory {
  id: number;
  variantId?: number | null;
  variantDescription?: string | null;
  price?: Prisma.Decimal | null;
  isActive?: boolean | null;
  updatedAt?: Date | null;

  // Relations
  variant?: ProductVariant | null;
}
