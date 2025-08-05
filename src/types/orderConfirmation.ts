import { OrderStatus } from '@/types/enums';
import { OrderItemStatus } from '@/types/enums';

export interface OrderItemTranslation {
  translation_id: number;
  order_item_id: number;
  language_code: string;
  name: string;
  description?: string | null;
}

export interface OrderItemVariantTranslation {
  translation_id: number;
  variant_id: number;
  language_code: string;
  variant_description: string; // ✅ Cambiar 'name' por 'variant_description'
  description?: string | null;
}

// ✅ Agregar interfaces para variant y product
export interface ProductWithTranslations {
  product_id: number;
  name: string;
  translations?: {
    language_code: string;
    name: string;
  }[];
}

export interface VariantWithDetails {
  variant_id: number;
  variant_description: string;
  product?: ProductWithTranslations;
  translations?: OrderItemVariantTranslation[];
}

export interface OrderItemWithDetails {
  order_item_id: number;
  order_id: number;
  variant_id: number;
  quantity: number;
  unit_price: number;
  item_total_price?: number | null;
  status?: OrderItemStatus | null;
  notes?: string | null;
  translations?: OrderItemTranslation[];
  variant_translations?: OrderItemVariantTranslation[];
  variant?: VariantWithDetails; // ✅ Agregar propiedad variant
}

export interface OrderWithDetails {
  order_id: number;
  establishment_id: number;
  client_user_id?: number | null;
  waiter_user_id?: number | null;
  table_number?: string | null;
  status: OrderStatus;
  total_amount?: number | null;
  payment_method?: string | null;
  payment_status?: string | null;
  order_type?: string | null;
  notes?: string | null;
  created_at: string; // ✅ Hacer obligatorio para evitar errores de Date
  updated_at?: string | null;
  order_items?: OrderItemWithDetails[];
}
