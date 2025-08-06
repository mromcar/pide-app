'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useTranslation } from '@/hooks/useTranslation'
import { EstablishmentAdminDashboard } from '@/components/admin/EstablishmentAdminDashboard'
import { ProtectedPage } from '@/components/auth/ProtectedPage'
import type { Establishment } from '@/types/entities/establishment'
import { DEFAULT_LANGUAGE } from '@/constants/languages'

export default function EstablishmentAdminPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const { t } = useTranslation(DEFAULT_LANGUAGE)
  const [establishment, setEstablishment] = useState<Establishment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const establishmentId = params.id as string
  const languageCode = DEFAULT_LANGUAGE

  useEffect(() => {
    if (status === 'loading') return

    if (!session?.user) {
      router.push('/login')
      return
    }

    if (!['establishment_admin', 'general_admin'].includes(session.user.role)) {
      router.push('/access-denied')
      return
    }

    fetchEstablishment()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, status, establishmentId])

  const fetchEstablishment = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/establishments/${establishmentId}`)

      if (!response.ok) {
        throw new Error('Failed to fetch establishment')
      }

      const data = await response.json()
      setEstablishment(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t.redirect.loading}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <ProtectedPage allowedRoles={['establishment_admin', 'general_admin']}>
      <EstablishmentAdminDashboard
        establishment={establishment}
        establishmentId={establishmentId}
        languageCode={languageCode}
      />
    </ProtectedPage>
  )
}
