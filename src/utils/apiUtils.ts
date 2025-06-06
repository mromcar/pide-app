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
  message: string;
  error?: string; // Mantener por compatibilidad si algunas APIs lo usan
  details?: any; // Para errores de validación u otros datos
}

export class ApiError extends Error {
  public status: number;
  public details?: any; // Para errores de validación de Zod, etc.

  constructor(message: string, status: number, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;

    // Mantener la pila de errores original (stack trace)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    } else {
      Object.setPrototypeOf(this, ApiError.prototype); // Fallback para entornos sin captureStackTrace
    }
  }
}

/**
 * Error específico para problemas de red.
 */
export class NetworkError extends ApiError {
  constructor(message: string = 'Error de red. Por favor, verifica tu conexión.') {
    // Usamos 0 o un código negativo para errores de red del cliente que no tienen un status HTTP
    super(message, 0); 
    this.name = 'NetworkError';
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

/**
 * Error para respuestas inesperadas o no manejadas.
 */
export class UnexpectedResponseError extends ApiError {
  constructor(message: string = 'Respuesta inesperada del servidor.') {
    super(message, 500); // Asumir un error de servidor si no se especifica
    this.name = 'UnexpectedResponseError';
    Object.setPrototypeOf(this, UnexpectedResponseError.prototype);
  }
}

/**
 * Maneja la respuesta de una llamada fetch.
 * Parsea el JSON y lanza ApiError si la respuesta no es OK.
 * @param response La respuesta de la API (objeto Response).
 * @returns Una promesa que resuelve con los datos parseados (T).
 * @throws {ApiError} Si la respuesta no es ok (status 4xx o 5xx).
 * @throws {NetworkError} Si ocurre un error de red al intentar hacer fetch (manejado antes de llamar a esta función).
 * @throws {Error} Si el parseo del JSON falla por una razón que no sea un error de API.
 */
export async function handleApiResponse<T>(response: Response): Promise<T> {
  let responseBody;
  try {
    // Intentar leer el cuerpo solo una vez
    const textBody = await response.text();
    if (textBody) {
      responseBody = JSON.parse(textBody);
    } else {
      // Para respuestas como 204 No Content que no tienen cuerpo
      responseBody = null;
    }
  } catch (e) {
    // Si el JSON.parse falla y la respuesta era OK, es un problema de formato inesperado
    if (response.ok) {
      console.error('Error al parsear JSON de respuesta OK:', e);
      throw new UnexpectedResponseError('Formato de respuesta inválido del servidor.');
    }
    // Si el parseo falla y la respuesta NO era OK, el error original es más importante
    // Se asigna null para que el error de la API se construya sin 'errors' específicos del body
    responseBody = null;
  }

  if (!response.ok) {
    const errorMessage = responseBody?.message || responseBody?.error || response.statusText || 'Error desconocido de la API';
    // Pasamos responseBody?.details en lugar de responseBody?.errors para consistencia
    const errorDetails = responseBody?.details || (responseBody?.error && typeof responseBody.error !== 'string' ? responseBody.error : undefined);
    throw new ApiError(errorMessage, response.status, errorDetails);
  }

  // Si la respuesta es OK pero no había cuerpo (ej. 204), y T no es null o void, puede ser un problema.
  // Sin embargo, si T es `void` o `null`, `responseBody` (que sería `null`) es aceptable.
  // Esta función asume que el llamador espera un tipo T, y si responseBody es null y T no lo permite,
  // TypeScript lo detectará en el punto de asignación o uso.
  return responseBody as T;
}

/**
 * Atrapa errores de llamadas a la API y los relanza de forma consistente.
 * @param error El error capturado.
 * @param SpecificApiErrorConstructor El constructor de la clase de error específica de la API (ej. UserApiError).
 * @param defaultMessage Mensaje por defecto si el error no proporciona uno claro.
 * @returns Nunca devuelve, siempre lanza un error.
 */
export function handleCaughtError<SpecificError extends ApiError>(
  error: unknown,
  SpecificApiErrorConstructor: new (message: string, status: number, details?: any) => SpecificError,
  defaultMessage: string = 'Ocurrió un error inesperado.'
): never {
  if (error instanceof SpecificApiErrorConstructor) {
    throw error; // Ya es del tipo específico, relanzar
  }
  if (error instanceof ApiError) {
    // Es un ApiError genérico, NetworkError o UnexpectedResponseError
    // Lo transformamos al error específico del contexto actual (ej. UserApiError)
    throw new SpecificApiErrorConstructor(error.message, error.status, error.details);
  }
  if (error instanceof Error) {
    // Error genérico de JavaScript
    console.error('Error no esperado en la API:', error);
    throw new SpecificApiErrorConstructor(error.message || defaultMessage, 500, { originalError: error.name });
  }
  // Si no es una instancia de Error
  console.error('Error desconocido en la API:', error);
  throw new SpecificApiErrorConstructor(defaultMessage, 500, { originalError: String(error) });
}
