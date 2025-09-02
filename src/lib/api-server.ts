/**
 * Helper para server-side API calls (Server Components, páginas Next.js)
 * Usado en: generateMetadata, páginas, API routes internos
 */

/**
 * Obtiene la URL base correcta para el entorno actual (server-side)
 * Funciona en desarrollo, Vercel, Railway, Netlify, Docker, etc.
 */
export function getServerBaseUrl(): string {
  // ✅ En el navegador NO debería usar esto (usar api-client.ts)
  if (typeof window !== 'undefined') {
    console.warn('⚠️ api-server.ts usado en cliente. Usar api-client.ts en su lugar.')
    return ''
  }

  // ===== PRODUCCIÓN (automático por plataforma) =====

  // ✅ Vercel (automático)
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  // ✅ Railway (automático)
  if (process.env.RAILWAY_STATIC_URL) {
    return process.env.RAILWAY_STATIC_URL
  }

  // ✅ Netlify (automático)
  if (process.env.NETLIFY_URL) {
    return process.env.NETLIFY_URL
  }

  // ===== CONFIGURACIÓN MANUAL =====

  // ✅ URL personalizada (para producción propia)
  if (process.env.NEXTJS_URL) {
    return process.env.NEXTJS_URL
  }

  // ✅ Dominio público (para SEO/producción)
  if (process.env.NEXT_PUBLIC_APP_URL) {
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
    return `${protocol}://${process.env.NEXT_PUBLIC_APP_URL}`
  }

  // ===== DESARROLLO LOCAL =====

  // ✅ Solo en desarrollo, con puerto configurable
  if (process.env.NODE_ENV === 'development') {
    const port = process.env.PORT || process.env.NEXT_PUBLIC_PORT || '3000'
    return `http://localhost:${port}`
  }

  // ===== FALLBACK DE EMERGENCIA =====

  console.error('❌ getServerBaseUrl: No se pudo determinar la URL base. Configurar variables de entorno.')
  console.error('📋 Variables disponibles:', {
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_URL: !!process.env.VERCEL_URL,
    RAILWAY_STATIC_URL: !!process.env.RAILWAY_STATIC_URL,
    NETLIFY_URL: !!process.env.NETLIFY_URL,
    NEXTJS_URL: !!process.env.NEXTJS_URL,
    NEXT_PUBLIC_APP_URL: !!process.env.NEXT_PUBLIC_APP_URL,
  })

  // En lugar de hardcodear, lanzar error en producción
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'URL base no configurada para producción. ' +
      'Configurar una de estas variables: NEXTJS_URL, NEXT_PUBLIC_APP_URL, ' +
      'o usar plataforma que auto-detecte (Vercel/Railway/Netlify)'
    )
  }

  // Solo para desarrollo como último recurso
  console.warn('⚠️ Usando fallback localhost:3000 para desarrollo')
  return 'http://localhost:3000'
}

/**
 * Construye URL completa para API calls internos del servidor
 * USAR EN: Server Components, generateMetadata, API routes
 */
export function getServerApiUrl(path: string): string {
  const baseUrl = getServerBaseUrl()
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${baseUrl}${cleanPath}`
}

/**
 * Obtiene el protocolo correcto según el entorno
 */
export function getProtocol(): 'http' | 'https' {
  if (process.env.NODE_ENV === 'production') {
    return 'https'
  }

  // En desarrollo, permitir HTTP
  return 'http'
}

/**
 * Debug: Mostrar configuración de URLs server-side (solo en desarrollo)
 */
export function debugServerUrls() {
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 Server API Configuration:', {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_URL: process.env.VERCEL_URL ? `✅ ${process.env.VERCEL_URL}` : '❌',
      RAILWAY_STATIC_URL: process.env.RAILWAY_STATIC_URL ? `✅ ${process.env.RAILWAY_STATIC_URL}` : '❌',
      NETLIFY_URL: process.env.NETLIFY_URL ? `✅ ${process.env.NETLIFY_URL}` : '❌',
      NEXTJS_URL: process.env.NEXTJS_URL ? `✅ ${process.env.NEXTJS_URL}` : '❌',
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ? `✅ ${process.env.NEXT_PUBLIC_APP_URL}` : '❌',
      PORT: process.env.PORT || 'default(3000)',
      computed_baseUrl: getServerBaseUrl(),
      sample_apiUrl: getServerApiUrl('/api/test'),
    })
  }
}

/**
 * Verifica si la configuración de URLs server-side es válida
 */
export function validateServerUrlConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  try {
    const baseUrl = getServerBaseUrl()

    if (!baseUrl) {
      errors.push('No se pudo obtener URL base')
    }

    if (process.env.NODE_ENV === 'production') {
      if (!baseUrl.startsWith('https://')) {
        errors.push('En producción se requiere HTTPS')
      }

      if (baseUrl.includes('localhost')) {
        errors.push('No usar localhost en producción')
      }
    }

  } catch (error) {
    errors.push(`Error al validar configuración: ${error instanceof Error ? error.message : error}`)
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// ===== LEGACY SUPPORT (deprecar gradualmente) =====

/**
 * @deprecated Usar getServerBaseUrl() en su lugar
 */
export const getBaseUrl = getServerBaseUrl

/**
 * @deprecated Usar getServerApiUrl() en su lugar
 */
export const getApiUrl = getServerApiUrl

/**
 * @deprecated Usar debugServerUrls() en su lugar
 */
export const debugUrls = debugServerUrls
