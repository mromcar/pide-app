'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useTranslation } from '@/hooks/useTranslation'
import AdminNavbar from '@/components/admin/AdminNavbar'
import ProtectedPage from '@/components/auth/ProtectedPage'
import { MenuManagement } from '@/components/management/MenuManagement' // ✅ USAR EL EXISTENTE
import type { LanguageCode } from '@/constants/languages'
import type { EstablishmentResponseDTO } from '@/types/dtos/establishment'
import { getEstablishmentById } from '@/services/api/establishment.api'
import { UserRole } from '@/constants/enums'

interface EstablishmentMenuPageProps {
  params: Promise<{
    lang: LanguageCode
    establishmentId: string
  }>
}

export default function EstablishmentMenuPage({ params }: EstablishmentMenuPageProps) {
  const router = useRouter()
  const { data: session, status } = useSession()

  const [resolvedParams, setResolvedParams] = useState<{
    lang: LanguageCode
    establishmentId: string
  } | null>(null)

  const [establishment, setEstablishment] = useState<EstablishmentResponseDTO | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('categories') // ✅ NUEVO: Estado para tab activo

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

        console.log('🔍 EstablishmentMenuPage: Fetching establishment:', numericEstablishmentId)

        const data = await getEstablishmentById(numericEstablishmentId)

        if (!data) {
          throw new Error(t.establishmentAdmin.establishment.error.failedToFetch)
        }

        setEstablishment(data)
        console.log('✅ EstablishmentMenuPage: Establishment loaded:', data.name)
      } catch (err) {
        console.error('❌ EstablishmentMenuPage: Error fetching establishment:', err)
        setError(
          err instanceof Error ? err.message : t.establishmentAdmin.establishment.error.unknownError
        )
      } finally {
        setLoading(false)
      }
    },
    [t]
  )

  useEffect(() => {
    if (!resolvedParams) return
    if (status === 'loading') return

    const { lang: languageCode, establishmentId } = resolvedParams

    if (!session?.user) {
      router.push(`/${languageCode}/login`)
      return
    }

    // ✅ PERMITIR también a waiter y cook ver el menú (solo lectura para algunos)
    const allowedRoles: UserRole[] = [
      UserRole.establishment_admin,
      UserRole.waiter,
      UserRole.cook,
      UserRole.general_admin,
    ]

    if (!allowedRoles.includes(session.user.role as UserRole)) {
      router.push(`/${languageCode}/access-denied`)
      return
    }

    // ✅ Redirigir al establishment correcto si es necesario
    if (
      session.user.establishmentId?.toString() !== establishmentId &&
      session.user.role !== UserRole.general_admin
    ) {
      console.log('🚫 EstablishmentMenuPage: Wrong establishment, redirecting to correct one')
      router.push(`/${languageCode}/admin/${session.user.establishmentId}/menu`)
      return
    }

    fetchEstablishment(establishmentId)
  }, [session, status, resolvedParams, fetchEstablishment, router])

  // ✅ LOADING states
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
            <p className="establishment-admin-loading-text">
              {t.establishmentAdmin.menuManagement.loading}
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
              onClick={() => fetchEstablishment(establishmentId)}
              className="establishment-admin-error-button"
            >
              {t.establishmentAdmin.forms.retry}
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
        <ProtectedPage
          allowedRoles={[
            UserRole.establishment_admin,
            UserRole.waiter,
            UserRole.cook,
            UserRole.general_admin,
          ]}
        >
          {/* ✅ HEADER del menú */}
          <div className="admin-card mb-6">
            <div className="admin-card-header">
              <h2 className="admin-card-title">{t.establishmentAdmin.menuManagement.title}</h2>
              <p className="admin-card-subtitle">{establishment.name}</p>
            </div>
          </div>

          {/* ✅ USAR el componente MenuManagement existente */}
          <MenuManagement
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
