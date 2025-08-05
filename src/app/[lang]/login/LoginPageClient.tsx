'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { UITranslation } from '@/translations'

interface LoginPageClientProps {
  translations: UITranslation
  lang: string
}

export default function LoginPageClient({ translations, lang }: LoginPageClientProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const t = translations.login

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError(t.error.invalidCredentials)
      } else {
        // Redirigir al menú principal en lugar de a la página redundante
        router.push(`/${lang}/login`) // Esto activará LoginRedirect
      }
    } catch (err) {
      setError(t.error.networkError)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    setError('')

    try {
      await signIn('google', {
        // Redirigir al login que manejará la lógica de redirección
        callbackUrl: `/${lang}/login`,
      })
    } catch (err) {
      setError(t.error.oauthError)
      setIsLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-bg-card">
          {/* Header */}
          <div className="login-header">
            <h2 className="login-title">{t.title}</h2>
            <p className="login-subtitle">{t.subtitle}</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="login-error">
              <p className="login-error-text">{error}</p>
            </div>
          )}

          {/* Google OAuth Button */}
          <div className="login-google-section">
            <button onClick={handleGoogleLogin} disabled={isLoading} className="login-google-btn">
              <svg className="login-google-icon" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {t.googleButton}
            </button>
          </div>

          {/* Divider */}
          <div className="login-divider">
            <div className="login-divider-line" />
            <div className="login-divider-text">
              <span className="login-divider-span">{t.orDivider}</span>
            </div>
          </div>

          {/* Credentials Form */}
          <form onSubmit={handleCredentialsLogin} className="login-form">
            <div>
              <label htmlFor="email" className="login-label">
                {t.emailLabel}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="login-input"
                placeholder={t.emailPlaceholder}
              />
            </div>

            <div>
              <label htmlFor="password" className="login-label">
                {t.passwordLabel}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="login-input"
                placeholder={t.passwordPlaceholder}
              />
            </div>

            <button type="submit" disabled={isLoading} className="login-submit-btn">
              {isLoading ? t.signingIn : t.signInButton}
            </button>
          </form>

          {/* Register Link */}
          <div className="login-register-link">
            <a href={`/${lang}/register`} className="login-register-anchor">
              {t.signUp}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
