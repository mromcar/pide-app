import { NextRequest } from 'next/server'
import { AllergenService } from '@/services/allergen.service'
import { jsonOk, jsonError } from '@/utils/api'
import logger from '@/lib/logger'

const allergenService = new AllergenService()

/**
 * @swagger
 * /api/menu/{establishmentId}/allergens:
 *   get:
 *     summary: Get all allergens for public menu
 *     description: Public API to retrieve all available allergens without authentication
 *     tags:
 *       - Public Menu
 *     parameters:
 *       - in: path
 *         name: establishmentId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the establishment (for consistency, but allergens are global)
 *     responses:
 *       200:
 *         description: Allergens retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   allergenId:
 *                     type: integer
 *                   code:
 *                     type: string
 *                   name:
 *                     type: string
 *                   description:
 *                     type: string
 *                   iconUrl:
 *                     type: string
 *                   isMajorAllergen:
 *                     type: boolean
 *       400:
 *         description: Invalid establishment ID
 *       500:
 *         description: Internal server error
 */
export async function GET(
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ establishmentId: string }> }
) {
  try {
    const params = await paramsPromise
    const { establishmentId } = params
    const parsedEstablishmentId = Number(establishmentId)

    if (isNaN(parsedEstablishmentId)) {
      logger.error('[PUBLIC API] Invalid establishment ID for allergens:', { establishmentId })
      return jsonError('Invalid establishment ID', 400)
    }

    logger.info('[PUBLIC API] Fetching allergens for establishment:', { parsedEstablishmentId })

    // 🌐 Obtener todos los alérgenos (sin autenticación)
    // Los alérgenos son globales y no tienen campo isActive en tu schema
    const allergens = await allergenService.getAllAllergens()

    logger.info('[PUBLIC API] Allergens retrieved successfully:', {
      parsedEstablishmentId,
      totalAllergens: allergens.length
    })

    // 🌐 Devolver directamente el array de alérgenos
    // Según tu schema: allergenId, code, name, description, iconUrl, isMajorAllergen
    return jsonOk(allergens)

  } catch (error: unknown) {
    let establishmentIdForErrorLog = 'unknown'
    try {
      const params = await paramsPromise
      establishmentIdForErrorLog = params.establishmentId
    } catch (paramsError) {
      logger.error('[PUBLIC API] Error resolving params for allergens logging:', paramsError)
    }

    logger.error(`[PUBLIC API] Error fetching allergens for establishment ${establishmentIdForErrorLog}:`, error)

    if (error instanceof Error) {
      return jsonError(error.message, 500)
    } else {
      return jsonError('An unexpected error occurred while fetching allergens', 500)
    }
  }
}
