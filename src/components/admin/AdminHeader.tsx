'use client'
import { useSession, signOut } from 'next-auth/react'
import { useParams } from 'next/navigation'
import { UserRole } from '@prisma/client'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'
import type { LanguageCode } from '@/constants/languages'

export default function AdminHeader() {
  const { data: session } = useSession()
  const params = useParams()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const user = session?.user

  // ✅ AGREGADO: Obtener languageCode para logout correcto
  const languageCode = (params?.lang as LanguageCode) || 'es'

  if (!user) return null

  const getRoleDisplayName = (role: UserRole) => {
    switch (role) {
      case UserRole.general_admin:
        return 'General Administrator'
      case UserRole.establishment_admin:
        return 'Establishment Administrator'
      case UserRole.waiter:
        return 'Waiter'
      case UserRole.cook:
        return 'Cook'
      default:
        return 'Employee'
    }
  }

  return (
    <header className="admin-header-main">
      <div className="admin-header-wrapper">
        <div className="admin-header-flex">
          <div className="admin-header-logo-section">
            <h1 className="admin-header-main-title">Pide - Management Panel</h1>
          </div>

          <div className="admin-header-actions">
            <div className="admin-header-dropdown-wrapper">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="admin-header-user-button"
              >
                <div className="admin-header-user-details">
                  <div className="admin-header-username">{user.name || user.email}</div>
                  <div className="admin-header-role">{getRoleDisplayName(user.role)}</div>
                </div>
                <ChevronDownIcon className="admin-header-icon" />
              </button>

              {dropdownOpen && (
                <div className="admin-header-menu">
                  <div className="admin-header-menu-content">
                    <button
                      onClick={() =>
                        signOut({
                          // ✅ CORREGIDO: Logout con languageCode correcto
                          callbackUrl: `/${languageCode}/login`,
                        })
                      }
                      className="admin-header-logout"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
