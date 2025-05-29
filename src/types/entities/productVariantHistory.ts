import { Prisma } from '@prisma/client';
import { ProductVariant } from './productVariant';

export interface ProductVariantHistory {
  id: number;
  variant_id?: number | null;
  variant_description?: string | null;
  price?: Prisma.Decimal | null;
  is_active?: boolean | null;
  updated_at?: Date | null;

  // Relations
  variant?: ProductVariant | null;
}