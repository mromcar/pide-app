import { NextRequest } from 'next/server'
import { productVariantService } from '@/services/productVariant.service'
import { productService } from '@/services/product.service'
import { jsonOk, jsonError } from '@/utils/api'
import { z } from 'zod'
import logger from '@/lib/logger'

const paramsSchema = z.object({
  establishmentId: z.coerce.number().int().positive(),
})

const queryParamsSchema = z.object({
  productId: z.coerce.number().int().positive(),
})

/**
 * @swagger
 * /api/menu/{establishmentId}/variants:
 *   get:
 *     summary: Get all active variants for a specific product in public menu
 *     description: Public API to retrieve all active variants for a product without authentication
 *     tags:
 *       - Public Menu
 *     parameters:
 *       - in: path
 *         name: establishmentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the establishment
 *       - in: query
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the product to fetch variants for
 *     responses:
 *       200:
 *         description: Variants retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   variantId:
 *                     type: integer
 *                   productId:
 *                     type: integer
 *                   variantDescription:
 *                     type: string
 *                   price:
 *                     type: number
 *                   sku:
 *                     type: string
 *                   sortOrder:
 *                     type: integer
 *                   isActive:
 *                     type: boolean
 *       400:
 *         description: Invalid establishment ID or product ID
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
    const params = await paramsPromise
    const paramsValidation = paramsSchema.safeParse(params)

    if (!paramsValidation.success) {
      logger.warn('[PUBLIC API] Invalid establishment ID for variants:', { params })
      return jsonError(paramsValidation.error.issues, 400)
    }

    const { establishmentId } = paramsValidation.data

    const { searchParams } = new URL(req.url)
    const queryValidation = queryParamsSchema.safeParse({
      productId: searchParams.get('productId'),
    })

    if (!queryValidation.success) {
      logger.warn('[PUBLIC API] Invalid productId for variants:', {
        establishmentId,
        productId: searchParams.get('productId')
      })
      return jsonError(queryValidation.error.issues, 400)
    }

    const { productId } = queryValidation.data

    logger.info('[PUBLIC API] Fetching variants for product:', {
      establishmentId,
      productId
    })

    // 🌐 Verificar que el producto existe y pertenece al establecimiento (sin autenticación)
    const product = await productService.getProductById(productId)
    if (!product || product.establishmentId !== establishmentId) {
      logger.warn('[PUBLIC API] Product not found or does not belong to establishment:', {
        establishmentId,
        productId
      })
      return jsonError('Product not found or does not belong to this establishment', 404)
    }

    // 🌐 Obtener todas las variantes del producto sin paginación
    const allVariants = await productVariantService.getAllProductVariantsForProduct(
      productId,
      1, // página 1
      1000 // pageSize alto para obtener todas
    )

    // 🌐 Filtrar solo variantes activas para el público
    const activeVariants = allVariants.filter(variant =>
      variant.isActive && variant.establishmentId === establishmentId
    )

    logger.info('[PUBLIC API] Variants retrieved successfully:', {
      establishmentId,
      productId,
      totalVariants: allVariants.length,
      activeVariants: activeVariants.length
    })

    // 🌐 Devolver array directo de variantes (sin wrapper de paginación)
    return jsonOk(activeVariants)

  } catch (error: unknown) {
    let establishmentIdForErrorLog = 'unknown'
    let productIdForErrorLog = 'unknown'

    try {
      const params = await paramsPromise
      establishmentIdForErrorLog = params.establishmentId

      const { searchParams } = new URL(req.url)
      productIdForErrorLog = searchParams.get('productId') || 'unknown'
    } catch (paramsError) {
      logger.error('[PUBLIC API] Error resolving params for variants logging:', paramsError)
    }

    logger.error(`[PUBLIC API] Error fetching variants for establishment ${establishmentIdForErrorLog}, product ${productIdForErrorLog}:`, error)

    if (error instanceof z.ZodError) {
      return jsonError(error.issues, 400)
    }

    if (error instanceof Error) {
      return jsonError(error.message, 500)
    } else {
      return jsonError('An unexpected error occurred while fetching variants', 500)
    }
  }
}
