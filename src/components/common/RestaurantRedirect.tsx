'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/cart-context'
import { LanguageCode } from '@/constants/languages'
import { getTranslation } from '@/translations'

interface RestaurantRedirectProps {
  lang: LanguageCode
}

export default function RestaurantRedirect({ lang }: RestaurantRedirectProps) {
  const router = useRouter()
  const { restaurantId } = useCart()
  const t = getTranslation(lang)

  useEffect(() => {
    // If there's a restaurant ID, redirect to restaurant menu
    if (restaurantId) {
      router.replace(`/${lang}/restaurant/${restaurantId}/menu`)
    }
  }, [lang, restaurantId, router])

  // If there's a restaurant ID, show loading while redirecting
  if (restaurantId) {
    return (
      <div className="restaurant-redirect-container">
        <div className="restaurant-redirect-loading">
          <div className="restaurant-redirect-spinner"></div>
          <p>{t.redirect.redirectingToMenu}</p>
        </div>
      </div>
    )
  }

  // If no restaurant ID, show success message for newly registered clients
  return (
    <div className="restaurant-redirect-container">
      <div className="restaurant-redirect-success">
        <div className="mb-6">
          <div className="restaurant-redirect-icon-container">
            <svg
              className="restaurant-redirect-icon"
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
          <h1 className="restaurant-redirect-title">{t.register.success.title}</h1>
          <p className="restaurant-redirect-message">{t.register.success.message}</p>
        </div>

        <div className="restaurant-redirect-buttons">
          <button
            onClick={() => router.push(`/${lang}/login`)}
            className="restaurant-redirect-btn-primary"
          >
            {t.register.signIn}
          </button>

          <button
            onClick={() => router.push(`/${lang}`)}
            className="restaurant-redirect-btn-secondary"
          >
            {t.navbar.home}
          </button>
        </div>
      </div>
    </div>
  )
}
