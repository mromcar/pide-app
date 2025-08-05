import { NextRequest, NextResponse } from 'next/server'
import { match } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'
import {
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
  LanguageCode,
} from '@/constants/languages'

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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Solo manejar la detección de idioma
  const pathnameHasLocale = SUPPORTED_LANGUAGES.some(lang =>
    pathname.startsWith(`/${lang.code}/`) || pathname === `/${lang.code}`
  )

  if (!pathnameHasLocale) {
    const locale = getLocale(request)
    request.nextUrl.pathname = `/${locale}${pathname}`
    return NextResponse.redirect(request.nextUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images).*)',
  ],
}