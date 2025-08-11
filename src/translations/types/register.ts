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
  registerError: string
  serverError: string
  success: {
    title: string
    message: string
    redirecting: string
  }
  error: {
    emailRequired: string
    emailInvalid: string
    emailExists: string
    passwordRequired: string
    passwordTooShort: string
    passwordMismatch: string
    weakPassword: string
    networkError: string
    validationError: string
  }
}
