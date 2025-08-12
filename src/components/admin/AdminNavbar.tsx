'use client'

import { useState } from 'react'
import { signOut, useSession } from 'next-auth/react'
import type { LanguageCode } from '@/constants/languages'
import type { Establishment } from '@/types/entities/establishment'
import { UserRole } from '@/types/enums'

interface AdminNavbarProps {
  languageCode: LanguageCode
  establishmentId: string
  establishment?: Establishment | null // Añadir esta prop
}

export default function AdminNavbar({
  languageCode,
  establishmentId,
  establishment,
}: AdminNavbarProps) {
  const { data: session } = useSession()
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  const userRole = session?.user?.role as UserRole
  const userName = session?.user?.name || 'Usuario'
  const establishmentName = establishment?.name || 'Establecimiento'

  const menuItems = [
    {
      href: `/${languageCode}/admin/establishment/${establishmentId}/menu`,
      label: 'Gestión del menú',
      roles: [UserRole.ESTABLISHMENT_ADMIN],
    },
    {
      href: `/${languageCode}/admin/establishment/${establishmentId}/employees`,
      label: 'Gestión de usuarios',
      roles: [UserRole.ESTABLISHMENT_ADMIN],
    },
    {
      href: `/${languageCode}/admin/establishment/${establishmentId}/orders`,
      label: 'Gestión de pedidos',
      roles: [UserRole.ESTABLISHMENT_ADMIN, UserRole.WAITER, UserRole.COOK],
    },
  ]

  const filteredMenuItems = menuItems.filter((item) => item.roles.includes(userRole))

  return (
    <nav className="admin-navbar">
      <div className="admin-navbar-container">
        {/* Logo/Brand con nombre del establecimiento */}
        <div className="admin-navbar-brand">
          <h2>Panel de Administración del {establishmentName}</h2>
        </div>

        {/* Navigation Links */}
        <div className="admin-navbar-menu">
          {filteredMenuItems.map((item) => (
            <a key={item.href} href={item.href} className="admin-navbar-link">
              {item.label}
            </a>
          ))}
        </div>

        {/* Profile Menu */}
        <div className="admin-navbar-profile">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="admin-navbar-profile-btn"
          >
            <span>{userName}</span>
            <svg
              className="admin-navbar-profile-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {showProfileMenu && (
            <div className="admin-navbar-profile-menu">
              <a href={`/${languageCode}/admin/profile`} className="admin-navbar-profile-item">
                Datos de cuenta
              </a>
              <button
                onClick={() => signOut({ callbackUrl: `/${languageCode}/login` })}
                className="admin-navbar-profile-item admin-navbar-signout"
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
