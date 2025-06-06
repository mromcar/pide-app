
/*
Las funciones de next-auth/react ( signIn , signOut , getSession ) tienen su propio manejo interno y no siempre devuelven un objeto Response estándar que handleApiResponse esperaría. Por lo tanto, handleApiResponse es más útil para tus propias llamadas fetch a tus endpoints de API backend. El refactor de auth.api.ts se centra más en unificar los tipos de error con ApiError y NetworkError de apiUtils.ts .
*/
import { signIn, signOut, getSession } from 'next-auth/react';
import type { SignInResponse, SignInOptions, SignOutParams } from 'next-auth/react';
import type { Session } from 'next-auth'; // Assuming Session type is correctly defined in next-auth.d.ts
import type { UserLoginDTO } from '@/types/dtos/user';
import { ApiError, NetworkError, UnexpectedResponseError } from '@/utils/apiUtils'; // No necesitamos handleApiResponse aquí directamente

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
    const response = await signIn('credentials', {
      ...credentials,
      redirect: options?.redirect ?? false,
      ...options,
    });

    if (response && response.error) {
      if (response.error === 'CredentialsSignin') {
        // Usamos el status de la respuesta si está, o 401 por defecto para credenciales inválidas
        throw new AuthError('Credenciales inválidas.', response.status || 401, response.error);
      } else {
        throw new AuthError(`Error de autenticación: ${response.error}`, response.status || 400, response.error);
      }
    }
    if (!response) {
        throw new UnexpectedResponseError('Respuesta inesperada del servicio de autenticación.');
    }
    return response as SignInResponse; // Asegurar el tipo de retorno

  } catch (error) {
    if (error instanceof AuthError || error instanceof NetworkError || error instanceof UnexpectedResponseError) {
      // Si ya es uno de nuestros errores personalizados (incluyendo AuthError que extiende ApiError), relanzarlo.
      throw error;
    }
    // Para errores de red no capturados explícitamente por next-auth (aunque signIn suele manejarlos)
    if (error instanceof TypeError && error.message.toLowerCase().includes('failed to fetch')) {
      throw new NetworkError('No se pudo conectar con el servidor.');
    }
    // Para cualquier otro error inesperado
    console.error('Error inesperado durante el login:', error);
    throw new UnexpectedResponseError('Ocurrió un error inesperado durante el inicio de sesión.');
  }
}

// La función logout y getCurrentSession seguirían un patrón similar de try/catch,
// adaptando el manejo de errores a lo que devuelvan signOut y getSession.

export async function logout(options?: SignOutParams<true>): Promise<void> {
  try {
    await signOut({ redirect: false, ...options }); // signOut no devuelve un error en la promesa de la misma forma
    // Si signOut falla, usualmente es por configuración o problemas de red no capturados aquí.
  } catch (error) {
    // Es menos común que signOut lance errores capturables aquí, pero por si acaso:
    if (error instanceof TypeError && error.message.toLowerCase().includes('failed to fetch')) {
      throw new NetworkError('Error de red durante el cierre de sesión.');
    }
    console.error('Error inesperado durante el logout:', error);
    throw new UnexpectedResponseError('Error inesperado durante el cierre de sesión.');
  }
}

export async function getCurrentSession(): Promise<Session | null> {
  try {
    const session = await getSession();
    return session;
  } catch (error) {
    // getSession es menos propenso a errores de red aquí, más a configuración.
    console.error('Error inesperado obteniendo la sesión:', error);
    throw new UnexpectedResponseError('Error inesperado al obtener la sesión actual.');
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
