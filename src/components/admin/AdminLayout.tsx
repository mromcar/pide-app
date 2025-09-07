'use client'
import { useSession } from 'next-auth/react'
import { useParams, useRouter, usePathname } from 'next/navigation'
import { useEffect, ReactNode } from 'react'
import { UserRole } from '@prisma/client'
import { LanguageCode } from '@/constants/languages'
import AdminHeader from './AdminHeader'
import Link from 'next/link'

interface NavigationItem {
  id: string
  label: string
  icon: string
  path: string
}

interface AdminLayoutProps {
  children: ReactNode
  requiredRoles?: UserRole[]
  title?: string
  subtitle?: string
  navigationItems?: NavigationItem[]
}

export function AdminLayout({
  children,
  requiredRoles,
  title,
  subtitle,
  navigationItems,
}: AdminLayoutProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const pathname = usePathname()

  const languageCode = (params?.lang as LanguageCode) || 'es'

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push(`/${languageCode}/login`)
      return
    }
    if (requiredRoles && !requiredRoles.includes(session.user.role)) {
      router.push(`/${languageCode}/access-denied`)
    }
  }, [session, status, router, requiredRoles, languageCode])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500" />
      </div>
    )
  }

  if (!session) return null

  const isActivePath = (path: string | null, href: string) =>
    !!path && (path === href || path.startsWith(href + '/'))

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminHeader />
      <div className="flex">
        <main className="flex-1 p-6">
          {title && (
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
            </div>
          )}

          {navigationItems && (
            <nav className="mb-6">
              <div className="flex space-x-4">
                {navigationItems.map((item) => {
                  const active = isActivePath(pathname, item.path)
                  return (
                    <Link
                      key={item.id}
                      href={item.path}
                      className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                        active ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                      }`}
                      aria-current={active ? 'page' : undefined}
                    >
                      <span className="mr-2">{item.icon}</span>
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            </nav>
          )}

          {children}
        </main>
      </div>
    </div>
  )
}
