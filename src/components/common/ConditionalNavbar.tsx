'use client'

import { usePathname } from 'next/navigation'
import Navbar from './Navbar'
import type { LanguageCode } from '@/constants/languages'

interface ConditionalNavbarProps {
  lang: LanguageCode
}

export default function ConditionalNavbar({ lang }: ConditionalNavbarProps) {
  const pathname = usePathname()

  // Lista de rutas específicas donde ocultar el navbar
  const hiddenPaths = [
    // Administración
    '/admin',
    '/admin/',
    // Autenticación
    '/login',
    '/register',
    '/login/',
    '/register/',
  ]

  // Verificar si la ruta actual empieza con alguna ruta oculta
  const shouldHideNavbar = hiddenPaths.some((path) => {
    // Quitar el prefijo de idioma para la comparación
    const pathWithoutLang = pathname.replace(/^\/[a-z]{2}/, '')
    return pathWithoutLang.startsWith(path)
  })

  if (shouldHideNavbar) {
    return null
  }

  // Usar la prop lang que viene del layout
  return <Navbar lang={lang} />
}
