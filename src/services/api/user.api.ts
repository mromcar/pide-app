// src/services/api/user.api.ts
import { UserCreateDTO, UserUpdateDTO, UserResponseDTO } from '@/types/dtos/user';
import { UserApiError } from '@/types/errors/user.api.error';
import { handleApiError } from '@/utils/apiUtils'; // Suponiendo que tienes un manejador de errores genérico

const USER_API_BASE_URL = '/api/users'; // Base URL for user-related API routes

/**
 * Fetches a user by their ID.
 * @param userId The ID of the user to fetch.
 * @returns A promise that resolves to the user data.
 * @throws UserApiError if the request fails.
 */
export async function getUserById(userId: number): Promise<UserResponseDTO> {
  try {
    const response = await fetch(`${USER_API_BASE_URL}/${userId}`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to fetch user' }));
      throw new UserApiError(errorData.message || `Failed to fetch user with ID ${userId}`, response.status, errorData.details);
    }
    return await response.json() as UserResponseDTO;
  } catch (error) {
    return handleApiError(error, UserApiError, 'An unexpected error occurred while fetching the user.');
  }
}

/**
 * Fetches all users, with optional pagination.
 * @param page The page number to fetch.
 * @param pageSize The number of users per page.
 * @returns A promise that resolves to an array of user data.
 * @throws UserApiError if the request fails.
 */
export async function getAllUsers(page: number = 1, pageSize: number = 10): Promise<UserResponseDTO[]> {
  try {
    const response = await fetch(`${USER_API_BASE_URL}?page=${page}&pageSize=${pageSize}`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to fetch users' }));
      throw new UserApiError(errorData.message || 'Failed to fetch users', response.status, errorData.details);
    }
    return await response.json() as UserResponseDTO[];
  } catch (error) {
    return handleApiError(error, UserApiError, 'An unexpected error occurred while fetching users.');
  }
}

/**
 * Creates a new user (e.g., by an administrator).
 * @param userData The data for the new user.
 * @returns A promise that resolves to the created user data.
 * @throws UserApiError if the request fails.
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
    return await response.json() as UserResponseDTO;
  } catch (error) {
    return handleApiError(error, UserApiError, 'An unexpected error occurred while creating the user.');
  }
}

/**
 * Updates an existing user's information.
 * @param userId The ID of the user to update.
 * @param userData The data to update for the user.
 * @returns A promise that resolves to the updated user data.
 * @throws UserApiError if the request fails.
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
    return await response.json() as UserResponseDTO;
  } catch (error) {
    return handleApiError(error, UserApiError, 'An unexpected error occurred while updating the user.');
  }
}

/**
 * Deletes a user (e.g., by an administrator).
 * @param userId The ID of the user to delete.
 * @returns A promise that resolves when the user is deleted.
 * @throws UserApiError if the request fails.
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
    // No content expected on successful DELETE, or you might get back the deleted user
    // If you expect the deleted user object back:
    // return await response.json() as UserResponseDTO;
  } catch (error) {
    return handleApiError(error, UserApiError, 'An unexpected error occurred while deleting the user.');
  }
}

// Potentially add other user-related API functions here, for example:
// - assignRoleToUser(userId: number, role: UserRole)
// - removeRoleFromUser(userId: number, role: UserRole)
// - assignUserToEstablishment(userId: number, establishmentId: number)
// etc.