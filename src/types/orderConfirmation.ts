import { OrderStatus } from '@/constants/enums';
import { OrderItemStatus } from '@/constants/enums';

export interface OrderItemTranslation {
  translationId: number;
  orderItemId: number;
  languageCode: string;
  name: string;
  description?: string | null;
}

export interface OrderItemVariantTranslation {
  translationId: number;
  variantId: number;
  languageCode: string;
  variantDescription: string;
  description?: string | null;
}

export interface ProductWithTranslations {
  productId: number;
  name: string;
  translations?: {
    languageCode: string;
    name: string;
  }[];
}

export interface VariantWithDetails {
  variantId: number;
  variantDescription: string;
  product?: ProductWithTranslations;
  translations?: OrderItemVariantTranslation[];
}

export interface OrderItemWithDetails {
  orderItemId: number;
  orderId: number;
  variantId: number;
  quantity: number;
  unitPrice: number;
  itemTotalPrice?: number | null;
  status?: OrderItemStatus | null;
  notes?: string | null;
  translations?: OrderItemTranslation[];
  variantTranslations?: OrderItemVariantTranslation[];
  variant?: VariantWithDetails;
}

export interface OrderWithDetails {
  orderId: number;
  establishmentId: number;
  clientUserId?: number | null;
  waiterUserId?: number | null;
  tableNumber?: string | null;
  status: OrderStatus;
  totalAmount?: number | null;
  paymentMethod?: string | null;
  paymentStatus?: string | null;
  orderType?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt?: string | null;
  orderItems?: OrderItemWithDetails[];
}
