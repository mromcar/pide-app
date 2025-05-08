import '@/app/globals.css'
import type { Category, DBCategory } from '@/types/menu'
import { getCategoriesWithProducts, getEstablishmentById } from '@/services/menu-services'
import RestaurantMenu from './components/RestaurantMenu'

function serializeCategories(categories: DBCategory[]): Category[] {
  return categories.map((cat) => ({
    category_id: cat.category_id,
    establishment_id: cat.establishment_id,
    name: cat.name,
    image_url: cat.image_url,
    sort_order: cat.sort_order ?? 0,
    is_active: cat.is_active ?? true,
    translations: cat.CategoryTranslation ?? [],
    products: cat.products.map((prod) => ({
      product_id: prod.product_id,
      establishment_id: prod.establishment_id,
      category_id: prod.category_id,
      name: prod.name,
      description: prod.description,
      image_url: prod.image_url,
      sort_order: prod.sort_order ?? 0,
      is_active: prod.is_active ?? true,
      translations: prod.ProductTranslation ?? [],
      variants: prod.variants.map((variant) => ({
        variant_id: variant.variant_id,
        product_id: variant.product_id,
        establishment_id: variant.establishment_id,
        variant_description: variant.variant_description,
        price: variant.price.toNumber(),
        sku: variant.sku,
        sort_order: variant.sort_order ?? 0,
        is_active: variant.is_active ?? true,
        translations: variant.translations ?? [],
      })),
    })),
  }))
}

export default async function MenuPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { lang?: string }
}) {
  const { id } = params
  const { lang } = searchParams
  const establishmentId = Number(id)
  const languageCode = lang || 'es'

  const establishment = await getEstablishmentById(establishmentId)
  const categoriesRaw = await getCategoriesWithProducts(establishmentId, languageCode)

  const categories = serializeCategories(categoriesRaw)
  const categoriesWithProducts = categories.filter((cat) => cat.products && cat.products.length > 0)

  return (
    <RestaurantMenu
      establishment={establishment}
      categories={categoriesWithProducts}
      language={languageCode}
    />
  )
}
