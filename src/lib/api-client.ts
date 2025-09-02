/**
 * Helper para client-side API calls (componentes React, servicios)
 * Usado en: useEffect, event handlers, servicios API, hooks personalizados
 */

// ===== TYPES =====

/**
 * Tipos permitidos para el body de las requests
 */
type ApiRequestBody =
  | Record<string, unknown>
  | Array<unknown>
  | string
  | number
  | boolean
  | null
  | undefined

/**
 * Configuración extendida para requests API
 */
interface ApiRequestOptions extends Omit<RequestInit, 'body'> {
  body?: ApiRequestBody
}

/**
 * Obtiene la URL base correcta para client-side API calls
 */
function getClientBaseUrl(): string {
  // ✅ Prioridad 1: Variable de entorno pública configurada
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL
  }

  // ✅ Prioridad 2: En el navegador, usar URL actual
  if (typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.host}`
  }

  // ✅ Prioridad 3: Durante build/SSR, usar auto-detección
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  if (process.env.RAILWAY_STATIC_URL) {
    return process.env.RAILWAY_STATIC_URL
  }

  if (process.env.NETLIFY_URL) {
    return process.env.NETLIFY_URL
  }

  if (process.env.NEXTJS_URL) {
    return process.env.NEXTJS_URL
  }

  // ✅ Fallback solo para desarrollo
  if (process.env.NODE_ENV === 'development') {
    const port = process.env.PORT || '3000'
    return `http://localhost:${port}`
  }

  // ✅ Error en producción si no está configurado
  throw new Error(
    'API Base URL no configurada para client-side. Configurar NEXT_PUBLIC_API_BASE_URL en variables de entorno.'
  )
}

/**
 * Construye URL completa para API calls desde el cliente
 * USAR EN: componentes React, servicios, hooks, event handlers
 */
export function getClientApiUrl(path: string): string {
  const baseUrl = getClientBaseUrl()
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${baseUrl}${cleanPath}`
}

/**
 * Serializa el body de la request de forma segura
 */
function serializeBody(body: ApiRequestBody): string | undefined {
  if (body === null || body === undefined) {
    return undefined
  }

  if (typeof body === 'string') {
    return body
  }

  try {
    return JSON.stringify(body)
  } catch (error) {
    console.error('❌ Error serializing request body:', error)
    throw new Error('Invalid request body: cannot serialize to JSON')
  }
}

/**
 * Fetch wrapper con URL automática y manejo de errores mejorado
 */
export async function clientApiFetch(path: string, options?: RequestInit): Promise<Response> {
  const url = getClientApiUrl(path)

  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    },
  }

  const finalOptions = { ...defaultOptions, ...options }

  // ✅ Merge headers correctamente
  if (options?.headers) {
    finalOptions.headers = {
      ...defaultOptions.headers,
      ...options.headers,
    }
  }

  try {
    console.log(`🌐 Client API Call: ${finalOptions.method || 'GET'} ${url}`)
    const response = await fetch(url, finalOptions)

    if (process.env.NODE_ENV === 'development') {
      console.log(`📡 Client API Response: ${response.status} ${response.statusText}`)
    }

    return response
  } catch (error) {
    console.error('❌ Client API Call Error:', {
      url,
      error: error instanceof Error ? error.message : error,
    })
    throw error
  }
}

/**
 * Helper para GET requests con tipado (client-side)
 */
export async function clientApiGet<T>(path: string): Promise<T> {
  const response = await clientApiFetch(path, { method: 'GET' })

  if (!response.ok) {
    throw new Error(`Client API GET failed: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

/**
 * Helper para POST requests con tipado (client-side)
 */
export async function clientApiPost<TResponse, TBody = ApiRequestBody>(
  path: string,
  data?: TBody
): Promise<TResponse> {
  const response = await clientApiFetch(path, {
    method: 'POST',
    body: serializeBody(data as ApiRequestBody),
  })

  if (!response.ok) {
    throw new Error(`Client API POST failed: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

/**
 * Helper para PUT requests con tipado (client-side)
 */
export async function clientApiPut<TResponse, TBody = ApiRequestBody>(
  path: string,
  data?: TBody
): Promise<TResponse> {
  const response = await clientApiFetch(path, {
    method: 'PUT',
    body: serializeBody(data as ApiRequestBody),
  })

  if (!response.ok) {
    throw new Error(`Client API PUT failed: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

/**
 * Helper para PATCH requests con tipado (client-side)
 */
export async function clientApiPatch<TResponse, TBody = ApiRequestBody>(
  path: string,
  data?: TBody
): Promise<TResponse> {
  const response = await clientApiFetch(path, {
    method: 'PATCH',
    body: serializeBody(data as ApiRequestBody),
  })

  if (!response.ok) {
    throw new Error(`Client API PATCH failed: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

/**
 * Helper para DELETE requests (client-side)
 */
export async function clientApiDelete(path: string): Promise<void> {
  const response = await clientApiFetch(path, { method: 'DELETE' })

  if (!response.ok) {
    throw new Error(`Client API DELETE failed: ${response.status} ${response.statusText}`)
  }
}

/**
 * Helper para requests que no retornan JSON (ej: archivos)
 */
export async function clientApiBlob(path: string, options?: RequestInit): Promise<Blob> {
  const response = await clientApiFetch(path, options)

  if (!response.ok) {
    throw new Error(`Client API Blob failed: ${response.status} ${response.statusText}`)
  }

  return response.blob()
}

/**
 * Debug: Mostrar configuración de API client (solo en desarrollo)
 */
export function debugClientApi() {
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 Client API Configuration:', {
      NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || '❌',
      windowLocation: typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host}` : '❌ (SSR)',
      VERCEL_URL: process.env.VERCEL_URL || '❌',
      RAILWAY_STATIC_URL: process.env.RAILWAY_STATIC_URL || '❌',
      NETLIFY_URL: process.env.NETLIFY_URL || '❌',
      NEXTJS_URL: process.env.NEXTJS_URL || '❌',
      computed_baseUrl: getClientBaseUrl(),
      sample_apiUrl: getClientApiUrl('/api/test'),
    })
  }
}

// ===== EXPORTS CON NOMBRES CORTOS (para compatibilidad) =====

export const apiGet = clientApiGet
export const apiPost = clientApiPost
export const apiPut = clientApiPut
export const apiPatch = clientApiPatch
export const apiDelete = clientApiDelete
export const apiBlob = clientApiBlob
export const apiCall = clientApiFetch
export const API_BASE_URL = getClientBaseUrl()
export const debugApiClient = debugClientApi

// ===== EXPORTS DE TIPOS =====

export type { ApiRequestBody, ApiRequestOptions }
