import '@/app/globals.css'
import type { CategoryWithRelations } from '@/types/menu'
import { getCategoriesWithProducts, getEstablishmentById } from '@/services/menu-services'
import { serializeCategory } from '@/utils/serializers'
import MenuClient from './components/MenuClient'
import type { LanguageCode } from '@/constants/languages'

export default async function Page({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { lang?: LanguageCode }
}) {
  const { id } = params
  const { lang } = searchParams
  const establishmentId = Number(id)
  const languageCode = lang || 'es'

  const [categoriesRaw, establishment] = await Promise.all([
    getCategoriesWithProducts(establishmentId, languageCode),
    getEstablishmentById(establishmentId),
  ])

  // Use serializeCategory from serializers.ts instead of local serialization
  const serializedCategories = categoriesRaw
    .filter((cat) => cat.products?.length > 0)
    .map((category) => serializeCategory(category, languageCode))

  if (!establishment) {
    throw new Error(`Establishment ${establishmentId} not found`)
  }

  return (
    <MenuClient
      establishment={establishment}
      categories={serializedCategories}
      language={languageCode}
      showProductsFromCategoryId={undefined}
    />
  )
}
