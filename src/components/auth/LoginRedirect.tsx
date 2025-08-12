'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { LanguageCode } from '@/constants/languages'
import { UserRole } from '@prisma/client'
import MainMenu from '../menu/MainMenu'

interface LoginRedirectProps {
  lang: LanguageCode
}

export default function LoginRedirect({ lang }: LoginRedirectProps) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [showAccessDenied, setShowAccessDenied] = useState(false)

  useEffect(() => {
    // If user is not authenticated, redirect to login
    if (status === 'unauthenticated') {
      router.replace(`/${lang}/login`)
      return
    }

    // If user is authenticated, redirect based on role and establishment
    if (status === 'authenticated' && session?.user) {
      const userRole = session.user.role as UserRole
      const establishmentId = session.user.establishmentId

      console.log('Debug session:', {
        userRole,
        establishmentId,
        fullSession: session?.user,
      })

      // Check access based on your business logic
      switch (userRole) {
        case UserRole.general_admin:
          // General admin always has access (will implement later)
          router.replace(`/${lang}/admin/general`)
          break

        case UserRole.establishment_admin:
        case UserRole.waiter:
        case UserRole.cook:
          if (establishmentId) {
            // Users with establishment_id can access their establishment
            router.replace(`/${lang}/admin/establishment/${establishmentId}`)
          } else {
            // User has no establishment_id - show access denied
            setShowAccessDenied(true)
          }
          break

        case UserRole.client:
        default:
          // Clients stay on the main menu
          break
      }
    }
  }, [lang, router, status, session])

  // Show loading while checking session
  if (status === 'loading') {
    return (
      <div className="login-redirect-container">
        <div className="login-redirect-loading">
          <div className="login-redirect-spinner"></div>
          <p>Verificando sesión...</p>
        </div>
      </div>
    )
  }

  // Show access denied message
  if (showAccessDenied) {
    return (
      <div className="login-redirect-container">
        <div className="login-redirect-error">
          <h2>Acceso Denegado</h2>
          <p>Tu usuario no tiene asignado ningún establecimiento. Contacta con el administrador.</p>
          <button onClick={() => router.push(`/${lang}/login`)} className="btn btn-primary">
            Volver al Login
          </button>
        </div>
      </div>
    )
  }

  // If user is authenticated and is a client, show main menu
  if (status === 'authenticated' && session?.user && session.user.role === UserRole.client) {
    return <MainMenu lang={lang} />
  }

  // Show loading while redirecting
  return (
    <div className="login-redirect-container">
      <div className="login-redirect-loading">
        <div className="login-redirect-spinner"></div>
        <p>Redirigiendo...</p>
      </div>
    </div>
  )
}
