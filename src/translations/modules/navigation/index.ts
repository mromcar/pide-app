import { navbarEn, mainMenuEn, redirectEn } from './en'
import { navbarEs, mainMenuEs, redirectEs } from './es'
import { navbarFr, mainMenuFr, redirectFr } from './fr'

export { navbarEn, mainMenuEn, redirectEn } from './en'
export { navbarEs, mainMenuEs, redirectEs } from './es'
export { navbarFr, mainMenuFr, redirectFr } from './fr'
export type { NavbarTranslations, MainMenuTranslations, RedirectTranslations } from '../../types/navigation'

// Objeto combinado para facilitar el acceso
export const navigationTranslations = {
  en: {
    navbar: navbarEn,
    mainMenu: mainMenuEn,
    redirect: redirectEn
  },
  es: {
    navbar: navbarEs,
    mainMenu: mainMenuEs,
    redirect: redirectEs
  },
  fr: {
    navbar: navbarFr,
    mainMenu: mainMenuFr,
    redirect: redirectFr
  }
} as const