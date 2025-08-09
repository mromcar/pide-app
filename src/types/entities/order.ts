import { OrderStatus } from '@prisma/client';
// import { Establishment } from './establishment';
// import { User } from './user';
import { OrderItem } from './orderItem';
// import { OrderStatusHistory } from './orderStatusHistory';

export interface Order {
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
  items?: OrderItem[];
}
