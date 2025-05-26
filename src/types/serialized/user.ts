import { UserRole } from '../enums';

export interface SerializedUser {
  userId: number;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string | null;
  isActive: boolean;
  // establishments?: SerializedEstablishment[]; // Si quieres incluirlos
}
