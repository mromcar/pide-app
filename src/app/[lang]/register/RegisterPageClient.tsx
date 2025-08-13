'use client'

import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import type { RegisterTranslations } from '@/translations/types/register'
import { useState } from 'react'

interface RegisterPageClientProps {
  translations: RegisterTranslations
  lang: string
}

export default function RegisterPageClient({ translations, lang }: RegisterPageClientProps) {
  const t = translations
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)
  // Estados para mostrar/ocultar contraseñas
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email) {
      newErrors.email = t.error.emailRequired
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t.error.emailInvalid
    }

    if (!formData.password) {
      newErrors.password = t.error.passwordRequired
    } else if (formData.password.length < 8) {
      newErrors.password = t.error.passwordTooShort
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t.error.passwordMismatch
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    setErrors({})

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name || null,
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.message === 'Email already exists') {
          setErrors({ email: t.error.emailExists })
        } else {
          setErrors({ general: t.registerError })
        }
        return
      }

      // Mostrar mensaje de éxito en lugar de redirigir
      setIsRegistered(true)
    } catch (err) {
      console.error('Error during registration:', err)
      setErrors({ general: t.serverError })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: `/${lang}/login` })
  }

  const handleGoToLogin = () => {
    router.push(`/${lang}/login`)
  }

  // Si el usuario ya se registró, mostrar mensaje de éxito
  if (isRegistered) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="login-bg-card">
            <div className="login-header">
              <div className="success-icon">✅</div>
              <h2 className="login-title">{t.success.title}</h2>
              <p className="login-subtitle">{t.success.message}</p>
            </div>

            <div className="success-content">
              <p className="success-description">{t.success.description}</p>

              <div className="success-actions">
                <button onClick={handleGoToLogin} className="login-submit-btn">
                  {t.success.loginButton}
                </button>
              </div>

              <div className="success-info">
                <p className="success-email">
                  <strong>{t.success.emailLabel}:</strong> {formData.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-bg-card">
          <div className="login-header">
            <h2 className="login-title">{t.title}</h2>
            <p className="login-subtitle">{t.subtitle}</p>
          </div>

          {errors.general && (
            <div className="login-error">
              <p className="login-error-text">{errors.general}</p>
            </div>
          )}

          {/* Formulario de registro */}
          <form className="login-form" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="login-label">
                {t.nameLabel}
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                className="login-input"
                placeholder={t.namePlaceholder}
              />
            </div>

            <div>
              <label htmlFor="email" className="login-label">
                {t.emailLabel}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className={`login-input ${errors.email ? 'login-input-error' : ''}`}
                placeholder={t.emailPlaceholder}
              />
              {errors.email && <p className="login-error-text">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="login-label">
                {t.passwordLabel}
              </label>
              <div className="password-input-container">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`login-input ${errors.password ? 'login-input-error' : ''}`}
                  placeholder={t.passwordPlaceholder}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle-btn"
                >
                  {showPassword ? (
                    // Icono ojo cerrado
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    // Icono ojo abierto
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && <p className="login-error-text">{errors.password}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="login-label">
                {t.confirmPasswordLabel}
              </label>
              <div className="password-input-container">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`login-input ${errors.confirmPassword ? 'login-input-error' : ''}`}
                  placeholder={t.confirmPasswordPlaceholder}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="password-toggle-btn"
                >
                  {showConfirmPassword ? (
                    // Icono ojo cerrado
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    // Icono ojo abierto
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="login-error-text">{errors.confirmPassword}</p>
              )}
            </div>

            <button type="submit" disabled={isLoading} className="login-submit-btn">
              {isLoading ? t.registering : t.registerButton}
            </button>
          </form>

          {/* Divider */}
          <div className="login-divider">
            <div className="login-divider-line" />
            <div className="login-divider-text">
              <span className="login-divider-span">{t.orDivider}</span>
            </div>
          </div>

          {/* Google */}
          <div className="login-google-section">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="login-google-btn"
            >
              {t.googleButton}
            </button>
          </div>

          {/* Link a login */}
          <div className="login-register-link">
            <a href={`/${lang}/login`} className="login-register-anchor">
              {t.signIn}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
