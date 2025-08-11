import type { RegisterTranslations } from '@/translations/types/register'

export const registerEn: RegisterTranslations = {
  title: 'Create your account',
  subtitle: 'Register to access all features',
  nameLabel: 'Name',
  namePlaceholder: 'Your name',
  emailLabel: 'Email',
  emailPlaceholder: 'your@email.com',
  passwordLabel: 'Password',
  passwordPlaceholder: 'At least 8 characters',
  confirmPasswordLabel: 'Confirm Password',
  confirmPasswordPlaceholder: 'Repeat your password',
  registerButton: 'Register',
  registering: 'Registering...',
  alreadyHaveAccount: 'Already have an account?',
  signIn: 'Sign in',
  googleButton: 'Continue with Google',
  orDivider: 'or',
  registerError: 'Registration failed',
  serverError: 'Server error. Please try again later',
  success: {
    title: 'Account Created Successfully!',
    message: 'Welcome! Your account has been created',
    redirecting: 'Redirecting...',
  },
  error: {
    emailRequired: 'Email is required',
    emailInvalid: 'Invalid email address',
    emailExists: 'Email already exists',
    passwordRequired: 'Password is required',
    passwordTooShort: 'Password must be at least 8 characters',
    passwordMismatch: 'Passwords do not match',
    weakPassword: 'Password must be at least 8 characters',
    networkError: 'Network error. Please check your connection',
    validationError: 'Please check your information and try again'
  }
}
