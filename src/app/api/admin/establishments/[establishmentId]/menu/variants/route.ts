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
})
const searchSchema = z.object({
  productId: z.coerce.number().int().positive(),
})

function mapVariantDTOToResponse(dto: ProductVariantResponseDTO): VariantResponseDTO {
  const translations: TranslationUpsert[] =
    (dto.translations ?? []).map((t: ProductVariantTranslationResponseDTO) => ({
      languageCode: t.languageCode as TranslationUpsert['languageCode'],
      name: t.variantDescription ?? '',
      description: null,
    })) || []
  type MaybeActive = { isActive?: boolean }
  const active = (dto as MaybeActive).isActive ?? true
  return {
    id: dto.variantId,
    productId: dto.productId,
    priceModifier: dto.price,
    active,
    translations,
  }
}

/**
 * @swagger
 * /api/admin/establishments/{establishmentId}/menu/variants:
 *   get:
 *     summary: Get all variants for admin management
 *     description: Admin API to retrieve all variants (active and inactive) for a product with pagination
 *     tags:
 *       - Admin - Variants
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: establishmentId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the establishment
 *       - in: query
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the product to fetch variants for
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of variants per page
 *     responses:
 *       200:
 *         description: Variants retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ProductVariant'
 *       400:
 *         description: Invalid parameters
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Product not found or does not belong to establishment
 *       500:
 *         description: Internal server error
 */
export async function GET(
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ establishmentId: string }> }
) {
  try {
    await requireAuth()
    paramsSchema.parse(await paramsPromise)
    const { productId } = searchSchema.parse(Object.fromEntries(req.nextUrl.searchParams.entries()))
    const variants = await productVariantService.getAllProductVariantsForProduct(productId, 1, 1000)
    return jsonOk({ variants: variants.map(mapVariantDTOToResponse) })
  } catch (error) {
    if (error instanceof Response) return error
    if (error instanceof ZodError) return jsonError(error.errors, 400)
    return jsonError(error instanceof Error ? error.message : 'Unexpected error', 500)
  }
}

/**
 * @swagger
 * /api/admin/establishments/{establishmentId}/menu/variants:
 *   post:
 *     summary: Create a new variant
 *     description: Admin API to create a new variant for a product
 *     tags:
 *       - Admin - Variants
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: establishmentId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the establishment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductVariantCreate'
 *     responses:
 *       201:
 *         description: Variant created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 variant:
 *                   $ref: '#/components/schemas/ProductVariant'
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Product not found or does not belong to establishment
 *       500:
 *         description: Internal server error
 */
export async function POST(
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ establishmentId: string }> }
) {
  try {
    const session = await requireAuth()
    const { establishmentId } = paramsSchema.parse(await paramsPromise)
    const validated = variantUpsertSchema.parse(await req.json())

    const base = validated.translations.find(t => t.languageCode === 'es') ?? validated.translations[0]
    const created = await productVariantService.createProductVariant(
      {
        productId: validated.productId,
        establishmentId, // ← requerido por ProductVariantCreateDTO
        variantDescription: base.name,
        price: validated.priceModifier,
        isActive: validated.active,
        translations: validated.translations.map(t => ({ languageCode: t.languageCode, variantDescription: t.name })),
      },
      parseInt(session.user.id)
    )

    return jsonOk({ variant: mapVariantDTOToResponse(created) })
  } catch (error) {
    if (error instanceof Response) return error
    if (error instanceof ZodError) return jsonError(error.errors, 400)
    return jsonError(error instanceof Error ? error.message : 'Unexpected error', 500)
  }
}
