import MenuPageClient from '@/components/menu/MenuPageClient'
import { CategoryDTO } from '@/types/dtos/category'
import { ProductResponseDTO } from '@/types/dtos/product'
import { EstablishmentResponseDTO } from '@/types/dtos/establishment'
import { AllergenResponseDTO } from '@/types/dtos/allergen'
import { getTranslation } from '@/translations'
import { LanguageCode } from '@/constants/languages'
import type { Metadata } from 'next'
import { EstablishmentMenuPageProps } from '@/types/pages'
import { getApiUrl, debugUrls } from '@/lib/api-server'

interface MenuCategory extends CategoryDTO {
  products: ProductResponseDTO[]
}

interface MenuData {
  establishment: EstablishmentResponseDTO
  categories: MenuCategory[]
  allergens: AllergenResponseDTO[]
}

export async function generateMetadata({ params }: EstablishmentMenuPageProps): Promise<Metadata> {
  const resolvedParams = await params
  const { establishmentId: establishmentIdString, lang } = resolvedParams
  const t = getTranslation(lang as LanguageCode)

  let establishmentName = ''
  const numericEstablishmentId = parseInt(establishmentIdString, 10)

  if (!isNaN(numericEstablishmentId)) {
    try {
      console.log('🔍 Metadata: Fetching establishment for ID:', numericEstablishmentId)

      const response = await fetch(getApiUrl(`/api/menu/${numericEstablishmentId}`))

      if (response.ok) {
        const data = await response.json()
        establishmentName = data.establishment?.name || ''
        console.log('✅ Metadata: Establishment name found:', establishmentName)
      } else {
        console.warn('⚠️ Metadata: Failed to fetch establishment, status:', response.status)
      }
    } catch (error) {
      console.error('❌ Metadata: Error fetching establishment:', error)
    }
  } else {
    console.warn('⚠️ Metadata: Invalid establishmentId:', establishmentIdString)
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

    const apiUrl = getApiUrl(`/api/menu/${numericEstablishmentId}`)
    const response = await fetch(apiUrl, {
      next: { revalidate: 300 }, // 5 minutos
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      console.error('❌ MenuData: API response not ok:', {
        status: response.status,
        statusText: response.statusText,
        establishmentId: numericEstablishmentId,
        ...(process.env.NODE_ENV === 'development' && { apiUrl }),
      })
      throw new Error(`Failed to fetch menu data: ${response.status}`)
    }

    const data = await response.json()
    console.log('✅ MenuData: Raw API response received:', {
      hasEstablishment: !!data.establishment,
      categoriesCount: data.categories?.length || 0,
      allergensCount: data.allergens?.length || 0,
    })

    const activeCategories: MenuCategory[] = (data.categories || [])
      .filter((cat: MenuCategory) => cat.isActive)
      .map((category: MenuCategory) => {
        const activeProducts = (category.products || []).filter(
          (prod: ProductResponseDTO) => prod.isActive
        )
        return { ...category, products: activeProducts }
      })
      .filter((cat: MenuCategory) => cat.products.length > 0)

    console.log('🎯 MenuData: Processed menu data:', {
      establishmentName: data.establishment?.name,
      activeCategoriesCount: activeCategories.length,
      totalProductsCount: activeCategories.reduce(
        (sum: number, cat: MenuCategory) => sum + cat.products.length,
        0
      ),
    })

    return {
      establishment: data.establishment,
      categories: activeCategories,
      allergens: data.allergens || [],
    }
  } catch (error) {
    console.error('❌ MenuData: Error fetching menu:', {
      error: error instanceof Error ? error.message : error,
      establishmentId: numericEstablishmentId,
      ...(process.env.NODE_ENV === 'development' && {
        attemptedUrl: getApiUrl(`/api/menu/${numericEstablishmentId}`),
      }),
    })
    throw error
  }
}

export default async function EstablishmentMenuPage({ params }: EstablishmentMenuPageProps) {
  const resolvedParams = await params
  const { establishmentId: establishmentIdString, lang } = resolvedParams
  const t = getTranslation(lang)

  if (process.env.NODE_ENV === 'development') {
    debugUrls()
  }

  console.log('🚀 MenuPage: Starting with params:', { establishmentIdString, lang })
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
      console.warn('⚠️ MenuPage: No establishment found for ID:', numericEstablishmentId)
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
      console.warn('⚠️ MenuPage: No menu items for establishment:', numericEstablishmentId)
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

    console.log('✅ MenuPage: Rendering menu with:', {
      establishmentName: menuData.establishment.name,
      categoriesCount: menuData.categories.length,
    })

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
    console.error('❌ MenuPage: Error rendering page:', {
      error: error instanceof Error ? error.message : error,
      establishmentId: numericEstablishmentId,
    })

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
