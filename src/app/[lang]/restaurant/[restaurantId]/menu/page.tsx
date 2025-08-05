import { establishmentApiService } from '@/services/api/establishment.api'
import { categoryApiService } from '@/services/api/category.api'
import { productApiService } from '@/services/api/product.api'
import MenuPageClient from '@/components/menu/MenuPageClient'
import { CategoryDTO } from '@/types/dtos/category'
import { ProductResponseDTO } from '@/types/dtos/product'
import { getTranslation } from '@/translations'
import { LanguageCode, DEFAULT_LANGUAGE } from '@/constants/languages'
import type { Metadata } from 'next'

interface MenuCategory extends CategoryDTO {
  products: ProductResponseDTO[]
}

interface RestaurantMenuPageProps {
  params: { restaurantId: string; lang: LanguageCode }
}

export async function generateMetadata({ params }: RestaurantMenuPageProps): Promise<Metadata> {
  const resolvedParams = await params
  const { restaurantId: restaurantIdString, lang } = resolvedParams
  const t = getTranslation(lang as LanguageCode)

  let establishmentName = ''
  const numericRestaurantId = parseInt(restaurantIdString, 10)

  if (!isNaN(numericRestaurantId)) {
    try {
      const establishment = await establishmentApiService.getEstablishmentById(numericRestaurantId)
      if (establishment) {
        establishmentName = establishment.name
      }
    } catch (e) {
      console.error('Failed to fetch establishment by ID for metadata', e)
    }
  } else {
    console.warn('Invalid numeric restaurantId for metadata:', restaurantIdString)
  }

  const pageTitle = establishmentName
    ? `${t.restaurantMenu.title} - ${establishmentName}`
    : t.restaurantMenu.title

  return {
    title: pageTitle,
    description:
      t.restaurantMenu.description ||
      `Explora el menú de ${establishmentName || 'nuestro restaurante'}.`,
  }
}

async function getMenuDataForPage(restaurantIdString: string): Promise<MenuCategory[]> {
  const numericRestaurantId = parseInt(restaurantIdString, 10)

  if (isNaN(numericRestaurantId)) {
    console.error('Invalid restaurant ID format for API calls:', restaurantIdString)
    throw new Error('Invalid restaurant ID format for API calls.')
  }

  const categories = await categoryApiService.getAllCategoriesByEstablishment(numericRestaurantId)
  const activeCategories = categories.filter((cat) => cat.is_active)
  const menu: MenuCategory[] = []

  for (const category of activeCategories) {
    const products = await productApiService.getAllProductsByRestaurant(
      numericRestaurantId,
      category.category_id
    )
    const activeProducts = products.filter((prod) => prod.is_active)
    if (activeProducts.length > 0) {
      menu.push({ ...category, products: activeProducts })
    }
  }
  return menu.filter((cat) => cat.products.length > 0)
}

export default async function RestaurantMenuPage({ params }: RestaurantMenuPageProps) {
  const resolvedParams = await params
  const { restaurantId: restaurantIdString, lang } = resolvedParams
  const t = getTranslation(lang)

  const numericRestaurantId = parseInt(restaurantIdString, 10)

  let establishmentName = ''
  try {
    const establishment = await establishmentApiService.getEstablishmentById(numericRestaurantId)
    if (establishment) {
      establishmentName = establishment.name
    }
  } catch (error) {
    console.error('Failed to fetch establishment name for page title', error)
  }

  if (isNaN(numericRestaurantId)) {
    return <div className="menu-page-error">{t.restaurantMenu.invalidRestaurantIdError}</div>
  }

  try {
    const menuDataForDisplay = await getMenuDataForPage(restaurantIdString)

    if (!menuDataForDisplay || menuDataForDisplay.length === 0) {
      return <div className="menu-page-info">{t.restaurantMenu.menuNoItems}</div>
    }

    return (
      <div className="menu-page-container">
        <div className="menu-page-header" style={{ justifyContent: 'center' }}>
          <h1 className="menu-page-title">{establishmentName}</h1>
        </div>
        <MenuPageClient menu={menuDataForDisplay} lang={lang} restaurantId={numericRestaurantId} />
      </div>
    )
  } catch (error: unknown) {
    console.error('Error fetching menu data for page:', error)
    const errorMessage = t.restaurantMenu.menuNotAvailableError
    return <div className="menu-page-error">{errorMessage}</div>
  }
}
