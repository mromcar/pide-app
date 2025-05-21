// src/types/entities/establishment.ts

import { Category } from './category';
import { Order } from './order';
import { Product } from './product';
import { ProductVariant } from './product';
import { User } from './user';

// Forward declaration for EstablishmentAdministrator to break circular dependency
export interface EstablishmentAdministrator {
  userId: number;
  establishmentId: number;
  user?: User;
  establishment?: Establishment;
}

export interface Establishment {
  establishmentId: number;
  name: string;
  taxId?: string | null;
  address?: string | null;
  postalCode?: string | null;
  city?: string | null;
  phone1?: string | null;
  phone2?: string | null;
  billingBankDetails?: string | null;
  paymentBankDetails?: string | null;
  contactPerson?: string | null;
  description?: string | null;
  website?: string | null;
  isActive?: boolean | null;
  acceptsOrders: boolean;
  categories?: Category[];
  establishmentAdministrators?: EstablishmentAdministrator[];
  orders?: Order[];
  productVariants?: ProductVariant[];
  products?: Product[];
  users?: User[];
}
