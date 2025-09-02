/*
Las funciones de next-auth/react ( signIn , signOut , getSession ) tienen su propio manejo interno y no siempre devuelven un objeto Response estándar que handleApiResponse esperaría. Por lo tanto, handleApiResponse es más útil para tus propias llamadas fetch a tus endpoints de API backend. El refactor de auth.api.ts se centra más en unificar los tipos de error con ApiError y NetworkError de apiUtils.ts .
*/
import { signIn, signOut, getSession } from 'next-auth/react';
import type { SignInResponse, SignInOptions, SignOutParams } from 'next-auth/react';
import type { Session } from 'next-auth';
import type { UserLoginDTO } from '@/types/dtos/user';
import { ApiError, NetworkError, UnexpectedResponseError } from '@/utils/apiUtils';
import logger from '@/lib/logger';

/**
 * Error for authentication-specific issues.
 */
export class AuthError extends ApiError {
  constructor(message: string, status: number, public code?: string, errors?: Record<string, unknown>) {
    super(message, status, errors)
    this.name = 'AuthError'
    this.code = code
  }
}

/**
 * Initiates user login using NextAuth.
 */
async function login(credentials: UserLoginDTO, options?: SignInOptions): Promise<SignInResponse> {
  try {
    console.log('🔍 AuthAPI: Attempting login for user:', credentials.email)

    const response = await signIn('credentials', {
      ...credentials,
      redirect: options?.redirect ?? false,
      ...options,
    });

    if (!response) {
      console.error('❌ AuthAPI: No response from authentication service')
      throw new UnexpectedResponseError('No response from authentication service');
    }

    if (response.error) {
      console.error('❌ AuthAPI: Authentication error:', response.error)

      if (response.error === 'CredentialsSignin') {
        throw new AuthError('Invalid credentials', response.status || 401, response.error);
      }
      throw new AuthError(`Authentication error: ${response.error}`, response.status || 400, response.error);
    }

    console.log('✅ AuthAPI: Login successful')
    return response;

  } catch (error) {
    if (error instanceof AuthError || error instanceof NetworkError || error instanceof UnexpectedResponseError) {
      throw error;
    }
    if (error instanceof TypeError && error.message.toLowerCase().includes('failed to fetch')) {
      console.error('❌ AuthAPI: Network error during login')
      throw new NetworkError('Unable to connect to server');
    }

    console.error('❌ AuthAPI: Unexpected error during login:', error)
    logger.error('Unexpected error during login:', error);
    throw new UnexpectedResponseError('Unexpected error during login');
  }
}

/**
 * Logs out the current user.
 */
async function logout(options?: SignOutParams<true>): Promise<void> {
  try {
    console.log('🔍 AuthAPI: Logging out user')

    await signOut({ redirect: false, ...options });

    console.log('✅ AuthAPI: Logout successful')
  } catch (error) {
    if (error instanceof TypeError && error.message.toLowerCase().includes('failed to fetch')) {
      console.error('❌ AuthAPI: Network error during logout')
      throw new NetworkError('Network error during logout');
    }

    console.error('❌ AuthAPI: Unexpected error during logout:', error)
    logger.error('Unexpected error during logout:', error);
    throw new UnexpectedResponseError('Unexpected error during logout');
  }
}

/**
 * Gets the current user session.
 */
async function getCurrentSession(): Promise<Session | null> {
  try {
    console.log('🔍 AuthAPI: Getting current session')

    const session = await getSession();

    if (session) {
      console.log('✅ AuthAPI: Session found for user:', session.user?.email)
    } else {
      console.log('ℹ️ AuthAPI: No active session')
    }

    return session;
  } catch (error) {
    console.error('❌ AuthAPI: Error getting session:', error)
    logger.error('Error getting session:', error);
    throw new UnexpectedResponseError('Error getting current session');
  }
}

export const authApiService = {
  login,
  logout,
  getCurrentSession,
  AuthError,
};

export { login, logout, getCurrentSession };

