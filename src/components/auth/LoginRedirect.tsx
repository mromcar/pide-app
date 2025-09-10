'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { LanguageCode } from '@/constants/languages'
import { useTranslation } from '@/hooks/useTranslation'
import MainMenu from '../menu/MainMenu'

interface LoginRedirectProps {
  lang: LanguageCode
}

export default function LoginRedirect({ lang }: LoginRedirectProps) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { t } = useTranslation(lang)

  useEffect(() => {
    // Solo redirigir si no está autenticado
    if (status === 'unauthenticated') {
      router.replace(`/${lang}/login`)
    }
  }, [status, router, lang])

  // Estado de carga
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading-spinner"></div>
        <span className="sr-only">{t.login?.signingIn}</span>
      </div>
    )
  }

  // Si no hay sesión, no mostrar nada (está redirigiendo a login)
  if (status === 'unauthenticated' || !session) {
    return null
  }

  // Solo mostrar MainMenu para clientes - los admins ya fueron redirigidos
  return <MainMenu lang={lang} />
}
