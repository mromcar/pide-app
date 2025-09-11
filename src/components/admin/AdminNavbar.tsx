'use client'

import { useState } from 'react'
import { signOut, useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useTranslation } from '@/hooks/useTranslation'
import type { LanguageCode } from '@/constants/languages'
import type { EstablishmentResponseDTO } from '@/types/dtos/establishment'
import { UserRole } from '@/constants/enums'

// ✅ Interface tipada para mejor type safety
interface MenuItem {
  href: string
  label: string
  roles: UserRole[]
}

interface AdminNavbarProps {
  languageCode: LanguageCode
  establishmentId: string
  establishment?: EstablishmentResponseDTO | null
}

export default function AdminNavbar({
  languageCode,
  establishmentId,
  establishment,
}: AdminNavbarProps) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const { t } = useTranslation(languageCode)
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  const userRole = session?.user?.role as UserRole
  const userName = session?.user?.name || 'Usuario'
  const establishmentName = establishment?.name || 'Establecimiento'

  const menuItems: MenuItem[] = [
    {
      href: `/${languageCode}/admin/${establishmentId}/categories`,
      label: t.establishmentAdmin.navigation.menuManagement,
      roles: [UserRole.establishment_admin],
    },
    {
      href: `/${languageCode}/admin/${establishmentId}/employees`,
      label: t.establishmentAdmin.navigation.employeeManagement,
      roles: [UserRole.establishment_admin],
    },
    {
      href: `/${languageCode}/admin/${establishmentId}/orders`,
      label: t.establishmentAdmin.navigation.orderSupervision,
      roles: [UserRole.establishment_admin, UserRole.waiter, UserRole.cook],
    },
  ]

  const filteredMenuItems = menuItems.filter((item) => item.roles.includes(userRole))

  // Activo si coincide exacto o es subruta
  const isActivePath = (path: string | null, href: string) => {
    if (!path || !href) return false
    return path === href || path.startsWith(href + '/')
  }

  return (
    <nav className="admin-navbar">
      <div className="admin-navbar-container">
        {/* Logo/Brand */}
        <div className="admin-navbar-brand">
          <Link
            href={`/${languageCode}/admin/${establishmentId}`}
            className="establishment-title"
            aria-label={establishmentName}
          >
            {establishmentName}
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="admin-navbar-menu">
          {filteredMenuItems.map((item) => {
            const active = isActivePath(pathname, item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`admin-navbar-link ${active ? 'active' : ''}`}
                aria-current={active ? 'page' : undefined}
              >
                {item.label}
              </Link>
            )
          })}
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
              <Link href={`/${languageCode}/admin/profile`} className="admin-navbar-profile-item">
                {t.establishmentAdmin.actions.accountData}
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: `/${languageCode}/login` })}
                className="admin-navbar-profile-item admin-navbar-signout"
              >
                {t.establishmentAdmin.actions.signOut}
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
