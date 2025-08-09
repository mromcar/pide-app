import { OrderItemStatus } from '@prisma/client';
import type { Product } from './product';

export interface OrderItem {
  orderItemId: number;
  orderId: number;
  variantId: number;
  quantity: number;
  unitPrice: number;
  itemTotalPrice?: number | null;
  status?: OrderItemStatus | null;
  notes?: string | null;
  product?: Product;
}
