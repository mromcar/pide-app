import { requireAuth, AuthenticatedRequest } from "@/middleware/auth-middleware"; // AuthenticatedRequest puede ser útil si necesitas tipar el usuario en request
import { AllergenService } from '@/services/allergen.service';
import { createAllergenSchema } from '@/schemas/allergen';
import { jsonOk, jsonError } from "@/utils/api";
import { ZodError } from "zod";
import { NextRequest, NextResponse } from 'next/server';

// Instancia única del servicio para ser reutilizada por los handlers
const allergenService = new AllergenService();

/**
 * @swagger
 * /api/restaurants/{restaurantId}/menu/allergens:
 *   get:
 *     summary: Retrieve a list of all allergens.
 *     tags: [Allergens]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the restaurant (currently not used for filtering global allergens, but kept for path consistency).
 *     responses:
 *       200:
 *         description: A list of allergens.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 allergens:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Allergen'
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Internal server error.
 */
export async function GET(request: NextRequest, { params }: { params: { restaurantId: string } }) {
  try {
    // Aunque restaurantId está en la ruta, los alérgenos son globales.
    // Se mantiene requireAuth para la autenticación general de la API.
    await requireAuth(); 
    const allergens = await allergenService.getAllAllergens();
    return jsonOk({ allergens });
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonError(error.errors, 400);
    }
    return jsonError(error instanceof Error ? error.message : 'An unknown error occurred while fetching allergens.', 500);
  }
}

/**
 * @swagger
 * /api/restaurants/{restaurantId}/menu/allergens:
 *   post:
 *     summary: Create a new allergen.
 *     tags: [Allergens]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the restaurant (used for authorization context).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAllergenDTO'
 *     responses:
 *       201:
 *         description: Allergen created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Allergen'
 *       400:
 *         description: Invalid request body.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden (User does not have ADMIN role).
 *       500:
 *         description: Internal server error.
 */
export async function POST(request: NextRequest, { params }: { params: { restaurantId: string } }) {
  try {
    // restaurantId se usa aquí para el contexto de autorización (asegurar que el admin opera sobre su restaurante, si aplica)
    // o simplemente para mantener la estructura de la ruta.
    const session = await requireAuth('ADMIN'); // Requiere rol de ADMIN
    const body = await request.json();
    const validatedData = createAllergenSchema.parse(body);

    const allergen = await allergenService.createAllergen(validatedData);
    return jsonOk({ allergen }, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonError(error.errors, 400);
    }
    // Considerar un log del error aquí para el servidor
    return jsonError(error instanceof Error ? error.message : 'An unknown error occurred while creating the allergen.', 500);
  }
}
