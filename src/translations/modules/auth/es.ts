import { LoginTranslations, RegisterTranslations } from '../../types/auth'

export const loginEs: LoginTranslations = {
  title: 'Iniciar Sesión',
  subtitle: '¡Bienvenido de vuelta! Inicia sesión en tu cuenta',
  emailLabel: 'Correo Electrónico',
  emailPlaceholder: 'Ingresa tu correo electrónico',
  passwordLabel: 'Contraseña',
  passwordPlaceholder: 'Ingresa tu contraseña',
  signInButton: 'Iniciar Sesión',
  signingIn: 'Iniciando sesión...',
  invalidCredentials: 'Correo o contraseña incorrectos',
  serverError: 'Error del servidor. Inténtalo de nuevo más tarde',
  forgotPassword: '¿Olvidaste tu contraseña?',
  noAccount: '¿No tienes una cuenta?',
  signUp: 'Regístrate',
  googleButton: 'Continuar con Google',
  orDivider: 'o',
  error: {
    invalidCredentials: 'Correo o contraseña incorrectos',
    networkError: 'Error de conexión. Verifica tu conexión a internet',
    oauthError: 'Error de autenticación. Inténtalo de nuevo'
  }
}

export const registerEs: RegisterTranslations = {
  title: 'Crear Cuenta',
  subtitle: '¡Únete hoy! Crea tu cuenta para comenzar',
  nameLabel: 'Nombre Completo',
  namePlaceholder: 'Ingresa tu nombre completo',
  emailLabel: 'Correo Electrónico',
  emailPlaceholder: 'Ingresa tu correo electrónico',
  passwordLabel: 'Contraseña',
  passwordPlaceholder: 'Crea una contraseña',
  confirmPasswordLabel: 'Confirmar Contraseña',
  confirmPasswordPlaceholder: 'Confirma tu contraseña',
  registerButton: 'Crear Cuenta',
  registering: 'Creando cuenta...',
  alreadyHaveAccount: '¿Ya tienes una cuenta?',
  signIn: 'Iniciar sesión',
  googleButton: 'Continuar con Google',
  orDivider: 'o',
  passwordMismatch: 'Las contraseñas no coinciden',
  emailExists: 'Ya existe una cuenta con este correo electrónico',
  registerError: 'No se pudo registrar. Inténtalo de nuevo.',
  serverError: 'Error del servidor. Inténtalo de nuevo más tarde.',
  error: {
    emailExists: 'Ya existe una cuenta con este correo electrónico',
    passwordMismatch: 'Las contraseñas no coinciden',
    weakPassword: 'La contraseña debe tener al menos 8 caracteres',
    networkError: 'Error de conexión. Verifica tu conexión a internet',
    validationError: 'Verifica tu información e inténtalo de nuevo'
  },
  success: {
    title: '¡Cuenta Creada Exitosamente!',
    message: '¡Bienvenido! Tu cuenta ha sido creada',
    redirecting: 'Redirigiendo...'
  }
}
