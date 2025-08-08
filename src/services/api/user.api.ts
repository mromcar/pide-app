// src/services/api/user.api.ts
import { UserCreateDTO, UserUpdateDTO, UserResponseDTO } from '@/types/dtos/user';
import { UserApiError } from '@/types/errors/user.api.error';
import { handleApiError } from '@/utils/apiUtils';
import camelcaseKeys from 'camelcase-keys';

const USER_API_BASE_URL = '/api/users';

/**
 * Fetches a user by their ID.
 */
export async function getUserById(userId: number): Promise<UserResponseDTO> {
  try {
    const response = await fetch(`${USER_API_BASE_URL}/${userId}`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to fetch user' }));
      throw new UserApiError(errorData.message || `Failed to fetch user with ID ${userId}`, response.status, errorData.details);
    }
    const data = await response.json();
    return camelcaseKeys(data, { deep: true }) as UserResponseDTO;
  } catch (error) {
    return handleApiError(error, UserApiError, 'An unexpected error occurred while fetching the user.');
  }
}

/**
 * Fetches all users, with optional pagination.
 */
export async function getAllUsers(page: number = 1, pageSize: number = 10): Promise<UserResponseDTO[]> {
  try {
    const response = await fetch(`${USER_API_BASE_URL}?page=${page}&pageSize=${pageSize}`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to fetch users' }));
      throw new UserApiError(errorData.message || 'Failed to fetch users', response.status, errorData.details);
    }
    const data = await response.json();
    return camelcaseKeys(data, { deep: true }) as UserResponseDTO[];
  } catch (error) {
    return handleApiError(error, UserApiError, 'An unexpected error occurred while fetching users.');
  }
}

/**
 * Creates a new user (e.g., by an administrator).
 */
export async function createUser(userData: UserCreateDTO): Promise<UserResponseDTO> {
  try {
    const response = await fetch(USER_API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to create user' }));
      throw new UserApiError(errorData.message || 'Failed to create user', response.status, errorData.details);
    }
    const data = await response.json();
    return camelcaseKeys(data, { deep: true }) as UserResponseDTO;
  } catch (error) {
    return handleApiError(error, UserApiError, 'An unexpected error occurred while creating the user.');
  }
}

/**
 * Updates an existing user's information.
 */
export async function updateUser(userId: number, userData: UserUpdateDTO): Promise<UserResponseDTO> {
  try {
    const response = await fetch(`${USER_API_BASE_URL}/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to update user' }));
      throw new UserApiError(errorData.message || `Failed to update user with ID ${userId}`, response.status, errorData.details);
    }
    const data = await response.json();
    return camelcaseKeys(data, { deep: true }) as UserResponseDTO;
  } catch (error) {
    return handleApiError(error, UserApiError, 'An unexpected error occurred while updating the user.');
  }
}

/**
 * Deletes a user (e.g., by an administrator).
 */
export async function deleteUser(userId: number): Promise<void> {
  try {
    const response = await fetch(`${USER_API_BASE_URL}/${userId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to delete user' }));
      throw new UserApiError(errorData.message || `Failed to delete user with ID ${userId}`, response.status, errorData.details);
    }
    // Si esperas el usuario eliminado, puedes devolverlo en camelCase aquí
    // const data = await response.json();
    // return camelcaseKeys(data, { deep: true }) as UserResponseDTO;
  } catch (error) {
    return handleApiError(error, UserApiError, 'An unexpected error occurred while deleting the user.');
  }
}

// Potentially add other user-related API functions here, for example:
// - assignRoleToUser(userId: number, role: UserRole)
// - removeRoleFromUser(userId: number, role: UserRole)
// - assignUserToEstablishment(userId: number, establishmentId: number)
// etc.
