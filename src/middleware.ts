import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { match } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'
import {
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
  LanguageCode,
} from '@/constants/languages'
import { UserRole } from '@/constants/enums'

const getLocale = (request: NextRequest): LanguageCode => {
  const negotiatorHeaders: Record<string, string> = {}
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value))

  const languages = new Negotiator({ headers: negotiatorHeaders }).languages()
  const locales: string[] = SUPPORTED_LANGUAGES.map(lang => lang.code)

  try {
    const locale = match(languages, locales, DEFAULT_LANGUAGE)
    return locale as LanguageCode
  } catch (error) {
    console.error('Error matching locale:', error)
    return DEFAULT_LANGUAGE
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  console.log('🔒 Middleware processing:', pathname)

  // ✅ 1. DETECCIÓN DE IDIOMA (mantener funcionalidad existente)
  const pathnameHasLocale = SUPPORTED_LANGUAGES.some(lang =>
    pathname.startsWith(`/${lang.code}/`) || pathname === `/${lang.code}`
  )

  if (!pathnameHasLocale) {
    const locale = getLocale(request)
    const redirectPath = `/${locale}${pathname}`
    console.log('🌍 Redirecting for locale:', redirectPath)
    return NextResponse.redirect(new URL(redirectPath, request.url))
  }

  // ✅ 2. PROTECCIÓN DE RUTAS ADMIN - CORREGIDO
  const adminRoutePattern = /^\/[a-z]{2}\/admin/
  if (adminRoutePattern.test(pathname)) {
    console.log('🛡️ Admin route detected:', pathname)

    try {
      // ✅ CORREGIR: Configuración correcta para obtener token
      const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
        // ✅ AGREGAR: Nombre correcto de cookie según entorno
        cookieName:
          process.env.NODE_ENV === 'production'
            ? '__Secure-next-auth.session-token'
            : 'next-auth.session-token',
      })

      console.log('🔐 Token check:', {
        exists: !!token,
        hasId: !!token?.id,
        hasRole: !!token?.role,
        role: token?.role,
        establishmentId: token?.establishmentId,
      })

      // ✅ FORZAR REDIRECCIÓN A LOGIN SI NO HAY TOKEN
      if (!token || !token.id || !token.role) {
        const locale = pathname.split('/')[1] || DEFAULT_LANGUAGE
        const loginUrl = new URL(`/${locale}/login`, request.url)

        console.log('❌ NO VALID TOKEN - FORCING LOGIN REDIRECT:', loginUrl.href)

        const response = NextResponse.redirect(loginUrl)

        // ✅ LIMPIAR TODAS LAS COOKIES POSIBLES
        const cookiesToClear = [
          'next-auth.session-token',
          '__Secure-next-auth.session-token',
          'next-auth.csrf-token',
          '__Host-next-auth.csrf-token',
          '__Secure-next-auth.csrf-token',
        ]

        cookiesToClear.forEach(cookieName => {
          response.cookies.delete(cookieName)
          response.cookies.set(cookieName, '', {
            expires: new Date(0),
            maxAge: 0,
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
          })
        })

        return response
      }

      // ✅ Verificar roles permitidos para rutas admin
      const allowedAdminRoles: UserRole[] = [
        UserRole.establishment_admin,
        UserRole.waiter,
        UserRole.cook,
        UserRole.general_admin,
      ]

      const userRole = token.role as UserRole
      if (!allowedAdminRoles.includes(userRole)) {
        const locale = pathname.split('/')[1] || DEFAULT_LANGUAGE
        const accessDeniedUrl = new URL(`/${locale}/access-denied`, request.url)
        console.log('❌ INSUFFICIENT ROLE:', userRole, '→ ACCESS DENIED')
        return NextResponse.redirect(accessDeniedUrl)
      }

      // ✅ Verificar acceso a establishment específico
      const establishmentIdMatch = pathname.match(/\/admin\/(\d+)/)
      if (establishmentIdMatch) {
        const requestedEstablishmentId = parseInt(establishmentIdMatch[1], 10)
        const userEstablishmentId = token.establishmentId as number | null

        console.log('🏢 Establishment verification:', {
          userRole,
          userEstablishmentId,
          requestedEstablishmentId,
        })

        // ✅ Solo general_admin puede acceder a cualquier establishment
        if (userRole !== UserRole.general_admin) {
          if (!userEstablishmentId) {
            console.log('❌ USER HAS NO ESTABLISHMENT ASSIGNED')
            const locale = pathname.split('/')[1] || DEFAULT_LANGUAGE
            const accessDeniedUrl = new URL(`/${locale}/access-denied`, request.url)
            return NextResponse.redirect(accessDeniedUrl)
          }

          if (userEstablishmentId !== requestedEstablishmentId) {
            console.log('❌ WRONG ESTABLISHMENT - REDIRECTING TO CORRECT ONE')
            const locale = pathname.split('/')[1] || DEFAULT_LANGUAGE
            const pathAfterEstablishment =
              pathname.split(`/admin/${requestedEstablishmentId}`)[1] || ''
            const correctUrl = new URL(
              `/${locale}/admin/${userEstablishmentId}${pathAfterEstablishment}`,
              request.url
            )
            return NextResponse.redirect(correctUrl)
          }
        }
      }

      console.log('✅ Admin access GRANTED for:', userRole)
    } catch (error) {
      console.error('❌ Middleware ERROR:', error)
      const locale = pathname.split('/')[1] || DEFAULT_LANGUAGE
      const loginUrl = new URL(`/${locale}/login`, request.url)
      console.log('❌ ERROR FALLBACK - REDIRECTING TO LOGIN')
      return NextResponse.redirect(loginUrl)
    }
  }

  // ✅ 3. PROTECCIÓN DE RUTAS PÚBLICAS QUE REQUIEREN AUTH (opcional)
  const protectedPublicRoutes = ['/cart', '/order']
  const requiresAuth = protectedPublicRoutes.some(route => {
    const routePattern = new RegExp(`^/[a-z]{2}${route}`)
    return routePattern.test(pathname)
  })

  if (requiresAuth) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    })
    if (!token) {
      const locale = pathname.split('/')[1] || DEFAULT_LANGUAGE
      const loginUrl = new URL(`/${locale}/login`, request.url)
      console.log(
        '🔒 Protected route requires auth:',
        pathname,
        '→',
        loginUrl.pathname
      )
      return NextResponse.redirect(loginUrl)
    }
  }

  console.log('✅ Middleware PASSED:', pathname)
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images|icons).*)',
  ],
}
