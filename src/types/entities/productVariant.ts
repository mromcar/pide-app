import { Prisma } from '@prisma/client';
import { Establishment } from './establishment';
import { Product } from './product';
import { ProductVariantHistory } from './productVariantHistory';
import { ProductVariantTranslation } from './productVariantTranslation';
import { User } from './user';
// import { OrderItem } from './orderItem';

export interface ProductVariant {
  variantId: number;
  productId: number;
  establishmentId: number;
  variantDescription: string;
  price: Prisma.Decimal;
  sku?: string | null;
  sortOrder?: number | null;
  isActive?: boolean | null;
  createdByUserId?: number | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  deletedAt?: Date | null;

  // Relations
  product?: Product;
  establishment?: Establishment;
  creator?: User | null;
  translations?: ProductVariantTranslation[];
  history?: ProductVariantHistory[];
  // orderItems?: OrderItem[];
}
