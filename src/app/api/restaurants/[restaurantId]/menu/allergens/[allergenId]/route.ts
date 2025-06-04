import { requireAuth, AuthenticatedRequest } from "@/middleware/auth-middleware";
import { AllergenService } from '@/services/allergen.service';
import { updateAllergenSchema, allergenIdSchema } from '@/schemas/allergen';
import { jsonOk, jsonError } from "@/utils/api";
import { ZodError } from "zod";
import { NextRequest, NextResponse } from 'next/server';

// Instancia única del servicio
const allergenService = new AllergenService();

interface AllergenRouteParams {
  restaurantId: string;
  allergenId: string;
}

/**
 * @swagger
 * /api/restaurants/{restaurantId}/menu/allergens/{allergenId}:
 *   put:
 *     summary: Update an existing allergen.
 *     tags: [Allergens]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the restaurant.
 *       - in: path
 *         name: allergenId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the allergen to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateAllergenDTO'
 *     responses:
 *       200:
 *         description: Allergen updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Allergen'
 *       400:
 *         description: Invalid request body or allergen ID.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: Allergen not found.
 *       500:
 *         description: Internal server error.
 */
export async function PUT(request: NextRequest, { params }: { params: AllergenRouteParams }) {
  try {
    const session = await requireAuth('ADMIN');
    const { allergen_id: allergenIdNum } = allergenIdSchema.parse({ allergen_id: params.allergenId });
    const body = await request.json();
    const validatedData = updateAllergenSchema.parse(body);

    const allergen = await allergenService.updateAllergen(allergenIdNum, validatedData);
    if (!allergen) {
      return jsonError('Allergen not found.', 404);
    }
    return jsonOk({ allergen });
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonError(error.errors, 400);
    }
    return jsonError(error instanceof Error ? error.message : 'An unknown error occurred while updating the allergen.', 500);
  }
}

/**
 * @swagger
 * /api/restaurants/{restaurantId}/menu/allergens/{allergenId}:
 *   delete:
 *     summary: Delete an allergen.
 *     tags: [Allergens]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the restaurant.
 *       - in: path
 *         name: allergenId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the allergen to delete.
 *     responses:
 *       200:
 *         description: Allergen deleted successfully.
 *       400:
 *         description: Invalid allergen ID.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: Allergen not found.
 *       500:
 *         description: Internal server error.
 */
export async function DELETE(request: NextRequest, { params }: { params: AllergenRouteParams }) {
  try {
    const session = await requireAuth('ADMIN');
    const { allergen_id: allergenIdNum } = allergenIdSchema.parse({ allergen_id: params.allergenId });

    await allergenService.deleteAllergen(allergenIdNum);
    // Considerar verificar si el alérgeno existía antes de intentar borrar para devolver 404 si es necesario.
    // Por ahora, se asume que si no hay error, se borró o no existía, lo cual es idempotente.
    return jsonOk({ message: 'Allergen deleted successfully.' });
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonError(error.errors, 400);
    }
    return jsonError(error instanceof Error ? error.message : 'An unknown error occurred while deleting the allergen.', 500);
  }
}
