// src/types/entities/user.ts

import { UserRole } from '../enums';
import { Establishment, EstablishmentAdministrator } from './establishment';
import { Order, OrderStatusHistory } from './order';

export interface User {
  userId: number;
  role: UserRole;
  name: string;
  email: string;
  passwordHash: string;
  avatarUrl?: string | null;
  isActive: boolean;
  establishmentId?: number | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  establishment?: Establishment | null;
  establishmentAdministrators?: EstablishmentAdministrator[];
  statusChanges?: OrderStatusHistory[]; // Relation "StatusChanger"
  ordersAsClient?: Order[]; // Relation "ClientOrders"
  ordersAsWaiter?: Order[]; // Relation "WaiterOrders"
}
