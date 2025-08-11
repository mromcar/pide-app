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

      // Auto sign in after successful registration
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.ok) {
        router.push(`/${lang}`)
      } else {
        router.push(`/${lang}/login?message=registered`)
      }
    } catch (error) {
      setErrors({ general: t.serverError })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: `/${lang}/login` })
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
              />
              {errors.email && <p className="login-error-text">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="login-label">
                {t.passwordLabel}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className={`login-input ${errors.password ? 'login-input-error' : ''}`}
              />
              {errors.password && <p className="login-error-text">{errors.password}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="login-label">
                {t.confirmPasswordLabel}
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`login-input ${errors.confirmPassword ? 'login-input-error' : ''}`}
              />
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
