import type { UITranslation } from '../types'
import { baseTranslations } from '../modules/base'
import { navigationTranslations } from '../modules/navigation'
import { authTranslations } from '../modules/auth'
import { restaurantMenuTranslations } from '../modules/restaurant-menu'
import { ordersTranslations } from '../modules/orders'
import { adminTranslations } from '../modules/admin'
import { registerTranslations } from '../modules/register'

export function buildTranslations(lang: string): UITranslation {
  const base = baseTranslations[lang as keyof typeof baseTranslations]
  const navigation = navigationTranslations[lang as keyof typeof navigationTranslations]
  const auth = authTranslations[lang as keyof typeof authTranslations]
  const menu = restaurantMenuTranslations[lang as keyof typeof restaurantMenuTranslations]
  const orders = ordersTranslations[lang as keyof typeof ordersTranslations]
  const admin = adminTranslations[lang as keyof typeof adminTranslations]
  const register = registerTranslations[lang as keyof typeof registerTranslations]

  return {
    // Base translations
    ...base,

    // Module translations
    navbar: navigation.navbar,
    mainMenu: navigation.mainMenu,
    redirect: navigation.redirect,

    login: auth.login,
    register,

    restaurantMenu: menu,

    cart: orders.cart,
    checkout: orders.checkout,
    orderSummary: orders.orderSummary,
    orderConfirmation: orders.orderConfirmation,
    orderStatus: orders.orderStatus,

    establishmentAdmin: admin.establishmentAdmin
  }
}
