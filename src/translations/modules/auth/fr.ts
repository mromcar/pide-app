import { LoginTranslations } from '../../types/auth'

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
