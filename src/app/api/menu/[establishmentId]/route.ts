import { NextRequest } from 'next/server'
import { jsonOk, jsonError } from '@/utils/api'
import { getEstablishmentById } from '@/services/establishment.service'
import { EstablishmentResponseDTO } from '@/types/dtos/establishment'
import logger from '@/lib/logger'

/**
 * @swagger
 * /api/menu/{establishmentId}:
 *   get:
 *     summary: Get public menu for a specific establishment
 *     description: Public API to retrieve establishment details and full menu without authentication
 *     tags:
 *       - Public Menu
 *     parameters:
 *       - in: path
 *         name: establishmentId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the establishment to retrieve menu for
 *     responses:
 *       200:
 *         description: Establishment menu retrieved successfully
 *       400:
 *         description: Invalid establishment ID
 *       404:
 *         description: Establishment not found or menu not available
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
      logger.error('[PUBLIC API] ID inválido:', { establishmentId })
      return jsonError('Invalid establishment ID', 400)
    }

    logger.info('[PUBLIC API] Fetching public menu for establishment:', { parsedEstablishmentId })

    // 🌐 Verificar que el establecimiento existe y está activo (sin autenticación)
    const establishment: EstablishmentResponseDTO | null = await getEstablishmentById(parsedEstablishmentId)

    if (!establishment) {
      logger.warn('[PUBLIC API] Establecimiento no encontrado para id:', { parsedEstablishmentId })
      return jsonError('Establishment not found', 404)
    }

    if (!establishment.isActive) {
      logger.warn('[PUBLIC API] Establecimiento no activo:', { parsedEstablishmentId })
      return jsonError('Establishment is currently unavailable', 404)
    }

    // 🌐 Crear respuesta con las propiedades correctas según tu schema
    const publicMenu = {
      establishmentId: establishment.establishmentId,
      establishmentName: establishment.name,
      establishmentDescription: establishment.description || '',
      address: establishment.address || '',
      postalCode: establishment.postalCode || '',
      city: establishment.city || '',
      phone1: establishment.phone1 || '',
      phone2: establishment.phone2 || '',
      website: establishment.website || '',
      categories: [] // Por ahora vacío, lo llenaremos después
    }

    logger.info('[PUBLIC API] Menu público obtenido exitosamente:', {
      parsedEstablishmentId,
      categoriesCount: 0
    })

    return jsonOk(publicMenu)

  } catch (error: unknown) {
    let establishmentIdForErrorLog = 'unknown'
    try {
      const params = await paramsPromise
      establishmentIdForErrorLog = params.establishmentId
    } catch (paramsError) {
      logger.error('[PUBLIC API] Error resolving params for logging:', paramsError)
    }

    logger.error(`[PUBLIC API] Error fetching public menu ${establishmentIdForErrorLog}:`, error)

    if (error instanceof Error) {
      return jsonError(error.message, 500)
    } else {
      return jsonError('An unexpected error occurred while fetching menu', 500)
    }
  }
}
