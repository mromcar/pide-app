'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { LanguageCode } from '@/constants/languages'
import { getTranslation } from '@/translations'
import { UserRole } from '@prisma/client'
import MainMenu from '../menu/MainMenu'

interface LoginRedirectProps {
  lang: LanguageCode
}

export default function LoginRedirect({ lang }: LoginRedirectProps) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const t = getTranslation(lang)

  useEffect(() => {
    // If user is not authenticated, redirect to login
    if (status === 'unauthenticated') {
      router.replace(`/${lang}/login`)
      return
    }

    // If user is authenticated, redirect based on role
    if (status === 'authenticated' && session?.user) {
      const userRole = session.user.role as UserRole
      const establishmentId = session.user.establishment_id

      // Redirect employees and admins to their respective dashboards
      switch (userRole) {
        case UserRole.waiter:
        case UserRole.cook:
          if (establishmentId) {
            router.replace(`/${lang}/employee/establishment/${establishmentId}`)
          }
          break
        case UserRole.establishment_admin:
          if (establishmentId) {
            router.replace(`/${lang}/admin/establishment/${establishmentId}`)
          }
          break
        case UserRole.general_admin:
          router.replace(`/${lang}/admin/general`)
          break
        case UserRole.client:
        default:
          // Clients stay on the main menu (current behavior)
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
          <p>{t.redirect.checkingSession}</p>
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
        <p>{t.redirect.loading}</p>
      </div>
    </div>
  )
}