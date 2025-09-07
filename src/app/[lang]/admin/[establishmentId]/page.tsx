'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useTranslation } from '@/hooks/useTranslation'
import { EstablishmentAdminDashboard } from '@/components/admin/EstablishmentAdminDashboard'
import AdminNavbar from '@/components/admin/AdminNavbar'
import ProtectedPage from '@/components/auth/ProtectedPage'
import type { LanguageCode } from '@/constants/languages'
import type { EstablishmentResponseDTO } from '@/types/dtos/establishment'
import { getEstablishmentById } from '@/services/api/establishment.api'
import { UserRole } from '@/constants/enums'

interface EstablishmentAdminPageProps {
  params: Promise<{
    lang: LanguageCode
    establishmentId: string
  }>
}

export default function EstablishmentAdminPage({ params }: EstablishmentAdminPageProps) {
  const router = useRouter()
  const { data: session, status } = useSession()

  const [resolvedParams, setResolvedParams] = useState<{
    lang: LanguageCode
    establishmentId: string
  } | null>(null)

  const [establishment, setEstablishment] = useState<EstablishmentResponseDTO | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ✅ RESOLVER params de forma asíncrona
  useEffect(() => {
    const resolveParams = async () => {
      try {
        const resolved = await params
        setResolvedParams(resolved)
      } catch (err) {
        console.error('❌ Error resolving params:', err)
        setError('Failed to load page parameters')
        setLoading(false)
      }
    }
    resolveParams()
  }, [params])

  const { t } = useTranslation(resolvedParams?.lang || 'en')

  const fetchEstablishment = useCallback(
    async (establishmentId: string) => {
      try {
        setLoading(true)
        setError(null)

        const numericEstablishmentId = parseInt(establishmentId, 10)

        if (isNaN(numericEstablishmentId) || numericEstablishmentId <= 0) {
          throw new Error('Invalid establishment ID')
        }

        console.log('🔍 EstablishmentAdminPage: Fetching establishment:', numericEstablishmentId)

        const data = await getEstablishmentById(numericEstablishmentId)

        if (!data) {
          throw new Error(t.establishmentAdmin.error.failedToFetch)
        }

        setEstablishment(data)
        console.log('✅ EstablishmentAdminPage: Establishment loaded:', data.name)
      } catch (err) {
        console.error('❌ EstablishmentAdminPage: Error fetching establishment:', err)
        setError(err instanceof Error ? err.message : t.establishmentAdmin.error.unknownError)
      } finally {
        setLoading(false)
      }
    },
    [t]
  )

  // ✅ PROTECCIÓN DE RUTAS
  useEffect(() => {
    if (!resolvedParams) return

    const { lang: languageCode, establishmentId } = resolvedParams

    if (status === 'loading') {
      return
    }

    if (status === 'unauthenticated' || !session?.user) {
      console.log('🔒 EstablishmentAdminPage: No authenticated, redirecting to login')
      router.push(`/${languageCode}/login`)
      return
    }

    const allowedRoles: UserRole[] = [UserRole.establishment_admin, UserRole.waiter, UserRole.cook]
    if (!allowedRoles.includes(session.user.role as UserRole)) {
      console.log(
        '🚫 EstablishmentAdminPage: Insufficient permissions, redirecting to access-denied'
      )
      router.push(`/${languageCode}/access-denied`)
      return
    }

    if (
      session.user.establishmentId?.toString() !== establishmentId &&
      session.user.role !== UserRole.general_admin
    ) {
      console.log('🚫 EstablishmentAdminPage: Wrong establishment, redirecting to correct one')
      router.push(`/${languageCode}/admin/${session.user.establishmentId}`)
      return
    }

    console.log(
      '✅ EstablishmentAdminPage: User authenticated and authorized, loading establishment'
    )
    fetchEstablishment(establishmentId)
  }, [session, status, resolvedParams, fetchEstablishment, router])

  // ✅ LOADING states - COMPLETAMENTE TRADUCIDOS
  if (status === 'loading' || !resolvedParams) {
    return (
      <div className="establishment-admin-loading">
        <div className="establishment-admin-loading-content">
          <div className="establishment-admin-spinner"></div>
          <p className="establishment-admin-loading-text">{t.establishmentAdmin.forms.loading}</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated' || !session?.user) {
    return (
      <div className="establishment-admin-loading">
        <div className="establishment-admin-loading-content">
          <p className="establishment-admin-loading-text">{t.establishmentAdmin.loading}</p>
        </div>
      </div>
    )
  }

  const { lang: languageCode, establishmentId } = resolvedParams

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
            <p className="establishment-admin-loading-text">{t.establishmentAdmin.loading}</p>
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
            <h1 className="establishment-admin-error-title">{t.establishmentAdmin.error.title}</h1>
            <p className="establishment-admin-error-message">{error}</p>
            <button
              onClick={() => fetchEstablishment(establishmentId)}
              className="establishment-admin-error-button"
            >
              {t.establishmentAdmin.forms.save}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!establishment) {
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
        <ProtectedPage
          allowedRoles={[UserRole.establishment_admin, UserRole.waiter, UserRole.cook]}
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
