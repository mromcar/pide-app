'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useTranslation } from '@/hooks/useTranslation'
import AdminNavbar from '@/components/admin/AdminNavbar'
import ProtectedPage from '@/components/auth/ProtectedPage'
import MenuManagement from '@/components/admin/MenuManagement'
import type { LanguageCode } from '@/constants/languages'
import type { Establishment } from '@/types/entities/establishment'
import { UserRole } from '@/types/enums'

export default function MenuManagementPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const languageCode = params.lang as LanguageCode
  const { t } = useTranslation(languageCode)
  const [activeTab, setActiveTab] = useState('categories')

  const establishmentId = params.id as string
  const action = searchParams.get('action')

  // Estados para el establecimiento
  const [establishment, setEstablishment] = useState<Establishment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Función para obtener datos del establecimiento
  const fetchEstablishment = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/establishments/${establishmentId}`)

      if (!response.ok) {
        throw new Error(t.establishmentAdmin.establishment.error.failedToFetch)
      }

      const data = await response.json()
      setEstablishment(data)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t.establishmentAdmin.establishment.error.unknownError
      )
    } finally {
      setLoading(false)
    }
  }, [
    establishmentId,
    t.establishmentAdmin.establishment.error.failedToFetch,
    t.establishmentAdmin.establishment.error.unknownError,
  ])

  // Efectos
  useEffect(() => {
    if (action === 'add-category') setActiveTab('categories')
    if (action === 'add-product') setActiveTab('products')
  }, [action])

  useEffect(() => {
    if (status === 'loading') return

    if (!session?.user) {
      router.push(`/${languageCode}/login`)
      return
    }

    const userRole = session.user.role as UserRole

    // PASO 2a: Array de roles permitidos para gestión de menú
    const allowedRoles = [UserRole.ESTABLISHMENT_ADMIN, UserRole.GENERAL_ADMIN]

    // PASO 2b: Verificar permisos de rol
    if (!allowedRoles.includes(userRole)) {
      router.push(`/${languageCode}/access-denied`)
      return
    }

    // PASO 2c: Verificar pertenencia al establecimiento (excepto GENERAL_ADMIN)
    const requiresEstablishmentCheck = userRole !== UserRole.GENERAL_ADMIN
    if (
      requiresEstablishmentCheck &&
      session.user.establishmentId?.toString() !== establishmentId
    ) {
      router.push(`/${languageCode}/access-denied`)
      return
    }

    // Fetch establishment data
    if (!establishment) {
      fetchEstablishment()
    }
  }, [session, status, establishment, fetchEstablishment, establishmentId, languageCode, router])

  // Estados de carga y error
  if (status === 'loading') {
    return (
      <div className="establishment-admin-loading">
        <div className="establishment-admin-loading-content">
          <div className="establishment-admin-spinner"></div>
          <p className="establishment-admin-loading-text">
            {t.establishmentAdmin.establishment.loading}
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="admin-page">
        <AdminNavbar
          languageCode={languageCode}
          establishmentId={establishmentId}
          establishment={establishment}
        />
        <div className="establishment-admin-loading">
          <div className="establishment-admin-loading-content">
            <div className="establishment-admin-spinner"></div>
            <p className="establishment-admin-loading-text">
              {t.establishmentAdmin.establishment.loading}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="admin-page">
        <AdminNavbar
          languageCode={languageCode}
          establishmentId={establishmentId}
          establishment={establishment}
        />
        <div className="establishment-admin-error">
          <div className="establishment-admin-error-content">
            <h1 className="establishment-admin-error-title">
              {t.establishmentAdmin.establishment.error.title}
            </h1>
            <p className="establishment-admin-error-message">{error}</p>
            <button
              onClick={() => fetchEstablishment()}
              className="establishment-admin-error-button"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!session?.user || !establishment) {
    return null
  }

  return (
    <div className="admin-page">
      <AdminNavbar
        languageCode={languageCode}
        establishmentId={establishmentId}
        establishment={establishment}
      />

      <div className="establishment-admin-container">
        {/* PASO 2d: ProtectedPage con array de roles permitidos */}
        <ProtectedPage allowedRoles={[UserRole.ESTABLISHMENT_ADMIN, UserRole.GENERAL_ADMIN]}>
          <MenuManagement
            establishment={establishment}
            establishmentId={establishmentId}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            languageCode={languageCode}
          />
        </ProtectedPage>
      </div>
    </div>
  )
}
