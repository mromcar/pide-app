'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import AuthGuard from '@/components/auth/AuthGuard'
import AdminNavbar from '@/components/admin/AdminNavbar'
import { MenuManagement } from '@/components/management/MenuManagement'
import { useTranslation } from '@/hooks/useTranslation'
import { getEstablishmentById } from '@/services/api/establishment.api'
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

  // ✅ Resolver params
  useEffect(() => {
    const resolveParams = async () => {
      const resolved = await params
      setResolvedParams(resolved)
    }
    resolveParams()
  }, [params])

  const { t } = useTranslation(resolvedParams?.lang || 'es')

  // ✅ Mostrar loading mientras se resuelven params
  if (!resolvedParams) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>{t.establishmentAdmin.forms.loading}</p>
      </div>
    )
  }

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
          throw new Error(t.establishmentAdmin.error.notFound)
        }

        setEstablishment(data)
        console.debug('establishment loaded', data.name)
      } catch (err) {
        console.debug('establishment load error', err)
        setError(err instanceof Error ? err.message : t.establishmentAdmin.error.failedToFetch)
      } finally {
        setLoading(false)
      }
    }

    fetchEstablishment()
  }, [resolvedParams, session, t])

  const { lang: languageCode, establishmentId } = resolvedParams

  return (
    <AuthGuard
      fallback={
        <div className="admin-loading">
          <div className="loading-spinner"></div>
          <p>{t.establishmentAdmin.messages.error.verifyingPermissions}</p>
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
                  <p>{t.establishmentAdmin.forms.loading}</p>
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="admin-card">
              <div className="admin-card-body">
                <div className="error-content">
                  <h3>{t.establishmentAdmin.messages.error.title}</h3>
                  <p>{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="admin-btn admin-btn-primary"
                  >
                    {t.establishmentAdmin.forms.retry}
                  </button>
                </div>
              </div>
            </div>
          ) : establishment ? (
            <>
              {/* Gestión de menú */}
              <MenuManagement establishmentId={establishmentId} languageCode={languageCode} />
            </>
          ) : (
            <div className="admin-card">
              <div className="admin-card-body">
                <p>{t.establishmentAdmin.error.failedToFetch}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  )
}
