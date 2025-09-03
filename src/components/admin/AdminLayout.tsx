'use client'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, ReactNode } from 'react'
import { UserRole } from '@prisma/client'
import { LanguageCode } from '@/constants/languages'
import AdminHeader from './AdminHeader'

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
  activeSection?: string
}

export function AdminLayout({
  children,
  requiredRoles,
  title,
  subtitle,
  navigationItems,
  activeSection,
}: AdminLayoutProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()

  // ✅ AGREGADO: Obtener languageCode para rutas correctas
  const languageCode = (params?.lang as LanguageCode) || 'es'

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      // ✅ CORREGIDO: Ruta de login con languageCode
      router.push(`/${languageCode}/login`)
      return
    }

    if (requiredRoles && !requiredRoles.includes(session.user.role)) {
      // ✅ CORREGIDO: Ruta de unauthorized con languageCode
      router.push(`/${languageCode}/access-denied`)
      return
    }
  }, [session, status, router, requiredRoles, languageCode])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  if (!session) return null

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
                {navigationItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => router.push(item.path)}
                    className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                      activeSection === item.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </div>
            </nav>
          )}
          {children}
        </main>
      </div>
    </div>
  )
}

// Mantener también la exportación por defecto
export default AdminLayout
