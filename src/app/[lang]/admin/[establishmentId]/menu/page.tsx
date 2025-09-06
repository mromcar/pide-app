'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import AuthGuard from '@/components/auth/AuthGuard'
import AdminNavbar from '@/components/admin/AdminNavbar'
import { MenuManagement } from '@/components/management/MenuManagement'
import { useTranslation } from '@/hooks/useTranslation'
import { getEstablishmentById } from '@/services/api/establishment.api'
import { UserRole } from '@/constants/enums'
import type { LanguageCode } from '@/constants/languages'
import type { EstablishmentResponseDTO } from '@/types/dtos/establishment'

interface EstablishmentMenuPageProps {
  params: Promise<{
    lang: LanguageCode
    establishmentId: string
  }>
}

export default function EstablishmentMenuPage({ params }: EstablishmentMenuPageProps) {
  const { data: session } = useSession()

  const [resolvedParams, setResolvedParams] = useState<{
    lang: LanguageCode
    establishmentId: string
  } | null>(null)

  const [establishment, setEstablishment] = useState<EstablishmentResponseDTO | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('categories')

  // ✅ Resolver params
  useEffect(() => {
    const resolveParams = async () => {
      const resolved = await params
      setResolvedParams(resolved)
    }
    resolveParams()
  }, [params])

  const { t } = useTranslation(resolvedParams?.lang || 'es')

  // ✅ Cargar establishment una vez que tenemos params y sesión
  useEffect(() => {
    if (!resolvedParams || !session?.user) return

    const fetchEstablishment = async () => {
      try {
        setLoading(true)
        setError(null)

        const establishmentId = parseInt(resolvedParams.establishmentId, 10)
        const data = await getEstablishmentById(establishmentId)

        if (!data) {
          throw new Error('Establishment not found')
        }

        setEstablishment(data)
        console.log('✅ Establishment loaded:', data.name)
      } catch (err) {
        console.error('❌ Error loading establishment:', err)
        setError(err instanceof Error ? err.message : 'Failed to load establishment')
      } finally {
        setLoading(false)
      }
    }

    fetchEstablishment()
  }, [resolvedParams, session])

  // ✅ Mostrar loading mientras se resuelven params
  if (!resolvedParams) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Cargando página...</p>
      </div>
    )
  }

  const { lang: languageCode, establishmentId } = resolvedParams
  const numericEstablishmentId = parseInt(establishmentId, 10)

  return (
    <AuthGuard
      allowedRoles={[
        UserRole.establishment_admin,
        UserRole.waiter,
        UserRole.cook,
        UserRole.general_admin,
      ]}
      establishmentId={numericEstablishmentId}
      languageCode={languageCode}
      requireEstablishmentMatch={true}
      fallback={
        <div className="admin-loading">
          <div className="loading-spinner"></div>
          <p>Verificando permisos...</p>
        </div>
      }
    >
      <div className="admin-page">
        <AdminNavbar
          languageCode={languageCode}
          establishmentId={establishmentId}
          establishment={establishment}
        />

        <div className="establishment-admin-container">
          {loading ? (
            <div className="admin-card">
              <div className="admin-card-body">
                <div className="loading-content">
                  <div className="loading-spinner"></div>
                  <p>{t.establishmentAdmin.menuManagement.loading}</p>
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="admin-card">
              <div className="admin-card-body">
                <div className="error-content">
                  <h3>Error</h3>
                  <p>{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="admin-btn admin-btn-primary"
                  >
                    Reintentar
                  </button>
                </div>
              </div>
            </div>
          ) : establishment ? (
            <>
              {/* Header del menú */}
              <div className="admin-card mb-6">
                <div className="admin-card-header">
                  <h2 className="admin-card-title">{t.establishmentAdmin.menuManagement.title}</h2>
                  <p className="admin-card-subtitle">{establishment.name}</p>
                </div>
              </div>

              {/* Componente de gestión de menú */}
              <MenuManagement
                establishmentId={establishmentId}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                languageCode={languageCode}
              />
            </>
          ) : (
            <div className="admin-card">
              <div className="admin-card-body">
                <p>No se pudo cargar la información del establecimiento.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  )
}
