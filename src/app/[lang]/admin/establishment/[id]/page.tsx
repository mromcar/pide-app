'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useTranslation } from '@/hooks/useTranslation'
import { EstablishmentAdminDashboard } from '@/components/admin/EstablishmentAdminDashboard'
import AdminNavbar from '@/components/admin/AdminNavbar'
import ProtectedPage from '@/components/auth/ProtectedPage'
import type { LanguageCode } from '@/constants/languages'
import type { Establishment } from '@/types/entities/establishment'
import { UserRole } from '@/types/enums'

export default function EstablishmentAdminPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const languageCode = params.lang as LanguageCode
  const { t } = useTranslation(languageCode)
  const establishmentId = params.id as string

  const [establishment, setEstablishment] = useState<Establishment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Memoizar la función fetch para evitar recreaciones
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

  // Simplificar dependencias del useEffect
  useEffect(() => {
    if (status === 'loading') return

    if (!session?.user) {
      router.push(`/${languageCode}/login`)
      return
    }

    // Check if user has establishment admin role
    const allowedRoles = [UserRole.ESTABLISHMENT_ADMIN, UserRole.WAITER, UserRole.COOK]
    if (!allowedRoles.includes(session.user.role as UserRole)) {
      router.push(`/${languageCode}/access-denied`)
      return
    }

    // Verificar que el usuario pertenece a este establecimiento
    if (
      session.user.establishmentId?.toString() !== establishmentId &&
      session.user.role !== UserRole.GENERAL_ADMIN
    ) {
      router.push(`/${languageCode}/access-denied`)
      return
    }

    // Solo fetch si no tenemos datos del establishment
    if (!establishment) {
      fetchEstablishment()
    }
  }, [session, status, establishment, fetchEstablishment, establishmentId, languageCode, router])

  // Loading state
  if (status === 'loading') {
    return (
      <div className="establishment-admin-loading">
        <div className="establishment-admin-loading-content">
          <div className="establishment-admin-spinner"></div>
          <p className="establishment-admin-loading-text">Cargando...</p>
        </div>
      </div>
    )
  }

  // Loading establishment
  if (loading) {
    return (
      <div className="admin-page">
        <AdminNavbar languageCode={languageCode} establishmentId={establishmentId} />
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

  // Error state
  if (error) {
    return (
      <div className="admin-page">
        <AdminNavbar languageCode={languageCode} establishmentId={establishmentId} />
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

  // Si no hay sesión o establishment, no mostrar nada
  if (!session?.user || !establishment) {
    return null
  }

  return (
    <div className="admin-page">
      <AdminNavbar
        languageCode={languageCode}
        establishmentId={establishmentId}
        establishment={establishment} // Pasar el establishment
      />

      <div className="establishment-admin-container">
        <ProtectedPage
          allowedRoles={[UserRole.ESTABLISHMENT_ADMIN, UserRole.WAITER, UserRole.COOK]}
        >
          <EstablishmentAdminDashboard
            establishment={establishment}
            establishmentId={establishmentId}
            languageCode={languageCode}
          />
        </ProtectedPage>
      </div>
    </div>
  )
}
