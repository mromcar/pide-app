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
  productId: z.coerce.number().int().positive(),
})

function mapProductDTOToResponse(dto: ProductDTO): OptionAProduct {
  type AllergenItem = { allergenId: number }
  type ProductExtras = {
    allergens?: AllergenItem[]
    allergenIds?: number[]
    price?: number
    isActive?: boolean
  }
  const translations: TranslationUpsert[] =
    (dto.translations ?? []).map((t: ProductTranslationResponseDTO) => ({
      languageCode: t.languageCode as TranslationUpsert['languageCode'],
      name: t.name,
      description: t.description ?? null,
    })) || []

  const extra = dto as ProductExtras
  const allergenIds = Array.isArray(extra.allergens)
    ? extra.allergens.map((a: AllergenItem) => a.allergenId)
    : extra.allergenIds ?? []

  return {
    id: dto.productId,
    categoryId: dto.categoryId,
    price: extra.price ?? 0,
    active: extra.isActive ?? true,
    allergenIds,
    translations,
  }
}

export async function GET(_req: NextRequest, { params: paramsPromise }: { params: Promise<{ establishmentId: string; productId: string }> }) {
  try {
    await requireAuth()
    const { establishmentId, productId } = paramsSchema.parse(await paramsPromise)
    const found = await productService.getProductById(productId)
    if (!found || found.establishmentId !== establishmentId) return jsonError('Product not found', 404)
    return jsonOk({ product: mapProductDTOToResponse(found) })
  } catch (error) {
    if (error instanceof Response) return error
    if (error instanceof ZodError) return jsonError(error.errors, 400)
    return jsonError(error instanceof Error ? error.message : 'Unexpected error', 500)
  }
}

export async function PUT(req: NextRequest, { params: paramsPromise }: { params: Promise<{ establishmentId: string; productId: string }> }) {
  try {
    const session = await requireAuth()
    const { productId } = paramsSchema.parse(await paramsPromise)
    const validated = productUpsertSchema.parse(await req.json())

    const base = validated.translations.find(t => t.languageCode === 'es') ?? validated.translations[0]
    const updated = await productService.updateProduct(
      productId,
      {
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
    if (!updated) return jsonError('Failed to update product', 500)
    return jsonOk({ product: mapProductDTOToResponse(updated) })
  } catch (error) {
    if (error instanceof Response) return error
    if (error instanceof ZodError) return jsonError(error.errors, 400)
    return jsonError(error instanceof Error ? error.message : 'Unexpected error', 500)
  }
}

export async function DELETE(_req: NextRequest, { params: paramsPromise }: { params: Promise<{ establishmentId: string; productId: string }> }) {
  try {
    await requireAuth()
    const { productId } = paramsSchema.parse(await paramsPromise)
    const deleted = await productService.deleteProduct(productId)
    if (!deleted) return jsonError('Failed to delete product', 500)
    return jsonOk({ ok: true })
  } catch (error) {
    if (error instanceof Response) return error
    if (error instanceof ZodError) return jsonError(error.errors, 400)
    return jsonError(error instanceof Error ? error.message : 'Unexpected error', 500)
  }
}
