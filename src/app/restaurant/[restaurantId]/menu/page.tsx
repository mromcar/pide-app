import { establishmentApiService } from '@/services/api/establishment.api'
import { categoryApiService } from '@/services/api/category.api'
import { productApiService } from '@/services/api/product.api'
import MenuDisplay from '@/components/MenuDisplay'
import { CategoryDTO } from '@/types/dtos/category'
import { ProductResponseDTO } from '@/types/dtos/product'
import { uiTranslations } from '@/translations/ui'
import { LanguageCode, DEFAULT_LANGUAGE } from '@/constants/languages'
import type { Metadata } from 'next'

interface MenuCategory extends CategoryDTO {
  products: ProductResponseDTO[]
}

interface RestaurantMenuPageProps {
  params: { restaurantId: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata(
  { params, searchParams }: RestaurantMenuPageProps
): Promise<Metadata> {
  const awaitedParams = await params; // Await params
  const awaitedSearchParams = await searchParams; // Await searchParams

  const langParam = awaitedSearchParams?.lang;
  const lang = (Array.isArray(langParam) ? langParam[0] : langParam) || DEFAULT_LANGUAGE;
  const t = uiTranslations[lang as LanguageCode] || uiTranslations[DEFAULT_LANGUAGE];
  const restaurantIdString = awaitedParams.restaurantId;

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
      // Opcional: manejar el error, por ejemplo, no mostrar el nombre del establecimiento
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

async function getMenuDataForPage(
  restaurantIdString: string,
  lang: LanguageCode
): Promise<MenuCategory[]> {
  const numericRestaurantId = parseInt(restaurantIdString, 10)

  if (isNaN(numericRestaurantId)) {
    console.error('Invalid restaurant ID format for API calls:', restaurantIdString)
    throw new Error('Invalid restaurant ID format for API calls.')
  }

  // Ahora numericRestaurantId es un número validado.
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

export default async function RestaurantMenuPage({
  params,
  searchParams,
}: RestaurantMenuPageProps) {
  const awaitedParams = await params; // Await params
  const awaitedSearchParams = await searchParams; // Await searchParams

  const langParam = awaitedSearchParams?.lang;
  const lang = ((Array.isArray(langParam) ? langParam[0] : langParam) || DEFAULT_LANGUAGE) as LanguageCode;
  const restaurantIdString = awaitedParams.restaurantId;
  const translations = uiTranslations[lang] || uiTranslations[DEFAULT_LANGUAGE];

  const numericRestaurantId = parseInt(restaurantIdString, 10)

  if (isNaN(numericRestaurantId)) {
    return (
      <div className="container mx-auto p-4 text-center text-red-600">
        {translations.restaurantMenu.invalidRestaurantIdError}
      </div>
    )
  }

  try {
    // Pasamos restaurantIdString, getMenuDataForPage se encargará de parsear y validar de nuevo.
    // O podríamos pasar numericRestaurantId directamente si ya lo validamos aquí.
    // Para consistencia y evitar doble parseo, podemos pasar numericRestaurantId (ya validado).
    // Sin embargo, getMenuDataForPage espera un string, así que mantenemos restaurantIdString.
    // O mejor, ajustamos getMenuDataForPage para que acepte number.
    // Por simplicidad ahora, dejaremos que getMenuDataForPage parseé.
    const menuDataForDisplay = await getMenuDataForPage(restaurantIdString, lang)

    if (!menuDataForDisplay || menuDataForDisplay.length === 0) {
      return (
        <div className="container mx-auto p-4 text-center">
          {translations.restaurantMenu.menuNoItems}
        </div>
      )
    }

    return (
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-center">
          {/* Idealmente, el nombre del restaurante vendría aquí si se obtiene */}
          {translations.restaurantMenu.title}
        </h1>
        {/* Ajusta el prop de MenuDisplay si espera 'menu' en lugar de 'menuData' */}
        <MenuDisplay menuData={menuDataForDisplay} lang={lang} />
      </div>
    )
  } catch (error: any) {
    console.error('Error fetching menu data for page:', error)
    // Puedes personalizar el mensaje de error basado en el tipo de error si es necesario
    const errorMessage = translations.restaurantMenu.menuNotAvailableError
    // Ya no necesitamos el chequeo de "Incompatible ID" porque ahora solo manejamos numéricos
    // if (error.message && error.message.includes("Incompatible ID")) {
    //     errorMessage = "Error: Problema con la identificación del restaurante.";
    // }
    return <div className="container mx-auto p-4 text-center text-red-600">{errorMessage}</div>
  }
}
