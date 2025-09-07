import type { UserRole } from '@/constants/enums';
import type { LanguageCode } from '@/constants/languages';

export interface AuthToken {
  sub: string; // userId como string
  role: UserRole | string;
  establishmentId?: number;
  // ...otros campos de tu JWT si los tienes
}

export interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  establishmentId?: number;
  languageCode?: LanguageCode;
  requireEstablishmentMatch?: boolean;
  fallback?: React.ReactNode;
}
