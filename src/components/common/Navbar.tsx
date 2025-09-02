'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCart } from '@/lib/cart-context'
import { LanguageCode } from '@/constants/languages'
import { getTranslation } from '@/translations'

interface NavbarProps {
  lang: LanguageCode
}

export default function Navbar({ lang }: NavbarProps) {
  const { cartItems, establishmentId } = useCart()
  const t = getTranslation(lang)
  const totalItems = (cartItems ?? []).reduce(
    (sum: number, item: { quantity: number }) => sum + item.quantity,
    0
  )

  const pathname = usePathname()

  const homeHref = establishmentId ? `/${lang}/${establishmentId}/menu` : `/${lang}/login`

  const isHomePage = pathname === homeHref
  const isCartPage = pathname === `/${lang}/cart`

  if (!t) {
    return null // O un componente de carga
  }

  return (
    <nav className="navbar">
      <Link href={homeHref} className={`nav-link ${isHomePage ? 'font-bold' : ''}`}>
        {t.navbar.home}
      </Link>
      <Link
        href={`/${lang}/cart`}
        className={`nav-link cart-link ${isCartPage ? 'font-bold' : ''}`}
      >
        {t.navbar.cart}
        {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
      </Link>
    </nav>
  )
}
