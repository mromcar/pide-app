import '@/app/globals.css'
import { Decimal } from '@prisma/client'
import { getCategoriesWithProducts, getEstablishmentById } from '@/services/productos.service'
import CartaCliente from './CartaCliente'

// Types matching your new schema
type ProductVariantTranslation = {
  translation_id: number
  language_code: string
  variant_description: string
}

type ProductVariant = {
  variant_id: number
  product_id: number
  establishment_id: number
  variant_description: string
  price: Decimal
  sku?: string
  sort_order?: number
  is_active?: boolean
  translations: ProductVariantTranslation[]
}

type ProductTranslation = {
  translation_id: number
  product_id: number
  language_code: string
  name: string
  description?: string
}

type Product = {
  product_id: number
  establishment_id: number
  category_id: number
  name: string
  description?: string
  image_url?: string
  sort_order?: number
  is_active?: boolean
  translations: ProductTranslation[]
  variants: ProductVariant[]
}

type CategoryTranslation = {
  translation_id: number
  category_id: number
  language_code: string
  name: string
}

type Category = {
  category_id: number
  establishment_id: number
  name: string
  image_url?: string
  sort_order?: number
  is_active?: boolean
  translations?: CategoryTranslation[]
  products: Product[]
}

type Establishment = {
  establishment_id: number
  name: string
  description?: string
  website?: string
  is_active: boolean
  accepts_orders: boolean
}

// Serializers to adapt DB data to your frontend types
function serializeCategories(categories: any[]): Category[] {
  return categories.map((cat) => ({
    category_id: cat.category_id,
    establishment_id: cat.establishment_id,
    name: cat.name,
    image_url: cat.image_url ?? undefined,
    sort_order: cat.sort_order ?? 0,
    is_active: cat.is_active,
    products: cat.products.map((prod: any) => ({
      product_id: prod.product_id,
      establishment_id: prod.establishment_id,
      category_id: prod.category_id,
      name: prod.name,
      description: prod.description ?? undefined,
      image_url: prod.image_url ?? undefined,
      sort_order: prod.sort_order ?? 0,
      is_active: prod.is_active,
      translations:
        prod.translations?.map((tr: any) => ({
          translation_id: tr.translation_id,
          product_id: prod.product_id,
          language_code: tr.language_code,
          name: tr.name,
          description: tr.description ?? undefined,
        })) ?? [],
      variants:
        prod.variants?.map((variant: any) => ({
          variant_id: variant.variant_id,
          product_id: prod.product_id,
          establishment_id: variant.establishment_id,
          variant_description: variant.variant_description,
          price: variant.price,
          sku: variant.sku ?? undefined,
          sort_order: variant.sort_order ?? 0,
          is_active: variant.is_active,
          translations:
            variant.translations?.map((vtr: any) => ({
              translation_id: vtr.translation_id,
              language_code: vtr.language_code,
              variant_description: vtr.variant_description,
            })) ?? [],
        })) ?? [],
    })),
    translations:
      cat.translations?.map((ctr: any) => ({
        translation_id: ctr.translation_id,
        category_id: cat.category_id,
        language_code: ctr.language_code,
        name: ctr.name,
      })) ?? [],
  }))
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ lang?: string }>
}) {
  const { id } = await params
  const { lang } = await searchParams
  const establishmentId = Number(id)
  const languageCode = lang || 'es'

  const establishment = await getEstablishmentById(establishmentId)
  const categoriesRaw = await getCategoriesWithProducts(establishmentId, languageCode)

  const categories = serializeCategories(categoriesRaw)
  const categoriesWithProducts = categories.filter((cat) => cat.products && cat.products.length > 0)

  if (categoriesWithProducts.length === 1) {
    return (
      <CartaCliente
        establishment={establishment}
        categories={categoriesWithProducts}
        language={languageCode}
        showProductsFromCategoryId={categoriesWithProducts[0].category_id}
      />
    )
  }

  return (
    <CartaCliente
      establishment={establishment}
      categories={categoriesWithProducts}
      language={languageCode}
    />
  )
}
