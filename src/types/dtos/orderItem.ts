import { OrderItemStatus } from '@prisma/client';
import type { Product } from '../entities/product'

export interface OrderItemCreateDTO {
  variantId: number;
  quantity: number;
  unitPrice: number;
  notes?: string | null;
  status?: OrderItemStatus;
}

export interface OrderItemUpdateDTO {
  quantity?: number;
  unitPrice?: number;
  status?: OrderItemStatus;
  notes?: string | null;
}

export interface OrderItemDTO {
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
