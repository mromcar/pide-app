import { OrderItemStatus } from '@prisma/client';

export interface OrderItemCreateDTO {
  variant_id: number;
  quantity: number;
  unit_price: number; // Should this be set on creation or fetched from variant?
  notes?: string | null;
  status?: OrderItemStatus; // Defaults to 'pending'
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
  item_total_price?: number | null; // Calculated field
  status?: OrderItemStatus | null;
  notes?: string | null;
}
