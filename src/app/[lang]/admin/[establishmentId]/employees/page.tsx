'use client'

import { useParams } from 'next/navigation'
import { useTranslation } from '@/hooks/useTranslation'
import EmployeeManagement from '@/components/employee/EmployeeManagement'
import { ProtectedPage } from '@/components/auth/ProtectedPage'
import { AdminLayout } from '@/components/admin/AdminLayout'
import type { LanguageCode } from '@/constants/languages'
import { UserRole } from '@/constants/enums'
import MenuPageClient from '@/components/menu/MenuPageClient'
import { CategoryDTO } from '@/types/dtos/category'
import { ProductResponseDTO } from '@/types/dtos/product'
import { EstablishmentResponseDTO } from '@/types/dtos/establishment'
import { AllergenResponseDTO } from '@/types/dtos/allergen'
import { getTranslation } from '@/translations'
import { getApiUrl, debugUrls } from '@/lib/api-server'
import type { Metadata } from 'next'

interface MenuCategory extends CategoryDTO {
  products: ProductResponseDTO[]
}

interface MenuData {
  establishment: EstablishmentResponseDTO
  categories: MenuCategory[]
  allergens: AllergenResponseDTO[]
}

interface MenuPageProps {
  params: Promise<{
    lang: LanguageCode
    establishmentId: string
  }>
}

export async function generateMetadata({ params }: MenuPageProps): Promise<Metadata> {
  const { establishmentId: establishmentIdString, lang } = await params
  const t = getTranslation(lang)

  let establishmentName = ''
  const numericEstablishmentId = parseInt(establishmentIdString, 10)

  if (!isNaN(numericEstablishmentId)) {
    try {
      console.log('🔍 Metadata: Fetching establishment for ID:', numericEstablishmentId)

      // ✅ CORREGIDO: Usar ruta backend correcta
      const response = await fetch(getApiUrl(`/api/menu/${numericEstablishmentId}`))

      if (response.ok) {
        const data = await response.json()
        establishmentName = data.establishment?.name || ''
        console.log('✅ Metadata: Establishment name found:', establishmentName)
      }
    } catch (error) {
      console.error('❌ Metadata: Error fetching establishment:', error)
    }
  }

  const pageTitle = establishmentName
    ? `${t.restaurantMenu.title} - ${establishmentName}`
    : t.restaurantMenu.title

  return {
    title: pageTitle,
    description:
      t.restaurantMenu.description ||
      `Explora el menú de ${establishmentName || 'nuestro restaurante'}.`,
    openGraph: {
      title: pageTitle,
      description: t.restaurantMenu.description || 'Explora nuestro delicioso menú',
    },
  }
}

async function getMenuDataForPage(numericEstablishmentId: number): Promise<MenuData | null> {
  try {
    console.log('🔍 MenuData: Fetching complete menu for establishment:', numericEstablishmentId)

    // ✅ CORREGIDO: Usar ruta backend correcta para menú público
    const apiUrl = getApiUrl(`/api/menu/${numericEstablishmentId}`)
    const response = await fetch(apiUrl, {
      next: { revalidate: 300 }, // 5 minutos
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
      console.error('❌ MenuData: API response not ok:', {
        status: response.status,
        statusText: response.statusText,
        establishmentId: numericEstablishmentId,
      })
      return null
    }

    const data = await response.json()

    const activeCategories: MenuCategory[] = (data.categories || [])
      .filter((cat: MenuCategory) => cat.isActive)
      .map((category: MenuCategory) => {
        const activeProducts = (category.products || []).filter(
          (prod: ProductResponseDTO) => prod.isActive
        )
        return { ...category, products: activeProducts }
      })
      .filter((cat: MenuCategory) => cat.products.length > 0)

    return {
      establishment: data.establishment,
      categories: activeCategories,
      allergens: data.allergens || [],
    }
  } catch (error) {
    console.error('❌ MenuData: Error fetching menu:', error)
    return null
  }
}

export default async function MenuPage({ params }: MenuPageProps) {
  const { establishmentId: establishmentIdString, lang } = await params
  const t = getTranslation(lang)

  if (process.env.NODE_ENV === 'development') {
    debugUrls()
  }

  const numericEstablishmentId = parseInt(establishmentIdString, 10)

  if (isNaN(numericEstablishmentId) || numericEstablishmentId <= 0) {
    console.error('❌ MenuPage: Invalid establishment ID:', establishmentIdString)
    return (
      <div className="menu-page-container menu-page-error">
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-8">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            {t.restaurantMenu.invalidEstablishmentIdError || 'Invalid establishment ID'}
          </h1>
          <p className="text-gray-600">
            {t.restaurantMenu.description || 'Please check the URL and try again.'}
          </p>
        </div>
      </div>
    )
  }

  try {
    const menuData = await getMenuDataForPage(numericEstablishmentId)

    if (!menuData || !menuData.establishment) {
      return (
        <div className="menu-page-container menu-page-error">
          <div className="flex flex-col items-center justify-center min-h-[50vh] p-8">
            <h1 className="text-2xl font-bold text-amber-600 mb-4">
              {t.restaurantMenu.establishmentNotFound || 'Establishment not found'}
            </h1>
            <p className="text-gray-600">
              {t.restaurantMenu.description || 'This establishment may not be available.'}
            </p>
          </div>
        </div>
      )
    }

    if (!menuData.categories || menuData.categories.length === 0) {
      return (
        <div className="menu-page-container menu-page-info">
          <div className="flex flex-col items-center justify-center min-h-[50vh] p-8">
            <h1 className="text-xl font-semibold text-blue-600 mb-4">
              {t.restaurantMenu.menuNoItems || 'Menu not available'}
            </h1>
            <p className="text-gray-600">
              {menuData.establishment.name} is currently updating their menu.
            </p>
          </div>
        </div>
      )
    }

    return (
      <div className="menu-page-container">
        <div className="menu-page-header" style={{ justifyContent: 'center' }}>
          <h1 className="menu-page-title">{menuData.establishment.name}</h1>
        </div>

        <MenuPageClient
          menu={menuData.categories}
          lang={lang}
          establishmentId={numericEstablishmentId}
          establishment={menuData.establishment}
          allergens={menuData.allergens}
        />
      </div>
    )
  } catch (error: unknown) {
    console.error('❌ MenuPage: Error rendering page:', error)
    return (
      <div className="menu-page-container menu-page-error">
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-8">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            {t.restaurantMenu.menuNotAvailableError || 'Menu temporarily unavailable'}
          </h1>
          <p className="text-gray-600 text-center">
            {t.restaurantMenu.description || 'Please try again later or contact support.'}
          </p>
        </div>
      </div>
    )
  }
}
