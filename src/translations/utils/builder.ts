import type { UITranslation } from '../types'
import { baseTranslations } from '../modules/base'
import { navigationTranslations } from '../modules/navigation'
import { authTranslations } from '../modules/auth'
import { restaurantMenuTranslations } from '../modules/restaurant-menu'
import { ordersTranslations } from '../modules/orders'
import { adminTranslations } from '../modules/admin'

export function buildTranslations(lang: string): UITranslation {
  const base = baseTranslations[lang]
  const navigation = navigationTranslations[lang]
  const auth = authTranslations[lang]
  const menu = restaurantMenuTranslations[lang]
  const orders = ordersTranslations[lang]
  const admin = adminTranslations[lang]

  return {
    // Base translations
    ...base,

    // Module translations
    navbar: navigation.navbar,
    mainMenu: navigation.mainMenu,
    redirect: navigation.redirect,

    login: auth.login,
    register: auth.register,

    restaurantMenu: menu,

    cart: orders.cart,
    checkout: orders.checkout,
    orderSummary: orders.orderSummary,
    orderConfirmation: orders.orderConfirmation,
    orderStatus: orders.orderStatus,

    establishmentAdmin: admin
  }
}
