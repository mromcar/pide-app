'use client'

import { useEffect } from 'react'
import MenuDisplay from './MenuDisplay'
import { LanguageCode } from '@/constants/languages'
import type { CategoryDTO } from '@/types/dtos/category'
import type { ProductResponseDTO } from '@/types/dtos/product'
import { useCart } from '@/lib/cart-context'

interface MenuCategoryWithProducts extends CategoryDTO {
  products: ProductResponseDTO[]
}

interface MenuPageClientProps {
  menu: MenuCategoryWithProducts[]
  lang: LanguageCode
  restaurantId: number
}

export default function MenuPageClient({ menu, lang, restaurantId }: MenuPageClientProps) {
  const { setRestaurantId } = useCart()

  useEffect(() => {
    if (restaurantId) {
      setRestaurantId(restaurantId)

      if (typeof window !== 'undefined') {
        document.cookie = `currentRestaurantId=${restaurantId}; path=/; max-age=${60 * 60 * 24 * 30}`
      }
    }
  }, [restaurantId, setRestaurantId])

  return <MenuDisplay menu={menu} lang={lang} />
}
