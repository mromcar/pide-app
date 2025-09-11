import type { LanguageCode } from '@/constants/languages'
import type { MenuCategory, MenuProduct, ProductVariant } from '@/types/management/menu'
import type { CategoryDTO, CategoryCreateDTO, CategoryUpdateDTO } from '@/types/dtos/category'

// ✅ HELPER: Conversión de UI translations a DTO translations (UI → API)
function mapUITranslationsToDTO(
  uiTranslations: Record<LanguageCode, { name: string; description?: string }> | undefined
): Array<{ languageCode: string; name: string; description?: string }> {
  if (!uiTranslations) return []

  return Object.entries(uiTranslations)
    .filter(([_, trans]) => trans?.name?.trim())
    .map(([languageCode, trans]) => ({
      languageCode,
      name: trans.name.trim(),
      ...(trans.description && { description: trans.description.trim() })
    }))
}

// ✅ HELPER: Conversión de DTO translations a UI translations (API → UI)
function mapDTOTranslationsToUI(
  dtoTranslations: Array<{ languageCode: string; name: string; description?: string }> | undefined
): Record<LanguageCode, { name: string; description?: string }> {
  if (!dtoTranslations) return {} as any

  const result: Record<string, { name: string; description?: string }> = {}

  dtoTranslations.forEach(trans => {
    result[trans.languageCode] = {
      name: trans.name || '',
      ...(trans.description && { description: trans.description })
    }
  })

  return result as Record<LanguageCode, { name: string; description?: string }>
}

// ✅ HELPER: Conversión específica para categorías (solo name)
function mapUICategoryTranslationsToDTO(
  uiTranslations: Record<LanguageCode, { name: string }> | undefined
): Array<{ languageCode: string; name: string }> {
  if (!uiTranslations) return []

  return Object.entries(uiTranslations)
    .filter(([_, trans]) => trans?.name?.trim())
    .map(([languageCode, trans]) => ({
      languageCode,
      name: trans.name.trim()
    }))
}

// ✅ HELPER: Conversión específica para categorías (solo name)
export function mapDTOCategoryTranslationsToUI(
  dtoTranslations: Array<{ languageCode: string; name: string }> | undefined
): Record<LanguageCode, { name: string }> {
  if (!dtoTranslations) return {} as any

  const result: Record<string, { name: string }> = {}

  dtoTranslations.forEach(trans => {
    result[trans.languageCode] = {
      name: trans.name || ''
    }
  })

  return result as Record<LanguageCode, { name: string }>
}

// ✅ CategoryDTO → MenuCategory (UI)
export function mapCategoryDTOToUI(dto: CategoryDTO): MenuCategory {
  return {
    id: dto.categoryId,
    order: dto.sortOrder ?? 0,
    active: dto.isActive ?? true,
    translations: mapDTOCategoryTranslationsToUI(dto.translations),
  }
}

// ✅ MenuCategory (UI) → CategoryCreateDTO
export function mapCategoryUIToCreateDTO(ui: MenuCategory): CategoryCreateDTO {
  return {
    establishmentId: 0, // Will be set in the hook
    name: ui.translations.es?.name || ui.translations.en?.name || '',
    sortOrder: ui.order,
    isActive: ui.active,
    translations: mapUICategoryTranslationsToDTO(ui.translations),
  }
}

// ✅ MenuCategory (UI) → CategoryUpdateDTO
export function mapCategoryUIToUpdateDTO(ui: MenuCategory): CategoryUpdateDTO {
  return {
    name: ui.translations.es?.name || ui.translations.en?.name || '',
    sortOrder: ui.order,
    isActive: ui.active,
    translations: mapUICategoryTranslationsToDTO(ui.translations),
  }
}

// ✅ Partial updates - para toggle active/order changes
export function mapCategoryPartialToUpdateDTO(
  partial: Partial<Pick<MenuCategory, 'active' | 'order' | 'translations'>>
): CategoryUpdateDTO {
  const result: CategoryUpdateDTO = {}

  if (partial.active !== undefined) result.isActive = partial.active
  if (partial.order !== undefined) result.sortOrder = partial.order
  if (partial.translations !== undefined) {
    result.translations = mapUICategoryTranslationsToDTO(partial.translations)
  }

  return result
}

// ✅ Helper para preservar translations existentes en updates parciales
export function preserveExistingTranslations(
  current: MenuCategory,
  patch: Partial<MenuCategory>
): MenuCategory {
  return {
    ...current,
    ...patch,
    // Si patch no incluye translations, preservar las actuales
    translations: patch.translations || current.translations
  }
}

// Soporte de idiomas (ajusta si tienes más)
const SUPPORTED_LANGS = new Set<LanguageCode>(['es', 'en', 'fr'] as const)

// Utilidad: convierte traducciones de Prisma a diccionario por idioma
function toLangDict<T extends { languageCode: string }>(
  rows: T[] = [],
  pick: (row: T) => { name: string; description?: string | null }
): Record<LanguageCode, { name: string; description?: string | null }> {
  const out: Partial<Record<LanguageCode, { name: string; description?: string | null }>> = {}
  for (const r of rows) {
    const code = r.languageCode as LanguageCode
    if (SUPPORTED_LANGS.has(code)) out[code] = pick(r)
  }
  // fallbacks mínimos
  for (const lc of SUPPORTED_LANGS) {
    if (!out[lc]) out[lc] = { name: '', description: '' }
  }
  return out as Record<LanguageCode, { name: string; description?: string | null }>
}

// Utilidad específica para categorías (solo name, sin description)
function toCategoryLangDict<T extends { languageCode: string }>(
  rows: T[] = [],
  pick: (row: T) => { name: string }
): Record<LanguageCode, { name: string }> {
  const out: Partial<Record<LanguageCode, { name: string }>> = {}
  for (const r of rows) {
    const code = r.languageCode as LanguageCode
    if (SUPPORTED_LANGS.has(code)) out[code] = pick(r)
  }
  // fallbacks mínimos
  for (const lc of SUPPORTED_LANGS) {
    if (!out[lc]) out[lc] = { name: '' }
  }
  return out as Record<LanguageCode, { name: string }>
}

// Tipos DTO agregados usados por el panel admin
export type AdminMenuVariantDTO = ProductVariant
export type AdminMenuProductDTO = MenuProduct & { variants: AdminMenuVariantDTO[] }
export type AdminMenuCategoryDTO = MenuCategory & { products: AdminMenuProductDTO[] }

// Mapper Prisma -> DTO agregado (para endpoint admin agregado)
export function mapPrismaMenuToAdminDTO(categories: any[]): AdminMenuCategoryDTO[] {
  return (categories ?? []).map((c: any) => {
    const products: AdminMenuProductDTO[] = (c.products ?? []).map((p: any) => {
      const variants: AdminMenuVariantDTO[] = (p.variants ?? []).map((v: any) => ({
        id: Number(v.variantId ?? v.id),
        productId: Number(v.productId ?? p.productId ?? p.id),
        priceModifier: Number(v.priceModifier ?? v.priceDelta ?? v.price ?? 0),
        active: Boolean(v.isActive ?? v.active ?? true),
        translations: toLangDict(v.translations ?? [], (t: any) => ({
          name: t.variantDescription ?? t.name ?? '',
          description: t.description ?? null
        })),
      }))

      // precio como mínimo de variantes
      const minPrice =
        variants.length > 0
          ? variants.reduce((acc: number, v: AdminMenuVariantDTO) => Math.min(acc, v.priceModifier), Number.POSITIVE_INFINITY)
          : 0

      return {
        id: Number(p.productId ?? p.id),
        categoryId: Number(p.categoryId ?? c.categoryId ?? c.id),
        price: Number.isFinite(minPrice) ? minPrice : 0,
        active: Boolean(p.isActive ?? p.active ?? true),
        allergens: (p.allergens ?? [])
          .map((a: any) => Number(a.allergenId ?? a.id))
          .filter((x: number) => Number.isFinite(x)),
        translations: toLangDict(p.translations ?? [], (t: any) => ({
          name: t.name ?? '',
          description: t.description ?? null,
        })),
        variants,
      } satisfies AdminMenuProductDTO
    })

    return {
      id: Number(c.categoryId ?? c.id),
      order: Number(c.sortOrder ?? c.order ?? 0),
      active: Boolean(c.isActive ?? c.active ?? true),
      // Categories only have name, no description
      translations: toCategoryLangDict(c.translations ?? [], (t: any) => ({ name: t.name ?? '' })),
      products,
    } satisfies AdminMenuCategoryDTO
  })
}

export function mapProductDTOToUI(dto: any): MenuProduct {
  return {
    id: Number(dto.productId ?? dto.id),
    categoryId: Number(dto.categoryId ?? dto.category?.id ?? 0),
    price: Number(dto.price ?? dto.basePrice ?? 0),
    active: Boolean(dto.isActive ?? dto.active ?? true),
    allergens: (dto.allergens ?? [])
      .map((a: any) => Number(a.allergenId ?? a.id))
      .filter((x: number) => Number.isFinite(x)),
    translations:
      dto.translations && !Array.isArray(dto.translations)
        ? dto.translations
        : toLangDict(dto.translations ?? [], (t: any) => ({
            name: t.name ?? '',
            description: t.description ?? null,
          })),
  }
}

export function mapVariantDTOToUI(dto: any): ProductVariant {
  return {
    id: Number(dto.variantId ?? dto.id),
    productId: Number(dto.productId ?? 0),
    priceModifier: Number(dto.priceModifier ?? dto.priceDelta ?? dto.price ?? 0),
    active: Boolean(dto.isActive ?? dto.active ?? true),
    translations:
      dto.translations && !Array.isArray(dto.translations)
        ? dto.translations
        : toLangDict(dto.translations ?? [], (t: any) => ({
          name: t.variantDescription ?? t.name ?? '',
          description: t.description ?? null
        })),
  }
}

export function mapProductUIToDTO(ui: MenuProduct): any {
  return {
    id: ui.id,
    categoryId: ui.categoryId,
    price: ui.price,
    active: ui.active,
    allergens: ui.allergens,
    translations: ui.translations,
  }
}

export function mapVariantUIToDTO(ui: ProductVariant): any {
  return {
    id: ui.id,
    productId: ui.productId,
    priceModifier: ui.priceModifier,
    active: ui.active,
    translations: ui.translations,
  }
}
