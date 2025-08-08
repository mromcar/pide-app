import { UserRole } from '@prisma/client';
import { EstablishmentResponseDTO } from './establishment';

// For creating a new user
export interface UserCreateDTO {
  role: UserRole;
  name?: string | null;
  email: string;
  password: string; // Plain password, will be hashed in the service/backend
  establishmentId?: number | null;
}

// For updating an existing user
export interface UserUpdateDTO {
  role?: UserRole;
  name?: string | null;
  email?: string;
  password?: string; // For password changes
  establishmentId?: number | null;
  isActive?: boolean; // Assuming you might add an isActive field to User model
}

// For responses, omitting sensitive data like password_hash
export interface UserResponseDTO {
  userId: number;
  role: UserRole;
  name?: string | null;
  email: string;
  establishmentId?: number | null;
  createdAt?: string | null; // Dates as ISO strings
  updatedAt?: string | null;
  establishment?: EstablishmentResponseDTO | null;
}

// UserLoginDTO and UserLoginResponseDTO can be removed if NextAuth handles the entire login flow
// and you don't use these types elsewhere.
export interface UserLoginDTO {
  email: string;
  password: string;
}

export interface UserLoginResponseDTO {
  token: string;
  user: UserResponseDTO;
}
