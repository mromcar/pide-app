'use client'
import { useSession } from 'next-auth/react'
import { useParams, useRouter, usePathname } from 'next/navigation'
import { useEffect, ReactNode, useState } from 'react'
import { UserRole } from '@prisma/client'
import { LanguageCode } from '@/constants/languages'
import { useActivityTracker } from '@/hooks/useActivityTracker'
import { useTranslation } from '@/hooks/useTranslation'
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
  const { t } = useTranslation(languageCode)

  // ✅ Activity tracker for establishment admins (not general admins)
  const activityTracker = useActivityTracker({
    warningMinutes: 30, // ✅ Warning at 30 minutes
    logoutMinutes: 35, // ✅ Logout at 35 minutes
    enabled: !!session && session.user.role === UserRole.establishment_admin, // ✅ Only for establishment admins
  })

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

          {/* ✅ Session status indicator for establishment admins */}
          {session.user.role === UserRole.establishment_admin && <SessionIndicator />}
        </main>
      </div>
    </div>
  )
}

// ✅ Component to show session status when time is running low
function SessionIndicator() {
  const { data: session } = useSession()
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const { t } = useTranslation('es') // Default to Spanish

  useEffect(() => {
    if (!session) return

    const interval = setInterval(() => {
      const now = Date.now()
      const sessionExp = new Date(session.expires).getTime()
      const remaining = Math.max(0, sessionExp - now)
      setTimeLeft(remaining)
    }, 60000) // ✅ Update every minute

    return () => clearInterval(interval)
  }, [session])

  // ✅ Only show when less than 30 minutes remaining
  if (!timeLeft || timeLeft > 30 * 60 * 1000) return null

  const minutesLeft = Math.floor(timeLeft / (60 * 1000))

  return (
    <div className="session-indicator">
      <span className="session-indicator__icon">⏰</span>
      <span>
        {t.establishmentAdmin?.security?.timeRemaining || 'Tiempo restante'}: {minutesLeft}{' '}
        {t.establishmentAdmin?.security?.minutes || 'minutos'}
      </span>
    </div>
  )
}
