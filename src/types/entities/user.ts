import { UserRole } from '@prisma/client';
import { Establishment } from './establishment';
import { EstablishmentAdministrator } from './establishmentAdministrator';
import { Order } from './order';
import { OrderStatusHistory } from './orderStatusHistory';
import { Product } from './product';
import { ProductVariant } from './productVariant';

export interface User {
  user_id: number;
  role: UserRole;
  name?: string | null;
  email: string;
  password_hash: string; // This should not be exposed in DTOs directly
  establishment_id?: number | null;
  created_at?: Date | null;
  updated_at?: Date | null;

  // Relations
  establishment?: Establishment | null;
  establishment_administrators?: EstablishmentAdministrator[];
  created_products?: Product[];
  product_variants_created?: ProductVariant[];
  orders_client?: Order[];
  orders_waiter?: Order[];
  order_status_history?: OrderStatusHistory[];
}
