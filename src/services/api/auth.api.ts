import { signIn, signOut, getSession } from 'next-auth/react';
import type { SignInResponse, SignInOptions, SignOutParams } from 'next-auth/react';
import type { Session } from 'next-auth'; // Assuming Session type is correctly defined in next-auth.d.ts
import type { UserLoginDTO } from '@/types/dtos/user';

// Custom Error Classes
export class AuthError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class UnexpectedError extends Error {
  constructor(message: string, public originalError?: unknown) { // Changed 'any' to 'unknown'
    super(message);
    this.name = 'UnexpectedError';
  }
}

/**
 * Initiates the sign-in process using NextAuth.
 * 
 * @param credentials - The user's login credentials (e.g., email and password).
 * @param options - Optional NextAuth SignInOptions, e.g., redirect: false to handle errors manually.
 * @returns A promise that resolves to SignInResponse or undefined if an error occurs.
 * @throws {AuthError} If authentication fails (e.g., invalid credentials).
 * @throws {NetworkError} If there's a network issue.
 * @throws {UnexpectedError} For any other unexpected errors.
 */
async function login(credentials: UserLoginDTO, options?: SignInOptions): Promise<SignInResponse> {
  try {
    const response = await signIn('credentials', {
      ...credentials,
      redirect: options?.redirect ?? false,
      ...options,
    });

    if (response && response.error) {
      // Specific error handling for NextAuth's SignInResponse errors
      if (response.error === 'CredentialsSignin') {
        throw new AuthError('Credenciales inválidas. Por favor, verifica tu email y contraseña.', response.error);
      } else {
        throw new AuthError(`Error de autenticación: ${response.error}`, response.error);
      }
    }
    // If no error and no redirect, it means sign-in was successful
    return response as SignInResponse; // Cast to SignInResponse as it's successful
  } catch (error) {
    if (error instanceof AuthError) {
      throw error; // Re-throw custom AuthError
    } else if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new NetworkError('No se pudo conectar con el servidor. Por favor, verifica tu conexión a internet.');
    } else {
      console.error('An unexpected error occurred during login:', error);
      throw new UnexpectedError('Ocurrió un error inesperado durante el inicio de sesión.', error);
    }
  }
}

/**
 * Signs out the current user using NextAuth.
 * 
 * @param options - Optional NextAuth SignOutParams, e.g., callbackUrl to redirect after sign out.
 * @returns A promise that resolves when the sign-out process is initiated.
 * @throws {NetworkError} If there's a network issue.
 * @throws {UnexpectedError} For any other unexpected errors.
 */
async function logout(options?: SignOutParams<true>): Promise<void> {
  try {
    await signOut(options);
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new NetworkError('No se pudo conectar con el servidor para cerrar sesión.');
    } else {
      console.error('An unexpected error occurred during logout:', error);
      throw new UnexpectedError('Ocurrió un error inesperado durante el cierre de sesión.', error);
    }
  }
}

/**
 * Retrieves the current user's session.
 * 
 * @returns A promise that resolves to the Session object or null if not authenticated.
 * @throws {NetworkError} If there's a network issue.
 * @throws {UnexpectedError} For any other unexpected errors.
 */
async function getCurrentUserSession(): Promise<Session | null> {
  try {
    const session = await getSession();
    return session;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new NetworkError('No se pudo conectar con el servidor para obtener la sesión.');
    } else {
      console.error('An unexpected error occurred while fetching the session:', error);
      throw new UnexpectedError('Ocurrió un error inesperado al obtener la sesión.', error);
    }
  }
}

export const authApiService = {
  login,
  logout,
  getCurrentUserSession,
  AuthError,
  NetworkError,
  UnexpectedError,
};

// Example Usage (in a React component or another service):
/*
import { authApiService } from './auth.api.ts';

const handleLogin = async () => {
  const response = await authApiService.login({ email: 'user@example.com', password: 'password' });
  if (response && !response.error) {
    console.log('Login successful, session:', await authApiService.getCurrentUserSession());
    // Redirect or update UI
  } else {
    // Handle login error
    console.error('Login failed:', response?.error);
  }
};

const handleLogout = async () => {
  await authApiService.logout({ callbackUrl: '/login' });
  console.log('Logged out');
};

const checkSession = async () => {
  const session = await authApiService.getCurrentUserSession();
  if (session) {
    console.log('User is authenticated:', session.user);
  } else {
    console.log('User is not authenticated.');
  }
};
*/