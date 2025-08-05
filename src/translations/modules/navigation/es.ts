import { NavbarTranslations, MainMenuTranslations, RedirectTranslations } from '../../types/navigation'

export const navbarEs: NavbarTranslations = {
  home: 'Inicio',
  cart: 'Carrito'
}

export const mainMenuEs: MainMenuTranslations = {
  welcome: 'Bienvenido',
  subtitle: 'Selecciona una opción para continuar',
  logout: 'Cerrar Sesión',
  options: {
    establishmentAdmin: {
      title: 'Administración del Establecimiento',
      description: 'Gestiona tu restaurante: menú, empleados y pedidos'
    },
    employeeOrders: {
      title: 'Gestión de Pedidos',
      description: 'Ver y gestionar los pedidos de los clientes'
    },
    generalAdmin: {
      title: 'Administración General',
      description: 'Administración del sistema y configuración global'
    },
    restaurantMenu: {
      title: 'Menú del Restaurante',
      description: 'Explora y pide de nuestro menú'
    }
  }
}

export const redirectEs: RedirectTranslations = {
  loading: 'Cargando...',
  checkingSession: 'Verificando sesión...',
  redirectingToMenu: 'Redirigiendo al menú...'
}