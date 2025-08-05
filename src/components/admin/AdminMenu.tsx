'use client'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

type UserWithRole = {
  name?: string | null
  email?: string | null
  image?: string | null
  role?: string
}

export default function AdminMenu() {
  const { data: session } = useSession()
  const user = session?.user as UserWithRole

  if (!user || user.role !== 'establishment_admin') return null

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/admin" className="text-xl font-bold text-gray-800">
                Panel Admin
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/admin/empleados"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Empleados
              </Link>
              <Link
                href="/admin/carta"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Carta
              </Link>
              <Link
                href="/admin/pedidos"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Pedidos
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
