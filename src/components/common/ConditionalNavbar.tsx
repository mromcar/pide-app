'use client'

import { usePathname } from 'next/navigation'
import Navbar from './Navbar'
import { LanguageCode } from '@/constants/languages'

interface ConditionalNavbarProps {
  lang: LanguageCode
}

export default function ConditionalNavbar({ lang }: ConditionalNavbarProps) {
  const pathname = usePathname()
  
  // Ocultar navbar en páginas de autenticación
  const hideNavbarRoutes = ['/login', '/register']
  const shouldHideNavbar = hideNavbarRoutes.some(route => 
    pathname.includes(route)
  )
  
  if (shouldHideNavbar) {
    return null
  }
  
  return <Navbar lang={lang} />
}