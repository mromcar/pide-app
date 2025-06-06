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
  error?: string; // o cualquier otra estructura que tu API devuelva
  details?: any;
}

export class ApiError extends Error {
  status?: number;
  errorResponse?: ErrorResponse;
  constructor(
    message: string,
    public status: number,
    public errors?: any // Puede ser un array de ZodIssue, un objeto, etc.
  ) {
    super(message);
    this.name = 'ApiError';
    // Mantener la pila de errores original (stack trace)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }
}

/**
 * Error específico para problemas de red.
 */
export class NetworkError extends ApiError {
  constructor(message: string = 'Error de red. Por favor, verifica tu conexión.') {
    super(message, 0); // Status 0 o un código específico para errores de red del cliente
    this.name = 'NetworkError';
  }
}

/**
 * Error para respuestas inesperadas o no manejadas.
 */
export class UnexpectedResponseError extends ApiError {
  constructor(message: string = 'Respuesta inesperada del servidor.') {
    super(message, 500); // Asumir un error de servidor si no se especifica
    this.name = 'UnexpectedResponseError';
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
    const errors = responseBody?.errors || (responseBody?.error && typeof responseBody.error !== 'string' ? responseBody.error : undefined);
    throw new ApiError(errorMessage, response.status, errors);
  }

  // Si la respuesta es OK pero no había cuerpo (ej. 204), y T no es null o void, puede ser un problema.
  // Sin embargo, si T es `void` o `null`, `responseBody` (que sería `null`) es aceptable.
  // Esta función asume que el llamador espera un tipo T, y si responseBody es null y T no lo permite,
  // TypeScript lo detectará en el punto de asignación o uso.
  return responseBody as T;
}
