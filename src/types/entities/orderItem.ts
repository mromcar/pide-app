import { OrderItemStatus } from '@prisma/client';

export interface OrderItem {
  orderItemId: number;
  orderId: number;
  variantId: number;
  quantity: number;
  unitPrice: number; // Prisma Decimal
  itemTotalPrice?: number | null; // Prisma Decimal, GENERATED ALWAYS AS in SQL
  status?: OrderItemStatus | null;
  notes?: string | null;
  // order: Order;
  // variant: ProductVariant;
}
