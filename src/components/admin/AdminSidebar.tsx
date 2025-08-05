'use client'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserRole } from '@prisma/client'
import {
  HomeIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  BuildingStorefrontIcon,
  ChartBarIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline'

export default function AdminSidebar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const user = session?.user

  if (!user) return null

  const isGeneralAdmin = user.role === UserRole.general_admin
  const isEstablishmentAdmin = user.role === UserRole.establishment_admin
  const establishmentId = user.establishment_id

  const navigationItems = [
    {
      name: 'Dashboard',
      href: isGeneralAdmin ? '/admin/global' : `/admin/establishment/${establishmentId}`,
      icon: HomeIcon,
      show: true,
    },
    {
      name: 'Establishments',
      href: '/admin/global/establishments',
      icon: BuildingStorefrontIcon,
      show: isGeneralAdmin,
    },
    {
      name: 'Staff Management',
      href: `/admin/establishment/${establishmentId}/staff`,
      icon: UsersIcon,
      show: isEstablishmentAdmin,
    },
    {
      name: 'Menu Management',
      href: `/admin/establishment/${establishmentId}/menu`,
      icon: ClipboardDocumentListIcon,
      show: isEstablishmentAdmin,
    },
    {
      name: 'Order Management',
      href: `/admin/establishment/${establishmentId}/orders`,
      icon: ChartBarIcon,
      show: isEstablishmentAdmin,
    },
    {
      name: 'Settings',
      href: isGeneralAdmin ? '/admin/global/settings' : `/admin/establishment/${establishmentId}/settings`,
      icon: Cog6ToothIcon,
      show: true,
    },
  ]

  return (
    <div className="admin-sidebar-main">
      <div className="admin-sidebar-user-section">
        <h2 className="admin-sidebar-user-title">
          {isGeneralAdmin ? 'Global Admin' : 'Restaurant Admin'}
        </h2>
        <p className="admin-sidebar-user-email">{user.email}</p>
      </div>
      <nav className="admin-sidebar-navigation">
        {navigationItems
          .filter(item => item.show)
          .map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`admin-sidebar-link ${
                  isActive
                    ? 'admin-sidebar-link-active'
                    : 'admin-sidebar-link-inactive'
                }`}
              >
                <item.icon className="admin-sidebar-link-icon" />
                {item.name}
              </Link>
            )
          })}
      </nav>
    </div>
  )
}