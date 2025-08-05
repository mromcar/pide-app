import { OrderItemStatus } from '@prisma/client';

export interface OrderItemCreateDTO {
  variant_id: number;
  quantity: number;
  unit_price: number;
  notes?: string | null;
  status?: OrderItemStatus;
}

export interface OrderItemUpdateDTO {
  quantity?: number;
  unit_price?: number;
  status?: OrderItemStatus;
  notes?: string | null;
}

export interface OrderItemDTO {
  order_item_id: number;
  order_id: number;
  variant_id: number;
  quantity: number;
  unit_price: number;
  item_total_price?: number | null;
  status?: OrderItemStatus | null;
  notes?: string | null;
}
