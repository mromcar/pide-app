import { UserRole } from '@prisma/client';
import { EstablishmentResponseDTO } from './establishment'; // Assuming this exists

// For creating a new user
export interface UserCreateDTO {
  role: UserRole;
  name?: string | null;
  email: string;
  password: string; // Plain password, will be hashed in the service/backend
  establishment_id?: number | null;
}

// For updating an existing user
export interface UserUpdateDTO {
  role?: UserRole;
  name?: string | null;
  email?: string;
  password?: string; // For password changes
  establishment_id?: number | null;
  is_active?: boolean; // Assuming you might add an is_active field to User model
}

// For responses, omitting sensitive data like password_hash
export interface UserResponseDTO {
  user_id: number;
  role: UserRole;
  name?: string | null;
  email: string;
  establishment_id?: number | null;
  created_at?: string | null; // Dates as ISO strings
  updated_at?: string | null;
  establishment?: EstablishmentResponseDTO | null; // Example of including related data
  // Add other relations as needed for specific use cases
}

// UserLoginDTO and UserLoginResponseDTO can be removed if NextAuth handles the entire login flow
// and you don't use these types elsewhere.
/*
export interface UserLoginDTO {
  email: string;
  password: string;
}

export interface UserLoginResponseDTO {
  token: string;
  user: UserResponseDTO;
}
*/
