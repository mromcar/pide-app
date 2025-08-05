'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/hooks/useTranslation'
import { LanguageCode } from '@/constants/languages'

interface RegisterPageClientProps {
  lang: LanguageCode
}

export default function RegisterPageClient({ lang }: RegisterPageClientProps) {
  const { t } = useTranslation(lang)
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
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t.register.passwordMismatch
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
      // Register user
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name || null,
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.message === 'Email already exists') {
          setErrors({ email: t.register.emailExists })
        } else {
          setErrors({ general: t.register.registerError })
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
        // Registration successful but auto-login failed
        router.push(`/${lang}/login?message=registered`)
      }
    } catch (error) {
      console.error('Registration error:', error)
      setErrors({ general: t.register.serverError })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = () => {
    // Cambiar la línea 112
    signIn('google', { callbackUrl: `/${lang}/login` })
  }

  return (
    <div className="register-container">
      <div className="register-form-container">
        <div className="register-header">
          <h2 className="register-title">{t.register.title}</h2>
        </div>
        <form className="register-form" onSubmit={handleSubmit}>
          {errors.general && <div className="register-error-general">{errors.general}</div>}

          <div className="register-input-group">
            <div>
              <label htmlFor="name" className="register-input-label">
                {t.register.nameLabel}
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                className="register-input register-input-normal"
              />
            </div>

            <div>
              <label htmlFor="email" className="register-input-label">
                {t.register.emailLabel}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className={`register-input ${
                  errors.email ? 'register-input-error' : 'register-input-normal'
                }`}
              />
              {errors.email && <p className="register-error-text">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="register-input-label">
                {t.register.passwordLabel}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className={`register-input ${
                  errors.password ? 'register-input-error' : 'register-input-normal'
                }`}
              />
              {errors.password && <p className="register-error-text">{errors.password}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="register-input-label">
                {t.register.confirmPasswordLabel}
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`register-input ${
                  errors.confirmPassword ? 'register-input-error' : 'register-input-normal'
                }`}
              />
              {errors.confirmPassword && (
                <p className="register-error-text">{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          <div className="register-button-group">
            <button type="submit" disabled={isLoading} className="register-submit-button">
              {isLoading ? 'Creating...' : t.register.registerButton}
            </button>

            <div className="register-divider">
              <div className="register-divider-line">
                <div className="register-divider-border" />
              </div>
              <div className="register-divider-text">
                <span className="register-divider-span">or</span>
              </div>
            </div>

            <button type="button" onClick={handleGoogleSignIn} className="register-google-button">
              {t.register.googleButton}
            </button>
          </div>

          <div className="register-signin-link">
            <a href={`/${lang}/login`} className="register-signin-anchor">
              {t.register.signIn}
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}
