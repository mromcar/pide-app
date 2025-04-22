'use client'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

type UserWithRol = {
  name?: string | null
  email?: string | null
  image?: string | null
  rol?: string
}

export default function AdminMenu() {
  const { data: session } = useSession()
  const user = session?.user as UserWithRol
  if (user?.rol !== 'establishment_admin') return null
  return (
    <nav>
      <ul>
        <li>
          <Link href="/admin/pedidos">Gestionar pedidos</Link>
        </li>
        <li>
          <Link href="/admin/empleados">Gestionar empleados</Link>
        </li>
        <li>
          <Link href="/admin/carta">Gestionar carta</Link>
        </li>
        {/* Agrega más enlaces si lo deseas */}
      </ul>
    </nav>
  )
}
