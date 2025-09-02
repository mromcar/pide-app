'use client'

import { useEffect } from 'react'
import MenuDisplay from './MenuDisplay'
import { LanguageCode } from '@/constants/languages'
import type { CategoryDTO } from '@/types/dtos/category'
import type { ProductResponseDTO } from '@/types/dtos/product'
import type { EstablishmentResponseDTO } from '@/types/dtos/establishment'
import type { AllergenResponseDTO } from '@/types/dtos/allergen' // ✅ AÑADIDO
import { useCart } from '@/lib/cart-context'

interface MenuCategoryWithProducts extends CategoryDTO {
  products: ProductResponseDTO[]
}

interface MenuPageClientProps {
  menu: MenuCategoryWithProducts[]
  lang: LanguageCode
  establishmentId: number
  establishment: EstablishmentResponseDTO
  allergens: AllergenResponseDTO[] // ✅ ARREGLO: any[] → AllergenResponseDTO[]
}

export default function MenuPageClient({
  menu,
  lang,
  establishmentId,
  establishment,
  allergens,
}: MenuPageClientProps) {
  // ✅ AHORA SÍ FUNCIONA: setEstablishmentId existe en el context
  const { setEstablishmentId } = useCart()

  useEffect(() => {
    if (establishmentId) {
      console.log('🏪 MenuPageClient: Setting establishment ID in cart:', establishmentId)

      // ✅ FUNCIONA: Usar función del cart context
      setEstablishmentId(establishmentId)

      // ✅ NOTA: El cart context ya maneja la cookie, pero podemos dejarlo por consistencia
      if (typeof window !== 'undefined') {
        document.cookie = `currentEstablishmentId=${establishmentId}; path=/; max-age=${60 * 60 * 24 * 30}`
        console.log('🍪 MenuPageClient: Establishment ID stored in cookie:', establishmentId)
      }
    }
  }, [establishmentId, setEstablishmentId])

  console.log('🎨 MenuPageClient: Rendering with:', {
    establishmentName: establishment?.name,
    establishmentId,
    categoriesCount: menu?.length || 0,
    allergensCount: allergens?.length || 0,
  })

  return <MenuDisplay menu={menu} lang={lang} establishment={establishment} allergens={allergens} />
}
