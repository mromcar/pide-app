// src/services/api/user.api.ts
import { UserCreateDTO, UserUpdateDTO, UserResponseDTO } from '@/types/dtos/user';
import { UserRole } from '@prisma/client';
import { handleApiResponse, handleCaughtError, ApiError } from '@/utils/apiUtils';
import { UserApiError } from '@/types/errors/user.api.error';
import { getClientApiUrl, debugApiClient } from '@/lib/api-client';

const API_SUPER_ADMIN_PATH = '/api/super-admin/users';

// Tipos auxiliares para paginación/estadísticas/filtros
type UsersPagination = { page: number; pageSize: number; total: number; totalPages: number }
type UsersStats = { totalUsersInSystem: number }
type UsersFilters = {
  role: UserRole | null
  search: string | null
  establishmentId: number | null
}

/**
 * Fetches a user by their ID (super admin only).
 */
async function getUserById(userId: number): Promise<UserResponseDTO | null> {
  try {
    console.log('🔍 UserAPI: Fetching user by ID:', userId)

    if (process.env.NODE_ENV === 'development') {
      debugApiClient()
    }

    const apiUrl = getClientApiUrl(`${API_SUPER_ADMIN_PATH}/${userId}`);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (response.status === 404) {
      console.log('⚠️ UserAPI: User not found:', userId)
      return null;
    }

    const data = await handleApiResponse<{ user: UserResponseDTO; additionalInfo?: Record<string, unknown>; message?: string }>(response);

    console.log('✅ UserAPI: User loaded:', {
      userId: data.user.userId,
      name: data.user.name,
      email: data.user.email,
      role: data.user.role
    })
    return data.user;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    console.error('❌ UserAPI: Error fetching user:', error)
    throw handleCaughtError(error, UserApiError, 'Failed to fetch user');
  }
}

/**
 * Fetches all users with optional filters and pagination (super admin only).
 */
async function getAllUsers(
  page: number = 1,
  pageSize: number = 10,
  role?: UserRole,
  search?: string,
  establishmentId?: number
): Promise<{
  users: UserResponseDTO[];
  pagination: UsersPagination;
  stats: UsersStats;
  filters: UsersFilters;
}> {
  try {
    console.log('🔍 UserAPI: Fetching all users with filters:', {
      page,
      pageSize,
      role,
      search,
      establishmentId
    })

    const queryParams = new URLSearchParams();
    queryParams.append('page', page.toString());
    queryParams.append('pageSize', pageSize.toString());
    if (role) queryParams.append('role', role);
    if (search) queryParams.append('search', search);
    if (establishmentId) queryParams.append('establishmentId', establishmentId.toString());

    const apiUrl = getClientApiUrl(`${API_SUPER_ADMIN_PATH}?${queryParams.toString()}`);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    const data = await handleApiResponse<{
      users: UserResponseDTO[];
      pagination: UsersPagination;
      stats: UsersStats;
      filters: UsersFilters;
      message: string;
    }>(response);

    console.log('✅ UserAPI: Users loaded:', {
      usersCount: data.users.length,
      totalInSystem: data.stats.totalUsersInSystem,
      page: data.pagination.page,
      filters: data.filters
    })
    return data;
  } catch (error) {
    console.error('❌ UserAPI: Error fetching users:', error)
    throw handleCaughtError(error, UserApiError, 'Failed to fetch users');
  }
}

/**
 * Creates a new user (super admin only).
 */
async function createUser(userData: UserCreateDTO): Promise<UserResponseDTO> {
  try {
    console.log('🔍 UserAPI: Creating new user:', {
      email: userData.email,
      name: userData.name,
      role: userData.role,
      establishmentId: userData.establishmentId
    })

    const apiUrl = getClientApiUrl(API_SUPER_ADMIN_PATH);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(userData),
    });

    const data = await handleApiResponse<{ user: UserResponseDTO; message: string }>(response);

    console.log('✅ UserAPI: User created successfully:', {
      userId: data.user.userId,
      email: data.user.email,
      role: data.user.role
    })
    return data.user;
  } catch (error) {
    console.error('❌ UserAPI: Error creating user:', error)
    throw handleCaughtError(error, UserApiError, 'Failed to create user');
  }
}

/**
 * Updates an existing user's information (super admin only).
 */
async function updateUser(userId: number, userData: UserUpdateDTO): Promise<UserResponseDTO> {
  try {
    console.log('🔍 UserAPI: Updating user:', userId, {
      email: userData.email,
      name: userData.name,
      role: userData.role,
      establishmentId: userData.establishmentId
    })

    const apiUrl = getClientApiUrl(`${API_SUPER_ADMIN_PATH}/${userId}`);

    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(userData),
    });

    const data = await handleApiResponse<{ user: UserResponseDTO; message: string }>(response);

    console.log('✅ UserAPI: User updated successfully:', {
      userId: data.user.userId,
      email: data.user.email,
      role: data.user.role
    })
    return data.user;
  } catch (error) {
    console.error('❌ UserAPI: Error updating user:', error)
    throw handleCaughtError(error, UserApiError, 'Failed to update user');
  }
}

/**
 * Deletes a user (super admin only).
 */
async function deleteUser(userId: number): Promise<UserResponseDTO> {
  try {
    console.log('🔍 UserAPI: Deleting user:', userId)

    const apiUrl = getClientApiUrl(`${API_SUPER_ADMIN_PATH}/${userId}`);

    const response = await fetch(apiUrl, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    const data = await handleApiResponse<{ message: string; deletedUser: UserResponseDTO }>(response);

    console.log('✅ UserAPI: User deleted successfully:', {
      userId: data.deletedUser.userId,
      email: data.deletedUser.email
    })
    return data.deletedUser;
  } catch (error) {
    console.error('❌ UserAPI: Error deleting user:', error)
    throw handleCaughtError(error, UserApiError, 'Failed to delete user');
  }
}

/**
 * Searches users by name or email (super admin only).
 */
async function searchUsers(searchTerm: string, limit: number = 10): Promise<UserResponseDTO[]> {
  try {
    console.log('🔍 UserAPI: Searching users:', { searchTerm, limit })

    const queryParams = new URLSearchParams();
    queryParams.append('search', searchTerm);
    queryParams.append('pageSize', limit.toString());

    const apiUrl = getClientApiUrl(`${API_SUPER_ADMIN_PATH}?${queryParams.toString()}`);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    const data = await handleApiResponse<{
      users: UserResponseDTO[];
      pagination: UsersPagination;
      stats: UsersStats;
      filters: UsersFilters;
      message: string;
    }>(response);

    console.log('✅ UserAPI: User search completed:', {
      searchTerm,
      resultsCount: data.users.length
    })
    return data.users;
  } catch (error) {
    console.error('❌ UserAPI: Error searching users:', error)
    throw handleCaughtError(error, UserApiError, 'Failed to search users');
  }
}

/**
 * Fetches users by role (super admin only).
 */
async function getUsersByRole(role: UserRole): Promise<UserResponseDTO[]> {
  try {
    console.log('🔍 UserAPI: Fetching users by role:', role)

    const queryParams = new URLSearchParams();
    queryParams.append('role', role);
    queryParams.append('pageSize', '100'); // Get more results for role filtering

    const apiUrl = getClientApiUrl(`${API_SUPER_ADMIN_PATH}?${queryParams.toString()}`);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    const data = await handleApiResponse<{
      users: UserResponseDTO[];
      pagination: UsersPagination;
      stats: UsersStats;
      filters: UsersFilters;
      message: string;
    }>(response);

    console.log('✅ UserAPI: Users by role loaded:', {
      role,
      usersCount: data.users.length
    })
    return data.users;
  } catch (error) {
    console.error('❌ UserAPI: Error fetching users by role:', error)
    throw handleCaughtError(error, UserApiError, 'Failed to fetch users by role');
  }
}

/**
 * Fetches users by establishment (super admin only).
 */
async function getUsersByEstablishment(establishmentId: number): Promise<UserResponseDTO[]> {
  try {
    console.log('🔍 UserAPI: Fetching users by establishment:', establishmentId)

    const queryParams = new URLSearchParams();
    queryParams.append('establishmentId', establishmentId.toString());
    queryParams.append('pageSize', '100'); // Get more results for establishment filtering

    const apiUrl = getClientApiUrl(`${API_SUPER_ADMIN_PATH}?${queryParams.toString()}`);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    const data = await handleApiResponse<{
      users: UserResponseDTO[];
      pagination: UsersPagination;
      stats: UsersStats;
      filters: UsersFilters;
      message: string;
    }>(response);

    console.log('✅ UserAPI: Users by establishment loaded:', {
      establishmentId,
      usersCount: data.users.length
    })
    return data.users;
  } catch (error) {
    console.error('❌ UserAPI: Error fetching users by establishment:', error)
    throw handleCaughtError(error, UserApiError, 'Failed to fetch users by establishment');
  }
}

export const userApiService = {
  getUserById,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  searchUsers,
  getUsersByRole,
  getUsersByEstablishment,
};

export {
  getUserById,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  searchUsers,
  getUsersByRole,
  getUsersByEstablishment,
};
