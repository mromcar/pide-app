export interface LoginTranslations {
  title: string
  subtitle: string
  emailLabel: string
  emailPlaceholder: string
  passwordLabel: string
  passwordPlaceholder: string
  signInButton: string
  signingIn: string
  invalidCredentials: string
  serverError: string
  forgotPassword: string
  noAccount: string
  signUp: string
  googleButton: string
  orDivider: string
  error: {
    invalidCredentials: string
    networkError: string
    oauthError: string
  }
}

export interface RegisterTranslations {
  title: string
  subtitle: string
  nameLabel: string
  namePlaceholder: string
  emailLabel: string
  emailPlaceholder: string
  passwordLabel: string
  passwordPlaceholder: string
  confirmPasswordLabel: string
  confirmPasswordPlaceholder: string
  registerButton: string
  registering: string
  alreadyHaveAccount: string
  signIn: string
  googleButton: string
  orDivider: string
  error: {
    emailExists: string
    passwordMismatch: string
    weakPassword: string
    networkError: string
    validationError: string
  }
  success: {
    title: string
    message: string
    redirecting: string
  }
}