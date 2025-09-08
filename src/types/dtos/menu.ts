export type TranslationUpsert = {
  languageCode: 'es' | 'en' | 'fr'
  name: string
  description?: string | null
}

export type CategoryUpsertDTO = {
  order: number
  active: boolean
  translations: TranslationUpsert[]
}
export type CategoryResponseDTO = { id: number } & CategoryUpsertDTO

export type ProductUpsertDTO = {
  categoryId: number
  price: number
  active: boolean
  allergenIds: number[]
  translations: TranslationUpsert[]
}
export type ProductResponseDTO = { id: number } & ProductUpsertDTO

export type VariantUpsertDTO = {
  productId: number
  priceModifier: number
  active: boolean
  translations: TranslationUpsert[]
}
export type VariantResponseDTO = { id: number } & VariantUpsertDTO
