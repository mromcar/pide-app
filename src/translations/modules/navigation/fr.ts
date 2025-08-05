import { NavbarTranslations, MainMenuTranslations, RedirectTranslations } from '../../types/navigation'

export const navbarFr: NavbarTranslations = {
  home: 'Accueil',
  cart: 'Panier'
}

export const mainMenuFr: MainMenuTranslations = {
  welcome: 'Bienvenue',
  subtitle: 'Sélectionnez une option pour continuer',
  logout: 'Se Déconnecter',
  options: {
    establishmentAdmin: {
      title: 'Administration de l\'Établissement',
      description: 'Gérez votre restaurant : menu, employés et commandes'
    },
    employeeOrders: {
      title: 'Gestion des Commandes',
      description: 'Voir et gérer les commandes des clients'
    },
    generalAdmin: {
      title: 'Administration Générale',
      description: 'Administration système et paramètres globaux'
    },
    restaurantMenu: {
      title: 'Menu du Restaurant',
      description: 'Parcourez et commandez depuis notre menu'
    }
  }
}

export const redirectFr: RedirectTranslations = {
  loading: 'Chargement...',
  checkingSession: 'Vérification de la session...',
  redirectingToMenu: 'Redirection vers le menu...'
}