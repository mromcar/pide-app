import { OrderStatus } from '@prisma/client'; // Assuming OrderStatus enum is generated by Prisma
// import { Order } from './order'; // Placeholder
// import { User } from './user'; // Placeholder

export interface OrderStatusHistory {
  history_id: number;
  order_id: number;
  status: OrderStatus;
  changed_by_user_id?: number | null;
  changed_at?: Date | null;
  notes?: string | null;
  // order: Order;
  // changed_by_user?: User | null;
}