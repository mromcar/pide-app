import { NextRequest } from 'next/server'
import { productService } from '@/services/product.service'
import { jsonOk, jsonError } from '@/utils/api'
import { z } from 'zod'
import logger from '@/lib/logger'

const paramsSchema = z.object({
  establishmentId: z.coerce.number().int().positive(),
})

/**
 * @swagger
 * /api/menu/{establishmentId}/products:
 *   get:
 *     summary: Get all active products for public menu
 *     description: Public API to retrieve all active products for an establishment without authentication
 *     tags:
 *       - Public Menu
 *     parameters:
 *       - in: path
 *         name: establishmentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the establishment to retrieve products for
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: integer
 *         description: Optional filter by category ID
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   productId:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   description:
 *                     type: string
 *                   categoryId:
 *                     type: integer
 *                   isActive:
 *                     type: boolean
 *                   allergens:
 *                     type: array
 *                   sortOrder:
 *                     type: integer
 *                   variants:
 *                     type: array
 *       400:
 *         description: Invalid establishment ID
 *       500:
 *         description: Internal server error
 */
export async function GET(
  request: NextRequest,
  { params: paramsPromise }: { params: Promise<{ establishmentId: string }> }
) {
  try {
    const params = await paramsPromise
    const paramsValidation = paramsSchema.safeParse(params)

    if (!paramsValidation.success) {
      logger.warn('[PUBLIC API] Invalid establishment ID for products:', { params })
      return jsonError(paramsValidation.error.issues, 400)
    }

    const { establishmentId } = paramsValidation.data

    const { searchParams } = new URL(request.url)
    const categoryIdString = searchParams.get('categoryId')
    const categoryId = categoryIdString ? parseInt(categoryIdString, 10) : undefined

    logger.info('[PUBLIC API] Fetching products for establishment:', {
      establishmentId,
      categoryId
    })

    // 🌐 Obtener productos sin paginación para el menú público
    // Usamos página 1 y un pageSize alto para obtener todos los productos
    const allProducts = await productService.getAllProducts(
      establishmentId,
      1, // página 1
      1000, // pageSize alto para obtener todos
      categoryId
    )

    // 🌐 Filtrar solo productos activos para el público
    // Según tu schema: Product solo tiene isActive, no isAvailable
    const publicProducts = allProducts.filter(product =>
      product.isActive
    )

    logger.info('[PUBLIC API] Products retrieved successfully:', {
      establishmentId,
      categoryId,
      totalProducts: allProducts.length,
      publicProducts: publicProducts.length
    })

    // 🌐 Devolver array directo de productos (sin wrapper de paginación)
    return jsonOk(publicProducts)

  } catch (error: unknown) {
    let establishmentIdForErrorLog = 'unknown'
    try {
      const params = await paramsPromise
      establishmentIdForErrorLog = params.establishmentId
    } catch (paramsError) {
      logger.error('[PUBLIC API] Error resolving params for products logging:', paramsError)
    }

    logger.error(`[PUBLIC API] Error fetching products for establishment ${establishmentIdForErrorLog}:`, error)

    if (error instanceof z.ZodError) {
      return jsonError(error.issues, 400)
    }

    if (error instanceof Error) {
      return jsonError(error.message, 500)
    } else {
      return jsonError('An unexpected error occurred while fetching products', 500)
    }
  }
}
