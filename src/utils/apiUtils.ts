/**
 * - Estructura de Respuesta de la API : La implementación de handleApiResponse que te di asume que, en caso de éxito, el cuerpo de la respuesta ( response.body ) es directamente el objeto o array de tipo T que esperas. Si tu API backend envuelve todas las respuestas exitosas en una estructura como { success: true, data: T } o { items: T } , entonces el tipo T en handleApiResponse<T> debería ser ese objeto wrapper, y luego tendrías que acceder a result.data o result.items .
- Por ejemplo, si tu API devuelve { "categories": [...] } , entonces en getAllCategoriesByEstablishment llamarías const result = await handleApiResponse<{ categories: CategoryDTO[] }>(response); y luego return result.categories; .
- Errores de Validación (Zod) : El ApiError tiene una propiedad opcional errors . Si tu backend devuelve errores de validación de Zod en una propiedad errors del cuerpo JSON del error, handleApiResponse los capturará. Puedes acceder a error.errors en tu UI para mostrar mensajes detallados.
- Autenticación ( credentials: 'include' ) : Lo he mantenido en los ejemplos de fetch donde lo tenías. Asegúrate de que esto es lo que necesitas para tu manejo de sesiones (cookies). Si usas tokens Bearer, los añadirías a las cabeceras ( headers ).
- Especificidad de Errores : Puedes decidir si ApiError es suficiente o si prefieres crear errores más específicos que extiendan ApiError para cada módulo (ej. ProductApiError extends ApiError ). Usar ApiError directamente simplifica, pero errores específicos pueden dar más contexto si es necesario.
*/
// src/utils/apiUtils.ts

/**
 * Clase base para errores de API.
 */
export interface ErrorResponse {
  message: string
  error?: string
  details?: Record<string, unknown> | string | null
}

export class ApiError extends Error {
  public status: number
  public details?: Record<string, unknown> | string | null

  constructor(message: string, status: number, details?: Record<string, unknown> | string | null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    } else {
      Object.setPrototypeOf(this, ApiError.prototype);
    }
  }
}

/**
 * Network-specific error for connection issues.
 */
export class NetworkError extends ApiError {
  constructor(message: string = 'Network error. Please check your connection.') {
    super(message, 0);
    this.name = 'NetworkError';
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

/**
 * Error for unexpected or unhandled responses.
 */
export class UnexpectedResponseError extends ApiError {
  constructor(message: string = 'Unexpected server response.') {
    super(message, 500);
    this.name = 'UnexpectedResponseError';
    Object.setPrototypeOf(this, UnexpectedResponseError.prototype);
  }
}

/**
 * Handles API response, parses JSON and throws ApiError if response is not OK.
 * @param response The API response (Response object).
 * @returns A promise that resolves with parsed data (T).
 * @throws {ApiError} If response is not ok (status 4xx or 5xx).
 * @throws {NetworkError} If network error occurs during fetch (handled before calling this function).
 * @throws {Error} If JSON parsing fails for reasons other than API error.
 */
export async function handleApiResponse<T>(response: Response): Promise<T> {
  let responseBody;
  try {
    const textBody = await response.text();
    if (textBody) {
      responseBody = JSON.parse(textBody);
    } else {
      responseBody = null;
    }
  } catch (e) {
    if (response.ok) {
      console.error('Error parsing JSON from OK response:', e);
      throw new UnexpectedResponseError('Invalid response format from server.');
    }
    responseBody = null;
  }

  if (!response.ok) {
    const errorMessage = responseBody?.message || responseBody?.error || response.statusText || 'Unknown API error';
    const errorDetails = responseBody?.details || (responseBody?.error && typeof responseBody.error !== 'string' ? responseBody.error : undefined);
    throw new ApiError(errorMessage, response.status, errorDetails);
  }

  return responseBody as T;
}

/**
 * Validates if a string is a valid UUID v4.
 * @param uuid The string to validate.
 * @returns true if it's a valid UUID v4, false otherwise.
 */
export function isValidUUID(uuid: string): boolean {
  if (!uuid || typeof uuid !== 'string') {
    return false;
  }
  const regex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
  return regex.test(uuid);
}

/**
 * Catches API call errors and re-throws them consistently.
 * @param error The caught error.
 * @param SpecificApiErrorConstructor The constructor for the specific API error class.
 * @param defaultMessage Default message if error doesn't provide a clear one.
 * @returns Never returns, always throws an error.
 */
export function handleCaughtError<SpecificError extends ApiError>(
  error: unknown,
  SpecificApiErrorConstructor: new (message: string, status: number, details?: any) => SpecificError,
  defaultMessage: string = 'An unexpected error occurred.'
): never {
  if (error instanceof SpecificApiErrorConstructor) {
    throw error;
  }
  if (error instanceof ApiError) {
    throw new SpecificApiErrorConstructor(error.message, error.status, error.details);
  }
  if (error instanceof Error) {
    console.error('Unexpected API error:', error);
    throw new SpecificApiErrorConstructor(error.message || defaultMessage, 500, { originalError: error.name });
  }
  console.error('Unknown API error:', error);
  throw new SpecificApiErrorConstructor(defaultMessage, 500, { originalError: String(error) });
}
