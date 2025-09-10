'use client'

import { useEffect } from 'react'
import { signOut } from 'next-auth/react'
import type { LanguageCode } from '@/constants/languages'

interface Props {
  params: { lang: LanguageCode }
}

export default function LogoutPage({ params: { lang } }: Props) {
  useEffect(() => {
    // Borra sesión y vuelve a la pantalla de login
    signOut({ callbackUrl: `/${lang}/login` })
  }, [lang])

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-bg-card">
          <div className="login-header">
            <h2 className="login-title">…</h2>
            <div className="establishment-admin-loading-content">
              <div className="establishment-admin-spinner"></div>
              <p className="establishment-admin-loading-text">Cerrando sesión…</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
