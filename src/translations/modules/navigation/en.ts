import { NavbarTranslations, MainMenuTranslations, RedirectTranslations } from '../../types/navigation'

export const navbarEn: NavbarTranslations = {
  home: 'Home',
  cart: 'Cart'
}

export const mainMenuEn: MainMenuTranslations = {
  welcome: 'Welcome',
  subtitle: 'Select an option to continue',
  logout: 'Logout',
  options: {
    establishmentAdmin: {
      title: 'Establishment Administration',
      description: 'Manage your restaurant: menu, employees, and orders'
    },
    employeeOrders: {
      title: 'Order Management',
      description: 'View and manage customer orders'
    },
    generalAdmin: {
      title: 'General Administration',
      description: 'System administration and global settings'
    },
    restaurantMenu: {
      title: 'Restaurant Menu',
      description: 'Browse and order from our menu'
    }
  }
}

export const redirectEn: RedirectTranslations = {
  loading: 'Loading...',
  checkingSession: 'Checking session...',
  redirectingToMenu: 'Redirecting to menu...'
}