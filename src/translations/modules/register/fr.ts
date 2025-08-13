import type { RegisterTranslations } from '@/translations/types/register'

export const registerFr: RegisterTranslations = {
  title: 'Créez votre compte',
  subtitle: 'Inscrivez-vous pour accéder à toutes les fonctionnalités',
  nameLabel: 'Nom',
  namePlaceholder: 'Votre nom',
  emailLabel: 'E-mail',
  emailPlaceholder: 'votre@email.com',
  passwordLabel: 'Mot de passe',
  passwordPlaceholder: 'Au moins 8 caractères',
  confirmPasswordLabel: 'Confirmer le mot de passe',
  confirmPasswordPlaceholder: 'Répétez votre mot de passe',
  registerButton: "S'inscrire",
  registering: "Inscription...",
  alreadyHaveAccount: 'Vous avez déjà un compte ?',
  signIn: 'Connectez-vous',
  googleButton: 'Continuer avec Google',
  orDivider: 'ou',
  registerError: "Échec de l'inscription",
  serverError: 'Erreur du serveur. Veuillez réessayer plus tard',
  success: {
    title: 'Compte créé avec succès !',
    message: 'Bienvenue à PideApp !',
    description: 'Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter pour commencer à utiliser l\'application.',
    loginButton: 'Se connecter',
    emailLabel: 'E-mail enregistré',
    redirecting: 'Redirection...'
  },
  error: {
    emailRequired: "L'e-mail est requis",
    emailInvalid: 'Adresse e-mail invalide',
    emailExists: "L'e-mail existe déjà",
    passwordRequired: 'Le mot de passe est requis',
    passwordTooShort: 'Le mot de passe doit comporter au moins 8 caractères',
    passwordMismatch: 'Les mots de passe ne correspondent pas',
    weakPassword: 'Le mot de passe doit comporter au moins 8 caractères',
    networkError: 'Erreur réseau. Veuillez vérifier votre connexion',
    validationError: 'Veuillez vérifier vos informations et réessayer'
  }
}
