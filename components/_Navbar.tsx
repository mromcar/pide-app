// components/Navbar.tsx
import Link from 'next/link'
import {
  navbarClasses,
  navbarContainerClasses,
  navbarLogoClasses,
  navbarLinkClasses,
  navbarCartBtnClasses,
} from '@/utils/tailwind'

const Navbar = () => {
  return (
    <nav className={navbarClasses}>
      <div className={navbarContainerClasses}>
        <Link href="/">
          <span className={navbarLogoClasses}>Mi Restaurante</span>
        </Link>
        <div>
          <Link href="/carta">
            <span className={navbarLinkClasses}>Carta</span>
          </Link>
          <Link href="/carrito">
            <span className={navbarCartBtnClasses}>Ver Carrito</span>
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
