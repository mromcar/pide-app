import { establishmentApiService } from '@/services/api/establishment.api'
import { categoryApiService } from '@/services/api/category.api'
import { productApiService } from '@/services/api/product.api'
import MenuDisplay from '@/components/menu/MenuDisplay'
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
  const { restaurantId: restaurantIdString, lang } = params
  const t = getTranslation(lang)

  let establishmentName = ''
  const numericRestaurantId = parseInt(restaurantIdString, 10)

  if (!isNaN(numericRestaurantId)) {
    try {
      const establishment = await establishmentApiService.getEstablishmentById(numericRestaurantId)
      if (establishment) {
        establishmentName = establishment.name
      }
    } catch (error) {
      console.error('Failed to fetch establishment by ID for metadata', error)
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

async function getMenuDataForPage(numericRestaurantId: number): Promise<MenuCategory[]> {
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
  const { restaurantId: restaurantIdString, lang } = params
  const t = getTranslation(lang)

  const numericRestaurantId = parseInt(restaurantIdString, 10)

  if (isNaN(numericRestaurantId)) {
    return (
      <div className="menu-page-container menu-page-error">
        {t.restaurantMenu.invalidRestaurantIdError}
      </div>
    )
  }

  try {
    const [establishment, menuDataForDisplay] = await Promise.all([
      establishmentApiService.getEstablishmentById(numericRestaurantId),
      getMenuDataForPage(numericRestaurantId),
    ])

    const establishmentName = establishment?.name || ''

    if (!menuDataForDisplay || menuDataForDisplay.length === 0) {
      return (
        <div className="menu-page-container menu-page-info">{t.restaurantMenu.menuNoItems}</div>
      )
    }

    return (
      <div className="menu-page-container">
        <div className="menu-page-header">
          <h1 className="menu-page-title">
            {t.restaurantMenu.title} {establishmentName && `- ${establishmentName}`}
          </h1>
        </div>
        <MenuDisplay menu={menuDataForDisplay} lang={lang} />
      </div>
    )
  } catch (error: unknown) {
    console.error('Error fetching menu data for page:', error)
    const errorMessage = t.restaurantMenu.menuNotAvailableError
    return <div className="menu-page-container menu-page-error">{errorMessage}</div>
  }
}
