'use client'

import { useState, useEffect } from 'react'
import { LanguageCode } from '@/constants/languages'
import { getPublicMenuData, PublicMenuDataResponse } from '@/services/api/establishment.api'
import MenuPageClient from '@/components/menu/MenuPageClient'

interface EmployeesPageProps {
  params: Promise<{
    lang: LanguageCode
    establishmentId: string
  }>
}

export default function EmployeesPage({ params }: EmployeesPageProps) {
  const [menuData, setMenuData] = useState<PublicMenuDataResponse | null>(null)
  const [lang, setLang] = useState<LanguageCode>('en')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        // ✅ RESOLVER params de forma asíncrona
        const resolvedParams = await params
        const { lang: paramLang, establishmentId } = resolvedParams

        setLang(paramLang)

        const numericEstablishmentId = parseInt(establishmentId, 10)

        if (isNaN(numericEstablishmentId) || numericEstablishmentId <= 0) {
          setError('Invalid establishment ID')
          setLoading(false)
          return
        }

        console.log(
          '🔍 EmployeesPage: Fetching menu data for establishment:',
          numericEstablishmentId
        )

        const data = await getPublicMenuData(numericEstablishmentId)

        if (!data || !data.establishment) {
          setError('Establishment not found')
          setLoading(false)
          return
        }

        setMenuData(data)
        console.log('✅ EmployeesPage: Menu data loaded successfully')
      } catch (err) {
        console.error('❌ EmployeesPage: Error loading data:', err)
        setError('Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [params])

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    )
  }

  if (error || !menuData || !menuData.establishment) {
    return (
      <div className="error-container">
        <div className="error-content">
          <h1>Error</h1>
          <p>{error || 'Failed to load establishment data'}</p>
        </div>
      </div>
    )
  }

  return (
    <MenuPageClient
      categories={menuData.categories}
      establishment={menuData.establishment}
      allergens={menuData.allergens}
      lang={lang}
    />
  )
}
