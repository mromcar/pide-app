import type { LanguageCode } from '@/constants/languages'

export type MenuCategory = {
  id: number
  order: number
  active: boolean
  translations: Record<LanguageCode, { name: string; description?: string | null }>
}

export type MenuProduct = {
  id: number
  categoryId: number
  price: number
  active: boolean
  allergens: number[]
  translations: Record<LanguageCode, { name: string; description?: string | null }>
}

export type ProductVariant = {
  id: number
  productId: number
  priceModifier: number
  active: boolean
  translations: Record<LanguageCode, { name: string; description?: string | null }>
}

export type DrawerEntity =
  | { type: 'category'; mode: 'create' | 'edit'; data?: MenuCategory; context?: { orderHint?: number } }
  | { type: 'product'; mode: 'create' | 'edit'; data?: MenuProduct; context?: { categoryId: number } }
  | { type: 'variant'; mode: 'create' | 'edit'; data?: ProductVariant; context?: { productId: number } }

// UI helper for allergens
export type UIAllergen = { id: number; name: string }
