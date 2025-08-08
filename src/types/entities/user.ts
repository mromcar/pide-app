import { UserRole } from '@prisma/client';
import { Establishment } from './establishment';
import { EstablishmentAdministrator } from './establishmentAdministrator';
import { Order } from './order';
import { OrderStatusHistory } from './orderStatusHistory';
import { Product } from './product';
import { ProductVariant } from './productVariant';

export interface User {
  userId: number;
  role: UserRole;
  name?: string | null;
  email: string;
  passwordHash: string;
  establishmentId?: number | null;
  active: boolean;
  createdAt?: Date | null;
  updatedAt?: Date | null;

  // Relations
  establishment?: Establishment | null;
  establishmentAdministrators?: EstablishmentAdministrator[];
  createdProducts?: Product[];
  productVariantsCreated?: ProductVariant[];
  ordersClient?: Order[];
  ordersWaiter?: Order[];
  orderStatusHistory?: OrderStatusHistory[];
}
