import { NextRequest } from 'next/server';
import { jsonOk, jsonError } from '@/utils/api';
import { getEstablishmentById } from '@/services/establishment.service';
import { EstablishmentResponseDTO } from '@/types/dtos/establishment';
import logger from '@/lib/logger';

/**
 * @swagger
 * /api/establishments/{id}:
 *   get:
 *     summary: Get a specific establishment by ID
 *     tags:
 *       - Establishments
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the establishment to retrieve
 *     responses:
 *       200:
 *         description: Establishment data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Establishment'
 *       400:
 *         description: Invalid establishment ID
 *       404:
 *         description: Establishment not found
 *       500:
 *         description: Internal server error
 */
export async function GET(
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ id: string }> }
) {
  try {
    const params = await paramsPromise;
    const { id } = params;
    const parsedEstablishmentId = Number(id);

    if (isNaN(parsedEstablishmentId)) {
      logger.error('[API] ID inválido:', { id });
      return jsonError('Invalid establishment ID', 400);
    }

    const establishment: EstablishmentResponseDTO | null = await getEstablishmentById(parsedEstablishmentId);

    if (!establishment) {
      logger.warn('[API] Establecimiento no encontrado para id:', { parsedEstablishmentId });
      return jsonError('Establishment not found', 404);
    }

    // Devuelve los datos en camelCase (no uses snakecase-keys)
    return jsonOk(establishment);

  } catch (error: unknown) {
    let establishmentIdForErrorLog = 'unknown';
    try {
      const params = await paramsPromise;
      establishmentIdForErrorLog = params.id;
    } catch (paramsError) {
      logger.error('Error resolving params for logging:', paramsError);
    }
    logger.error(`[API] Error fetching establishment ${establishmentIdForErrorLog}:`, error);
    if (error instanceof Error) {
      return jsonError(error.message, 500);
    } else {
      return jsonError('An unexpected error occurred', 500);
    }
  }
}
