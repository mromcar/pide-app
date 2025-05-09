import '@/app/globals.css'
import type { Category, SerializedCategory } from '@/types/menu'
import { getCategoriesWithProducts, getEstablishmentById } from '@/services/menu-services'
import { getTranslation } from '@/utils/translations'
import MenuClient from './components/MenuClient'

function serializeCategories(categories: Category[], languageCode: string): Category[] {
  return categories.map((cat) => ({
    category_id: cat.category_id,
    establishment_id: cat.establishment_id,
    name: getTranslation(cat, cat.CategoryTranslation, languageCode),
    image_url: cat.image_url,
    sort_order: cat.sort_order ?? 0,
    is_active: cat.is_active ?? true,
    translations: cat.CategoryTranslation ?? [],
    products: (cat.products ?? []).map((prod) => ({
      product_id: prod.product_id,
      establishment_id: prod.establishment_id,
      category_id: prod.category_id,
      name: getTranslation(prod, prod.translations, languageCode),
      description: prod.description,
      image_url: prod.image_url,
      sort_order: prod.sort_order ?? 0,
      is_active: prod.is_active ?? true,
      translations: prod.translations ?? [],
      allergens: (prod.allergens ?? []).map((allergenRelation) => ({
        product_id: prod.product_id,
        allergen_id: allergenRelation.allergen_id,
        allergen: {
          allergen_id: allergenRelation.allergen.allergen_id,
          code: allergenRelation.allergen.code,
          name: getTranslation(
            allergenRelation.allergen,
            allergenRelation.allergen.translations,
            languageCode
          ),
          description: allergenRelation.allergen.description,
          icon_url: allergenRelation.allergen.icon_url,
          is_major_allergen: allergenRelation.allergen.is_major_allergen,
          translations: allergenRelation.allergen.translations ?? [],
        },
      })),
      variants: (prod.variants ?? []).map((variant) => ({
        variant_id: variant.variant_id,
        product_id: variant.product_id,
        establishment_id: variant.establishment_id,
        variant_description: variant.variant_description,
        price: variant.price,
        sku: variant.sku,
        sort_order: variant.sort_order ?? 0,
        is_active: variant.is_active ?? true,
        translations: variant.translations ?? [],
      })),
    })),
  }))
}

export default async function Page({
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

  const categoriesRaw = await getCategoriesWithProducts(establishmentId, languageCode)
  const categories = serializeCategories(categoriesRaw, languageCode)

  const establishment = await getEstablishmentById(establishmentId)
  const categoriesWithProducts = categories.filter((cat) => cat.products && cat.products.length > 0)

  const serializedCategories = categoriesWithProducts.map((category) => {
    const categoryTranslation = category.translations?.find(
      (t) => t.language_code === languageCode
    )

    return {
      ...category,
      name: categoryTranslation?.name ?? category.name,
      products: (category.products ?? []).map((product) => ({
        ...product,
        translations: product.translations ?? [],
        variants: product.variants ?? [],
        allergens: product.allergens ?? [],
      })),
    } as SerializedCategory
  })

  return (
    <MenuClient
      establishment={establishment}
      categories={serializedCategories}
      language={languageCode}
      showProductsFromCategoryId={undefined}
    />
  )
}
