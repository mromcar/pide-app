import { NextRequest } from 'next/server'
import { z, ZodError } from 'zod'
import { requireAuth } from '@/middleware/auth-middleware'
import { jsonOk, jsonError } from '@/utils/api'
import { variantUpsertSchema } from '@/schemas/menu'
import type { VariantResponseDTO, TranslationUpsert } from '@/types/dtos/menu'
import type { ProductVariantResponseDTO } from '@/types/dtos/productVariant'
import type { ProductVariantTranslationResponseDTO } from '@/types/dtos/productVariantTranslation'
import { productVariantService } from '@/services/productVariant.service'

const paramsSchema = z.object({
  establishmentId: z.coerce.number().int().positive(),
  variantId: z.coerce.number().int().positive(),
})

function mapVariantDTOToResponse(dto: ProductVariantResponseDTO): VariantResponseDTO {
  const translations: TranslationUpsert[] =
    (dto.translations ?? []).map((t: ProductVariantTranslationResponseDTO) => ({
      languageCode: t.languageCode as TranslationUpsert['languageCode'],
      name: t.variantDescription ?? '',
      description: null,
    })) || []
  return {
    id: dto.variantId,
    productId: dto.productId,
    priceModifier: dto.price,
    active: dto.isActive ?? true,
    translations,
  }
}

export async function GET(_req: NextRequest, { params: paramsPromise }: { params: Promise<{ establishmentId: string; variantId: string }> }) {
  try {
    await requireAuth()
    const { variantId } = paramsSchema.parse(await paramsPromise)
    const found = await productVariantService.getProductVariantById(variantId)
    if (!found) return jsonError('Variant not found', 404)
    return jsonOk({ variant: mapVariantDTOToResponse(found) })
  } catch (error) {
    if (error instanceof Response) return error
    if (error instanceof ZodError) return jsonError(error.errors, 400)
    return jsonError(error instanceof Error ? error.message : 'Unexpected error', 500)
  }
}

export async function PUT(req: NextRequest, { params: paramsPromise }: { params: Promise<{ establishmentId: string; variantId: string }> }) {
  try {
    const session = await requireAuth()
    const { variantId } = paramsSchema.parse(await paramsPromise)
    const validated = variantUpsertSchema.parse(await req.json())

    const base = validated.translations.find(t => t.languageCode === 'es') ?? validated.translations[0]
    const updated = await productVariantService.updateProductVariant(
      variantId,
      {
        variantDescription: base.name,
        price: validated.priceModifier,
        isActive: validated.active,
        translations: validated.translations.map(t => ({ languageCode: t.languageCode, variantDescription: t.name })),
      },
      parseInt(session.user.id)
    )
    if (!updated) return jsonError('Failed to update variant', 500)
    return jsonOk({ variant: mapVariantDTOToResponse(updated) })
  } catch (error) {
    if (error instanceof Response) return error
    if (error instanceof ZodError) return jsonError(error.errors, 400)
    return jsonError(error instanceof Error ? error.message : 'Unexpected error', 500)
  }
}

export async function DELETE(_req: NextRequest, { params: paramsPromise }: { params: Promise<{ establishmentId: string; variantId: string }> }) {
  try {
    await requireAuth()
    const { variantId } = paramsSchema.parse(await paramsPromise)
    const deleted = await productVariantService.deleteProductVariant(variantId)
    if (!deleted) return jsonError('Failed to delete variant', 500)
    return jsonOk({ ok: true })
  } catch (error) {
    if (error instanceof Response) return error
    if (error instanceof ZodError) return jsonError(error.errors, 400)
    return jsonError(error instanceof Error ? error.message : 'Unexpected error', 500)
  }
}
