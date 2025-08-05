import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { jsonOk, jsonError } from '@/utils/api';
// Importa aquí los servicios y esquemas necesarios, por ejemplo:
// import { establishmentService } from '@/services/establishment.service';

/**
 * @swagger
 * /api/restaurants:
 *   get:
 *     summary: Get a list of restaurants
 *     tags:
 *       - Restaurants
 *     responses:
 *       200:
 *         description: A list of restaurants retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Establishment' // Ajusta según tu esquema de respuesta
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req });
    if (!token) {
      return jsonError('Unauthorized', 401);
    }

    // Aquí iría la lógica para obtener la lista de restaurantes
    // Por ejemplo:
    // const restaurants = await establishmentService.getAllEstablishments();
    // return jsonOk(restaurants);

    return jsonOk({ message: 'GET request for restaurants successful' }); // Placeholder response

  } catch (error: unknown) {
    console.error('Error fetching restaurants:', error);
    if (error instanceof Error) {
      return jsonError(error.message, 500);
    } else {
      return jsonError('An unexpected error occurred', 500);
    }
  }
}

// Puedes añadir aquí el manejador para POST para crear nuevos restaurantes, etc.