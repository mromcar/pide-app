
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
 * Error personalizado para manejar errores específicos de autenticación.
 * Extiende ApiError para mantener consistencia con el sistema de errores de la aplicación.
 */
export class AuthError extends ApiError {
  constructor(message: string, status: number, public code?: string, errors?: Record<string, unknown>) {
    super(message, status, errors)
    this.name = 'AuthError'
    this.code = code
  }
}

/**
 * Inicia el proceso de inicio de sesión utilizando NextAuth.
 *
 * @param credentials - Credenciales del usuario (email y contraseña).
 * @param options - Opciones de NextAuth SignInOptions, ej: redirect: false para manejar errores manualmente.
 * @returns Promise que resuelve a SignInResponse.
 * @throws {AuthError} Si la autenticación falla (ej: credenciales inválidas).
 * @throws {NetworkError} Si hay un problema de red.
 * @throws {UnexpectedResponseError} Para cualquier otro error inesperado.
 */
async function login(credentials: UserLoginDTO, options?: SignInOptions): Promise<SignInResponse> {
  try {
    const response = await signIn('credentials', {
      ...credentials,
      redirect: options?.redirect ?? false,
      ...options,
    });

    if (!response) {
      throw new UnexpectedResponseError('Respuesta inesperada del servicio de autenticación.');
    }

    if (response.error) {
      if (response.error === 'CredentialsSignin') {
        throw new AuthError('Credenciales inválidas.', response.status || 401, response.error);
      }
      throw new AuthError(`Error de autenticación: ${response.error}`, response.status || 400, response.error);
    }

    return response;

  } catch (error) {
    if (error instanceof AuthError || error instanceof NetworkError || error instanceof UnexpectedResponseError) {
      throw error;
    }
    if (error instanceof TypeError && error.message.toLowerCase().includes('failed to fetch')) {
      throw new NetworkError('No se pudo conectar con el servidor.');
    }
    logger.error('Error inesperado durante el login:', error);
    throw new UnexpectedResponseError('Ocurrió un error inesperado durante el inicio de sesión.');
  }
}

/**
 * Cierra la sesión del usuario actual.
 *
 * @param options - Opciones de cierre de sesión de NextAuth.
 * @throws {NetworkError} Si hay un problema de red.
 * @throws {UnexpectedResponseError} Para cualquier otro error inesperado.
 */
export async function logout(options?: SignOutParams<true>): Promise<void> {
  try {
    await signOut({ redirect: false, ...options });
  } catch (error) {
    if (error instanceof TypeError && error.message.toLowerCase().includes('failed to fetch')) {
      throw new NetworkError('Error de red durante el cierre de sesión.');
    }
    logger.error('Error inesperado durante el logout:', error);
    throw new UnexpectedResponseError('Error inesperado durante el cierre de sesión.');
  }
}

/**
 * Obtiene la sesión actual del usuario.
 *
 * @returns Promise que resuelve a la sesión actual o null si no hay sesión.
 * @throws {UnexpectedResponseError} Si ocurre un error al obtener la sesión.
 */
export async function getCurrentSession(): Promise<Session | null> {
  try {
    return await getSession();
  } catch (error) {
    logger.error('Error inesperado obteniendo la sesión:', error);
    throw new UnexpectedResponseError('Error inesperado al obtener la sesión actual.');
  }
}

export const authApiService = {
  login,
  logout,
  getCurrentSession,
  AuthError,
};

