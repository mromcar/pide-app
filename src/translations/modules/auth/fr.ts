import { LoginTranslations, RegisterTranslations } from '../../types/auth'

export const loginFr: LoginTranslations = {
  title: 'Se Connecter',
  subtitle: 'Bon retour ! Veuillez vous connecter à votre compte',
  emailLabel: 'Email',
  emailPlaceholder: 'Entrez votre email',
  passwordLabel: 'Mot de passe',
  passwordPlaceholder: 'Entrez votre mot de passe',
  signInButton: 'Se Connecter',
  signingIn: 'Connexion en cours...',
  invalidCredentials: 'Email ou mot de passe incorrect',
  serverError: 'Erreur serveur. Veuillez réessayer plus tard',
  forgotPassword: 'Mot de passe oublié ?',
  noAccount: "Vous n'avez pas de compte ?",
  signUp: "S'inscrire",
  googleButton: 'Continuer avec Google',
  orDivider: 'ou',
  error: {
    invalidCredentials: 'Email ou mot de passe incorrect',
    networkError: 'Erreur réseau. Vérifiez votre connexion',
    oauthError: "Erreur d'authentification. Veuillez réessayer"
  }
}

export const registerFr: RegisterTranslations = {
  title: 'Créer un Compte',
  subtitle: 'Rejoignez-nous ! Créez votre compte pour commencer',
  nameLabel: 'Nom Complet',
  namePlaceholder: 'Entrez votre nom complet',
  emailLabel: 'Email',
  emailPlaceholder: 'Entrez votre email',
  passwordLabel: 'Mot de passe',
  passwordPlaceholder: 'Créez un mot de passe',
  confirmPasswordLabel: 'Confirmer le Mot de passe',
  confirmPasswordPlaceholder: 'Confirmez votre mot de passe',
  registerButton: 'Créer un Compte',
  registering: 'Création du compte...',
  alreadyHaveAccount: 'Vous avez déjà un compte ?',
  signIn: 'Se connecter',
  googleButton: 'Continuer avec Google',
  orDivider: 'ou',
  error: {
    emailExists: 'Un compte avec cet email existe déjà',
    passwordMismatch: 'Les mots de passe ne correspondent pas',
    weakPassword: 'Le mot de passe doit contenir au moins 8 caractères',
    networkError: 'Erreur réseau. Vérifiez votre connexion',
    validationError: 'Vérifiez vos informations et réessayez'
  },
  success: {
    title: 'Compte Créé avec Succès !',
    message: 'Bienvenue ! Votre compte a été créé',
    redirecting: 'Redirection...'
  }
}