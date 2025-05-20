// src/app/restaurant/[id]/menu/page.tsx
import '@/app/globals.css'
import type { CategoryWithRelations } from '@/types/menu' // Revisa si necesitas este tipo o si SerializedCategory es suficiente
import { getCategoriesWithProducts, getEstablishmentById } from '@/services/menu-services' // Asume que tienes estos servicios
import { serializeCategory } from '@/utils/serializers' // Tu serializador existente
import MenuClient from './components/MenuClient' // El componente cliente principal
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
  const languageCode = lang || 'es' // Idioma por defecto 'es'

  // Fetch de los datos iniciales
  const [categoriesRaw, establishment] = await Promise.all([
    getCategoriesWithProducts(establishmentId, languageCode),
    getEstablishmentById(establishmentId),
  ])

  // Serializa las categorías y filtra las que no tienen productos
  const serializedCategories = categoriesRaw
    .filter((cat) => cat.products?.length > 0)
    .map((category) => serializeCategory(category, languageCode))

  if (!establishment) {
    // Manejo de error si el establecimiento no se encuentra
    throw new Error(`Establishment ${establishmentId} not found`)
  }

  return (
    <MenuClient
      establishment={establishment}
      categories={serializedCategories}
      language={languageCode}
      // showProductsFromCategoryId={undefined} // Quitar si no lo usas o pasarlo según la lógica
    />
  )
}
