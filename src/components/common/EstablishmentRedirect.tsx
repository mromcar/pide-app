'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/cart-context'
import { LanguageCode } from '@/constants/languages'
import { getTranslation } from '@/translations'

interface EstablishmentRedirectProps {
  lang: LanguageCode
}

export default function EstablishmentRedirect({ lang }: EstablishmentRedirectProps) {
  const router = useRouter()
  const { establishmentId } = useCart()
  const t = getTranslation(lang)

  useEffect(() => {
    if (establishmentId) {
      console.log('🔄 EstablishmentRedirect: Redirecting to establishment menu:', establishmentId)
      router.replace(`/${lang}/${establishmentId}/menu`)
    }
  }, [lang, establishmentId, router])

  if (establishmentId) {
    return (
      <div className="establishment-redirect-container">
        <div className="establishment-redirect-loading">
          <div className="establishment-redirect-spinner"></div>
          <p>{t.redirect.redirectingToMenu}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="establishment-redirect-container">
      <div className="establishment-redirect-success">
        <div className="mb-6">
          <div className="establishment-redirect-icon-container">
            <svg
              className="establishment-redirect-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="establishment-redirect-title">{t.register.success.title}</h1>
          <p className="establishment-redirect-message">{t.register.success.message}</p>
        </div>

        <div className="establishment-redirect-buttons">
          <button
            onClick={() => router.push(`/${lang}/login`)}
            className="establishment-redirect-btn-primary"
          >
            {t.register.signIn}
          </button>

          <button
            onClick={() => router.push(`/${lang}`)}
            className="establishment-redirect-btn-secondary"
          >
            {t.navbar.home}
          </button>
        </div>
      </div>
    </div>
  )
}
