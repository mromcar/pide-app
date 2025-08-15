import { UserRole } from '@prisma/client';

export interface AuthToken {
  sub: string; // userId como string
  role: UserRole | string;
  establishmentId?: number;
  // ...otros campos de tu JWT si los tienes
}
