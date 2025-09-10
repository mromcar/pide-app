// ✅ LIMPIAR: src/components/auth/AuthGuard.tsx
'use client'

import { useSession } from 'next-auth/react'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/hooks/useTranslation'
import type { LanguageCode } from '@/constants/languages'

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  lang?: LanguageCode
}

export default function AuthGuard({ children, fallback, lang = 'es' }: AuthGuardProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { t } = useTranslation(lang)

  useEffect(() => {
    if (status === 'unauthenticated') {
      const currentPath = window.location.pathname
      const detectedLang = currentPath.split('/')[1] || lang
      router.replace(`/${detectedLang}/login`)
    }
  }, [status, router, lang])

  if (status === 'loading') {
    return (
      fallback || (
        <div className="auth-loading">
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
          <p>{t.login.signingIn}</p>
        </div>
      )
    )
  }

  if (status === 'unauthenticated' || !session) {
    return fallback || <div className="auth-error" />
  }

  return <>{children}</>
}
