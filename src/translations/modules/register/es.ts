import type { RegisterTranslations } from '@/translations/types/register'

export const registerEs: RegisterTranslations = {
  title: 'Crea tu cuenta',
  subtitle: '¡Únete hoy! Crea tu cuenta para comenzar',
  nameLabel: 'Nombre completo',
  namePlaceholder: 'Introduce tu nombre completo',
  emailLabel: 'Correo electrónico',
  emailPlaceholder: 'Introduce tu correo electrónico',
  passwordLabel: 'Contraseña',
  passwordPlaceholder: 'Crea una contraseña',
  confirmPasswordLabel: 'Confirmar contraseña',
  confirmPasswordPlaceholder: 'Confirma tu contraseña',
  registerButton: 'Crear cuenta',
  registering: 'Creando cuenta...',
  alreadyHaveAccount: '¿Ya tienes una cuenta?',
  signIn: 'Iniciar sesión',
  googleButton: 'Continuar con Google',
  orDivider: 'o',
  registerError: 'El registro ha fallado. Inténtalo de nuevo.',
  serverError: 'Error del servidor. Inténtalo de nuevo más tarde.',
  success: {
    title: '¡Cuenta creada exitosamente!',
    message: '¡Bienvenido a PideApp!',
    description: 'Tu cuenta ha sido creada correctamente. Ahora puedes iniciar sesión para comenzar a usar la aplicación.',
    loginButton: 'Iniciar sesión',
    emailLabel: 'Email registrado',
    redirecting: 'Redirigiendo...'
  },
  error: {
    emailRequired: 'El correo electrónico es obligatorio',
    emailInvalid: 'Correo electrónico no válido',
    emailExists: 'Ya existe una cuenta con este correo',
    passwordRequired: 'La contraseña es obligatoria',
    passwordTooShort: 'La contraseña debe tener al menos 8 caracteres',
    passwordMismatch: 'Las contraseñas no coinciden',
    weakPassword: 'La contraseña debe tener al menos 8 caracteres',
    networkError: 'Error de red. Comprueba tu conexión',
    validationError: 'Revisa tu información e inténtalo de nuevo'
  }
}
