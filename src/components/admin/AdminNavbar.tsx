'use client'

import { useState } from 'react'
import { signOut, useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { useTranslation } from '@/hooks/useTranslation'
import type { LanguageCode } from '@/constants/languages'
import type { Establishment } from '@/types/entities/establishment'
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
  establishment?: Establishment | null
}

export default function AdminNavbar({
  languageCode,
  establishmentId,
  establishment,
}: AdminNavbarProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const { t } = useTranslation(languageCode)
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  const userRole = session?.user?.role as UserRole
  const userName = session?.user?.name || 'Usuario'
  const establishmentName = establishment?.name || 'Establecimiento'

  // ✅ ACTUALIZADAS: URLs más cortas sin "establishment"
  const menuItems: MenuItem[] = [
    {
      href: `/${languageCode}/admin/${establishmentId}/menu`,
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

  // ✅ TypeScript ahora sabe que item.roles es UserRole[]
  const filteredMenuItems = menuItems.filter((item) => item.roles.includes(userRole))

  const handleTitleClick = () => {
    // ✅ ACTUALIZADA: URL más corta sin "establishment"
    router.push(`/${languageCode}/admin/${establishmentId}`)
  }

  return (
    <nav className="admin-navbar">
      <div className="admin-navbar-container">
        {/* Logo/Brand */}
        <div className="admin-navbar-brand">
          <h2 onClick={handleTitleClick} className="establishment-title">
            {establishmentName}
          </h2>
        </div>

        {/* Navigation Links */}
        <div className="admin-navbar-menu">
          {filteredMenuItems.map((item) => {
            const isActive = pathname.includes(item.href.split('/').pop() || '')
            return (
              <a
                key={item.href}
                href={item.href}
                className={`admin-navbar-link ${isActive ? 'active' : ''}`}
              >
                {item.label}
              </a>
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
              <a href={`/${languageCode}/admin/profile`} className="admin-navbar-profile-item">
                {t.establishmentAdmin.establishment.actions.accountData}
              </a>
              <button
                onClick={() => signOut({ callbackUrl: `/${languageCode}/login` })}
                className="admin-navbar-profile-item admin-navbar-signout"
              >
                {t.establishmentAdmin.establishment.actions.signOut}
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
