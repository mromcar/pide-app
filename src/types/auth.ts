import { UserRole } from '@prisma/client';

export interface AuthToken {
  sub: string; // userId como string
  role: UserRole | string;
  establishment_id?: number;
  // ...otros campos de tu JWT si los tienes
}
