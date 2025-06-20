import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { jsonOk, jsonError } from '@/utils/api';
// Importa aquí los servicios y esquemas necesarios, por ejemplo:
import { establishmentService } from '@/services/establishment.service'; // Uncommented this line
// import { restaurantIdSchema } from '@/schemas/establishment'; // Asumiendo que tienes un esquema para validar el ID

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
 *               $ref: '#/components/schemas/Establishment' // Ajusta según tu esquema de respuesta
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
  { params: paramsPromise }: { params: Promise<{ restaurantId: string }> } // Renamed params to paramsPromise and typed as Promise
) {
  try {
    const params = await paramsPromise; // Await paramsPromise here
    // const token = await getToken({ req }); // Comentado para acceso público
    // if (!token) { // Comentado para acceso público
    //   return jsonError('Unauthorized', 401); // Comentado para acceso público
    // }

    const { restaurantId } = params; // Now accessing restaurantId from the resolved params
    const parsedRestaurantId = Number(restaurantId);

    if (isNaN(parsedRestaurantId)) {
      return jsonError('Invalid restaurant ID', 400);
    }

    // Aquí iría la lógica para obtener el restaurante por su ID
    const restaurant = await establishmentService.getEstablishmentById(parsedRestaurantId);
    if (!restaurant) {
      return jsonError('Restaurant not found', 404);
    }

    // La lógica de autorización específica para usuarios logueados se movería a PUT/DELETE si es necesario
    // o se manejaría de forma diferente si GET necesita mostrar más o menos info según el rol.
    // Por ahora, para la vista pública del menú, no se requiere autorización aquí.

    return jsonOk(restaurant);

  } catch (error: unknown) {
    // Safely try to get restaurantId for logging, or use a generic message
    let restaurantIdForErrorLog = 'unknown';
    try {
      const params = await paramsPromise;
      restaurantIdForErrorLog = params.restaurantId;
    } catch (paramsError) {
      console.error('Error resolving params for logging:', paramsError);
    }
    console.error(`Error fetching restaurant ${restaurantIdForErrorLog}:`, error);
    if (error instanceof Error) {
      return jsonError(error.message, 500);
    } else {
      return jsonError('An unexpected error occurred', 500);
    }
  }
}

// Puedes añadir aquí los manejadores para PUT, DELETE, etc., según necesites.