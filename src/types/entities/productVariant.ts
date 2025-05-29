import { Prisma } from '@prisma/client';
import { Establishment } from './establishment';
import { Product } from './product';
import { ProductVariantHistory } from './productVariantHistory';
import { ProductVariantTranslation } from './productVariantTranslation';
import { User } from './user';
// import { OrderItem } from './orderItem'; // If needed, though often OrderItem refers to ProductVariant

export interface ProductVariant {
  variant_id: number;
  product_id: number;
  establishment_id: number;
  variant_description: string;
  price: Prisma.Decimal; // Use Prisma.Decimal for entity type
  sku?: string | null;
  sort_order?: number | null;
  is_active?: boolean | null;
  created_by_user_id?: number | null;
  created_at?: Date | null;
  updated_at?: Date | null;
  deleted_at?: Date | null;

  // Relations
  product?: Product;
  establishment?: Establishment;
  creator?: User | null;
  translations?: ProductVariantTranslation[];
  history?: ProductVariantHistory[];
  // order_items?: OrderItem[];
}