import { LoginTranslations, RegisterTranslations } from '../../types/auth'

export const loginEn: LoginTranslations = {
  title: 'Sign In',
  subtitle: 'Welcome back! Please sign in to your account',
  emailLabel: 'Email',
  emailPlaceholder: 'Enter your email',
  passwordLabel: 'Password',
  passwordPlaceholder: 'Enter your password',
  signInButton: 'Sign In',
  signingIn: 'Signing in...',
  invalidCredentials: 'Invalid email or password',
  serverError: 'Server error. Please try again later',
  forgotPassword: 'Forgot your password?',
  noAccount: "Don't have an account?",
  signUp: 'Sign up',
  googleButton: 'Continue with Google',
  orDivider: 'or',
  error: {
    invalidCredentials: 'Invalid email or password',
    networkError: 'Network error. Please check your connection',
    oauthError: 'Authentication error. Please try again'
  }
}

export const registerEn: RegisterTranslations = {
  title: 'Create Account',
  subtitle: 'Join us today! Create your account to get started',
  nameLabel: 'Full Name',
  namePlaceholder: 'Enter your full name',
  emailLabel: 'Email',
  emailPlaceholder: 'Enter your email',
  passwordLabel: 'Password',
  passwordPlaceholder: 'Create a password',
  confirmPasswordLabel: 'Confirm Password',
  confirmPasswordPlaceholder: 'Confirm your password',
  registerButton: 'Create Account',
  registering: 'Creating account...',
  alreadyHaveAccount: 'Already have an account?',
  signIn: 'Sign in',
  googleButton: 'Continue with Google',
  orDivider: 'or',
  passwordMismatch: 'Passwords do not match',
  emailExists: 'An account with this email already exists',
  registerError: 'Registration failed. Please try again.',
  serverError: 'Server error. Please try again later.',
  error: {
    emailExists: 'An account with this email already exists',
    passwordMismatch: 'Passwords do not match',
    weakPassword: 'Password must be at least 8 characters long',
    networkError: 'Network error. Please check your connection',
    validationError: 'Please check your information and try again'
  },
  success: {
    title: 'Account Created Successfully!',
    message: 'Welcome! Your account has been created',
    redirecting: 'Redirecting...'
  }
}
