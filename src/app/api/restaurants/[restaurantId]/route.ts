import { NextRequest } from 'next/server';
import { jsonOk, jsonError } from '@/utils/api';
import { getEstablishmentById } from '@/services/establishment.service';
import { EstablishmentResponseDTO } from '@/types/dtos/establishment';
import logger  from '@/lib/logger';

/**
 * @swagger
 * /api/restaurants/{restaurantId}:
 *   get:
 *     summary: Get a specific restaurant by ID
 *     tags:
 *       - Restaurants
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the restaurant to retrieve
 *     responses:
 *       200:
 *         description: Restaurant data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Establishment'
 *       400:
 *         description: Invalid restaurant ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Restaurant not found
 *       500:
 *         description: Internal server error
 */
export async function GET(
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ restaurantId: string }> }
) {
  try {
    const params = await paramsPromise;
    const { restaurantId } = params;
    // Note: restaurantId in URL maps to establishmentId internally
    const parsedEstablishmentId = Number(restaurantId);

    if (isNaN(parsedEstablishmentId)) {
      logger.error('[API] ID inválido:', { restaurantId });
      return jsonError('Invalid restaurant ID', 400);
    }

    const restaurant: EstablishmentResponseDTO | null = await getEstablishmentById(parsedEstablishmentId);

    if (!restaurant) {
      logger.warn('[API] Restaurante no encontrado para id:', { parsedEstablishmentId });
      return jsonError('Restaurant not found', 404);
    }

    return jsonOk(restaurant);

  } catch (error: unknown) {
    let restaurantIdForErrorLog = 'unknown';
    try {
      const params = await paramsPromise;
      restaurantIdForErrorLog = params.restaurantId;
    } catch (paramsError) {
      logger.error('Error resolving params for logging:', paramsError);
    }
    logger.error(`[API] Error fetching restaurant ${restaurantIdForErrorLog}:`, error);
    if (error instanceof Error) {
      return jsonError(error.message, 500);
    } else {
      return jsonError('An unexpected error occurred', 500);
    }
  }
}

// Puedes añadir aquí los manejadores para PUT, DELETE, etc., según necesites.
