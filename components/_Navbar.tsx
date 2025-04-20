// components/Navbar.tsx
import Link from 'next/link'

const Navbar = () => {
  return (
    <nav className="bg-green-500 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo o nombre del establecimiento */}
        <Link href="/">
          <a className="text-2xl font-bold">Mi Restaurante</a>
        </Link>

        {/* Enlaces de navegación */}
        <div>
          <Link href="/carta">
            <a className="text-lg mx-4 hover:text-green-300">Carta</a>
          </Link>
          {/* Enlace al carrito */}
          <Link href="/carrito">
            <a className="bg-green-500 text-white py-2 px-4 rounded">Ver Carrito</a>
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
