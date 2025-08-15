import { NextRequest } from 'next/server'
import * as categoryService from '@/services/category.service'
import { jsonOk, jsonError } from '@/utils/api'
import logger from '@/lib/logger'

/**
 * @swagger
 * /api/menu/{establishmentId}/categories:
 *   get:
 *     summary: Get all active categories for public menu
 *     description: Public API to retrieve all active categories for an establishment without authentication
 *     tags:
 *       - Public Menu
 *     parameters:
 *       - in: path
 *         name: establishmentId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the establishment to retrieve categories for
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 categories:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       categoryId:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       sortOrder:
 *                         type: integer
 *                       isActive:
 *                         type: boolean
 *       400:
 *         description: Invalid establishment ID
 *       500:
 *         description: Internal server error
 */
export async function GET(
  _req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ establishmentId: string }> }
) {
  try {
    const params = await paramsPromise
    const { establishmentId } = params
    const parsedEstablishmentId = Number(establishmentId)

    if (isNaN(parsedEstablishmentId)) {
      logger.warn('[PUBLIC API] Invalid establishment ID for categories:', { establishmentId })
      return jsonError('Invalid establishment ID', 400)
    }

    logger.info('[PUBLIC API] Fetching categories for establishment:', { parsedEstablishmentId })

    // 🌐 Obtener todas las categorías del establecimiento (sin autenticación)
    // Usar el mismo service que la API admin pero filtrar solo activas
    const allCategories = await categoryService.getAllCategoriesByEstablishment(
      parsedEstablishmentId,
      1,
      100
    )

    // 🌐 Filtrar solo categorías activas para el público
    const activeCategories = allCategories.filter(category => category.isActive)

    logger.info('[PUBLIC API] Categories retrieved successfully:', {
      parsedEstablishmentId,
      totalCategories: allCategories.length,
      activeCategories: activeCategories.length
    })

    // 🌐 Devolver en el mismo formato que la API admin para compatibilidad
    return jsonOk({ categories: activeCategories })

  } catch (error: unknown) {
    let establishmentIdForErrorLog = 'unknown'
    try {
      const params = await paramsPromise
      establishmentIdForErrorLog = params.establishmentId
    } catch (paramsError) {
      logger.error('[PUBLIC API] Error resolving params for categories logging:', paramsError)
    }

    logger.error(`[PUBLIC API] Error fetching categories for establishment ${establishmentIdForErrorLog}:`, error)

    if (error instanceof Error) {
      return jsonError(error.message, 500)
    } else {
      return jsonError('An unexpected error occurred while fetching categories', 500)
    }
  }
}
