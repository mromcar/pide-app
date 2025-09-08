import { NextRequest } from 'next/server'
import { z, ZodError } from 'zod'
import { requireAuth } from '@/middleware/auth-middleware'
import { jsonOk, jsonError } from '@/utils/api'
import { productUpsertSchema } from '@/schemas/menu'
import type { ProductResponseDTO as OptionAProduct, TranslationUpsert } from '@/types/dtos/menu'
import type { ProductResponseDTO as ProductDTO } from '@/types/dtos/product'
import type { ProductTranslationResponseDTO } from '@/types/dtos/productTranslation'
import { productService } from '@/services/product.service'

const paramsSchema = z.object({
  establishmentId: z.coerce.number().int().positive(),
})
const searchSchema = z.object({
  categoryId: z.coerce.number().int().positive().optional(),
})

type AllergenItem = { allergenId: number }
function isAllergenItem(a: unknown): a is AllergenItem {
  return !!a && typeof a === 'object' && typeof (a as Record<string, unknown>).allergenId === 'number'
}

function mapProductDTOToResponse(dto: ProductDTO): OptionAProduct {
  const translations: TranslationUpsert[] =
    (dto.translations ?? []).map((t: ProductTranslationResponseDTO) => ({
      languageCode: t.languageCode as TranslationUpsert['languageCode'],
      name: t.name,
      description: t.description ?? null,
    })) || []

  const rec = dto as unknown as Record<string, unknown>
  const allergensVal = rec.allergens
  const allergenIdsVal = rec.allergenIds
  const priceVal = rec.price
  const isActiveVal = rec.isActive

  const allergenIds: number[] = Array.isArray(allergensVal)
    ? (allergensVal as unknown[]).filter(isAllergenItem).map((a) => a.allergenId)
    : Array.isArray(allergenIdsVal)
    ? (allergenIdsVal as unknown[]).filter((n): n is number => typeof n === 'number')
    : []

  const price = typeof priceVal === 'number' ? priceVal : 0
  const active = typeof isActiveVal === 'boolean' ? isActiveVal : true

  return {
    id: dto.productId,
    categoryId: dto.categoryId,
    price,
    active,
    allergenIds,
    translations,
  }
}

export async function GET(req: NextRequest, { params: paramsPromise }: { params: Promise<{ establishmentId: string }> }) {
  try {
    await requireAuth()
    const { establishmentId } = paramsSchema.parse(await paramsPromise)
    const search = searchSchema.safeParse(Object.fromEntries(req.nextUrl.searchParams.entries()))
    const categoryId = search.success ? search.data.categoryId : undefined

    const products = await productService.getAllProducts(establishmentId, 1, 1000, categoryId)
    return jsonOk({ products: products.map(mapProductDTOToResponse) })
  } catch (error) {
    if (error instanceof Response) return error
    if (error instanceof ZodError) return jsonError(error.errors, 400)
    return jsonError(error instanceof Error ? error.message : 'Unexpected error', 500)
  }
}

export async function POST(req: NextRequest, { params: paramsPromise }: { params: Promise<{ establishmentId: string }> }) {
  try {
    const session = await requireAuth()
    const { establishmentId } = paramsSchema.parse(await paramsPromise)
    const validated = productUpsertSchema.parse(await req.json())

    const base = validated.translations.find(t => t.languageCode === 'es') ?? validated.translations[0]
    const created = await productService.createProduct(
      {
        establishmentId,
        categoryId: validated.categoryId,
        name: base.name,
        description: base.description ?? null,
        isActive: validated.active,
        allergenIds: validated.allergenIds,
        translations: validated.translations.map(t => ({
          languageCode: t.languageCode,
          name: t.name,
          description: t.description ?? null,
        })),
      },
      parseInt(session.user.id)
    )

    return jsonOk({ product: mapProductDTOToResponse(created) })
  } catch (error) {
    if (error instanceof Response) return error
    if (error instanceof ZodError) return jsonError(error.errors, 400)
    return jsonError(error instanceof Error ? error.message : 'Unexpected error', 500)
  }
}
