import type { LanguageCode } from '@/constants/languages'
import type { MenuCategory, MenuProduct, ProductVariant } from '@/types/management/menu'
import type { CategoryDTO } from '@/types/dtos/category'
import type { CategoryTranslationCreateDTO } from '@/types/dtos/categoryTranslation'
import type { ProductResponseDTO } from '@/types/dtos/product'
import type { ProductTranslationCreateDTO } from '@/types/dtos/productTranslation'
import type { ProductVariantResponseDTO } from '@/types/dtos/productVariant'
import type { ProductVariantTranslationCreateDTO } from '@/types/dtos/productVariantTranslation'

const LANGS: LanguageCode[] = ['es', 'en', 'fr']

function blankRecord(): Record<LanguageCode, { name: string; description?: string | null }> {
  return {
    es: { name: '', description: null },
    en: { name: '', description: null },
    fr: { name: '', description: null },
  }
}

function toTransArray<T extends { name?: string; description?: string | null }>(
  rec: Record<LanguageCode, T>,
  map: (lang: LanguageCode, v: T) =>
    | CategoryTranslationCreateDTO
    | ProductTranslationCreateDTO
    | ProductVariantTranslationCreateDTO
) {
  return (Object.keys(rec) as LanguageCode[])
    .filter((l) => rec[l]?.name && rec[l]!.name!.trim().length > 0)
    .map((l) => map(l, rec[l]!))
}

// Category
export function mapCategoryDTOToUI(dto: CategoryDTO): MenuCategory {
  const base = blankRecord()
  dto.translations?.forEach((t) => {
    const lc = t.languageCode as LanguageCode
    if (LANGS.includes(lc)) base[lc] = { name: t.name, description: null }
  })
  return {
    id: dto.categoryId,
    order: dto.sortOrder ?? 0,
    active: dto.isActive ?? true,
    translations: base,
  }
}

export function mapCategoryUIToDTO(ui: MenuCategory) {
  return {
    sortOrder: ui.order,
    isActive: ui.active,
    // name base (ES o primera)
    name: ui.translations.es?.name ?? Object.values(ui.translations)[0]?.name ?? '',
    translations: toTransArray(ui.translations, (languageCode, v) => ({ languageCode, name: v.name || '' })),
  }
}

// Product
export function mapProductDTOToUI(dto: ProductResponseDTO): MenuProduct {
  const base = blankRecord()
  dto.translations?.forEach((t) => {
    const lc = t.languageCode as LanguageCode
    if (LANGS.includes(lc)) base[lc] = { name: t.name, description: t.description ?? null }
  })

  const rec = dto as unknown as Record<string, unknown>
  const allergens =
    Array.isArray(dto.allergens)
      ? dto.allergens.map((a) => a.allergenId)
      : Array.isArray(rec.allergenIds)
      ? (rec.allergenIds as unknown[]).filter((n): n is number => typeof n === 'number')
      : []

  const price = typeof rec.price === 'number' ? (rec.price as number) : 0
  const active = typeof rec.isActive === 'boolean' ? (rec.isActive as boolean) : true

  return {
    id: dto.productId,
    categoryId: dto.categoryId,
    price,
    active,
    allergens,
    translations: base,
  }
}

export function mapProductUIToDTO(ui: MenuProduct) {
  return {
    categoryId: ui.categoryId,
    isActive: ui.active,
    allergenIds: ui.allergens,
    name: ui.translations.es?.name ?? Object.values(ui.translations)[0]?.name ?? '',
    description: ui.translations.es?.description ?? Object.values(ui.translations)[0]?.description ?? null,
    translations: toTransArray(ui.translations, (languageCode, v) => ({
      languageCode,
      name: v.name || '',
      description: v.description ?? null,
    })) as ProductTranslationCreateDTO[],
  }
}

// Variant
export function mapVariantDTOToUI(dto: ProductVariantResponseDTO): ProductVariant {
  const base = blankRecord()
  dto.translations?.forEach((t) => {
    const lc = t.languageCode as LanguageCode
    if (LANGS.includes(lc)) base[lc] = { name: t.variantDescription ?? '', description: null }
  })
  return {
    id: dto.variantId,
    productId: dto.productId,
    priceModifier: dto.price,
    active: dto.isActive ?? true,
    translations: base,
  }
}

export function mapVariantUIToDTO(ui: ProductVariant) {
  return {
    productId: ui.productId,
    isActive: ui.active,
    variantDescription: ui.translations.es?.name ?? Object.values(ui.translations)[0]?.name ?? '',
    price: ui.priceModifier,
    translations: toTransArray(ui.translations, (languageCode, v) => ({
      languageCode,
      variantDescription: v.name || '',
    })) as ProductVariantTranslationCreateDTO[],
  }
}
