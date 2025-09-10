import type { LanguageCode } from '@/constants/languages'
import type { MenuCategory, MenuProduct, ProductVariant } from '@/types/management/menu'
import type { CategoryDTO, CategoryUpdateDTO } from '@/types/dtos/category'

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

// Mappers DTO <-> UI usados por hooks/queries (categorías, productos, variantes)
export function mapCategoryDTOToUI(dto: CategoryDTO): MenuCategory {
  return {
    id: dto.categoryId,
    order: dto.sortOrder ?? 0,
    active: dto.isActive ?? true,
    translations: dto.translations?.reduce((acc: Record<LanguageCode, { name: string }>, t: any) => {
      acc[t.languageCode as LanguageCode] = {
        name: t.name,
        // No description for categories
      }
      return acc
    }, {} as Record<LanguageCode, { name: string }>) ?? {
      es: { name: dto.name },
      en: { name: '' },
      fr: { name: '' },
    },
  }
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

export function mapCategoryUIToDTO(ui: MenuCategory): CategoryUpdateDTO {
  return {
    name: ui.translations.es?.name || ui.translations.en?.name || '',
    sortOrder: ui.order,
    isActive: ui.active,
    translations: Object.entries(ui.translations).map(([lang, trans]) => ({
      languageCode: lang,
      name: trans.name,
      // No description for categories
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
