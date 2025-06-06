
/*
Las funciones de next-auth/react ( signIn , signOut , getSession ) tienen su propio manejo interno y no siempre devuelven un objeto Response estándar que handleApiResponse esperaría. Por lo tanto, handleApiResponse es más útil para tus propias llamadas fetch a tus endpoints de API backend. El refactor de auth.api.ts se centra más en unificar los tipos de error con ApiError y NetworkError de apiUtils.ts .
*/
import { signIn, signOut, getSession } from 'next-auth/react';
import type { SignInResponse, SignInOptions, SignOutParams } from 'next-auth/react';
import type { Session } from 'next-auth'; // Assuming Session type is correctly defined in next-auth.d.ts
import type { UserLoginDTO } from '@/types/dtos/user';
import { ApiError, NetworkError, UnexpectedResponseError, handleApiResponse } from '@/utils/apiUtils'; // NUEVA IMPORTACIÓN

// Custom Error Classes - Ahora pueden extender ApiError o ser reemplazadas si es conveniente
// Por simplicidad, podemos usar ApiError directamente o mantener AuthError si tiene lógica específica.
// Aquí mantendremos AuthError para demostrar cómo podría extenderse, pero podría simplificarse.
export class AuthError extends ApiError { // EXTENDER ApiError
  constructor(message: string, status: number, public code?: string, errors?: any) {
    super(message, status, errors);
    this.name = 'AuthError';
    this.code = code;
  }
}

// NetworkError y UnexpectedError ya están en apiUtils.ts, así que podemos eliminarlas de aquí si no tienen lógica extra específica de auth.
// Para este ejemplo, las quitaremos y usaremos las de apiUtils.
// export class NetworkError extends Error { ... }
// export class UnexpectedError extends Error { ... }

/**
 * Initiates the sign-in process using NextAuth.
 *
 * @param credentials - The user's login credentials (e.g., email and password).
 * @param options - Optional NextAuth SignInOptions, e.g., redirect: false to handle errors manually.
 * @returns A promise that resolves to SignInResponse or undefined if an error occurs.
 * @throws {AuthError} If authentication fails (e.g., invalid credentials).
 * @throws {NetworkError} If there's a network issue.
 * @throws {UnexpectedResponseError} For any other unexpected errors.
 */
async function login(credentials: UserLoginDTO, options?: SignInOptions): Promise<SignInResponse> {
  try {
    // signIn de NextAuth no usa fetch directamente de la misma manera, su manejo de errores es particular.
    // handleApiResponse es más para llamadas fetch directas que haces tú.
    // Por lo tanto, el manejo de errores para `signIn` se mantiene más o menos igual.
    const response = await signIn('credentials', {
      ...credentials,
      redirect: options?.redirect ?? false,
      ...options,
    });

    if (response && response.error) {
      if (response.error === 'CredentialsSignin') {
        throw new AuthError('Credenciales inválidas. Por favor, verifica tu email y contraseña.', response.status || 401, response.error);
      } else {
        // Usar response.status si está disponible, o un genérico 400/500
        throw new AuthError(`Error de autenticación: ${response.error}`, response.status || 400, response.error);
      }
    }
    if (!response) {
        // Esto puede ocurrir si signIn es interrumpido o hay un problema no capturado por response.error
        throw new UnexpectedResponseError('Respuesta inesperada del servicio de autenticación.');
    }
    return response as SignInResponse;
  } catch (error) {
    if (error instanceof ApiError) { // Captura AuthError y otros que extiendan ApiError
      throw error;
    } else if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new NetworkError('No se pudo conectar con el servidor. Por favor, verifica tu conexión a internet.');
    } else {
      console.error('An unexpected error occurred during login:', error);
      throw new UnexpectedResponseError('Ocurrió un error inesperado durante el inicio de sesión.');
    }
  }
}

/**
 * Signs out the current user using NextAuth.
 *
 * @param options - Optional NextAuth SignOutParams, e.g., callbackUrl to redirect after sign out.
 * @returns A promise that resolves when the sign-out process is initiated.
 * @throws {NetworkError} If there's a network issue.
 * @throws {UnexpectedResponseError} For any other unexpected errors.
 */
async function logout(options?: SignOutParams<true>): Promise<void> {
  try {
    await signOut(options);
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new NetworkError('No se pudo conectar con el servidor para cerrar sesión.');
    } else {
      console.error('An unexpected error occurred during logout:', error);
      throw new UnexpectedResponseError('Ocurrió un error inesperado durante el cierre de sesión.');
    }
  }
}

/**
 * Retrieves the current user's session.
 *
 * @returns A promise that resolves to the Session object or null if not authenticated.
 * @throws {NetworkError} If there's a network issue.
 * @throws {UnexpectedResponseError} For any other unexpected errors.
 */
async function getCurrentUserSession(): Promise<Session | null> {
  try {
    const session = await getSession();
    return session;
  } catch (error) {
    // getSession no suele lanzar 'Failed to fetch' directamente, pero es bueno ser cauteloso.
    if (error instanceof TypeError && (error.message.includes('Failed to fetch') || error.message.includes('NetworkError'))) {
      throw new NetworkError('No se pudo conectar con el servidor para obtener la sesión.');
    } else {
      console.error('An unexpected error occurred while fetching the session:', error);
      throw new UnexpectedResponseError('Ocurrió un error inesperado al obtener la sesión.');
    }
  }
}

export const authApiService = {
  login,
  logout,
  getCurrentUserSession,
  AuthError, // Exportar AuthError si se sigue usando específicamente
  // Ya no es necesario exportar NetworkError y UnexpectedError desde aquí, se importan desde apiUtils
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
