import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { orderService } from '@/services/order.service';
import { jsonOk, jsonError } from '@/utils/api';
import { createOrderSchema } from '@/schemas/order';
import { UserRole } from '@/types/enums';
import { z } from 'zod';

const pathParamsSchema = z.object({
  restaurantId: z.coerce.number().int().positive(),
});

/**
 * @swagger
 * /api/restaurants/{restaurantId}/orders/client:
 *   post:
 *     summary: Create a new order for a client
 *     tags:
 *       - Orders
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the restaurant
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrderCreateInput'
 *     responses:
 *       200:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderResponseDTO'
 *       400:
 *         description: Invalid request body or parameters
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { restaurantId: string } }
) {
  try {
    const token = await getToken({ req });

    if (!token) {
      return jsonError('Unauthorized', 401);
    }

    const parsedPathParams = pathParamsSchema.safeParse(params);
    if (!parsedPathParams.success) {
      return jsonError(parsedPathParams.error, 400);
    }

    const { restaurantId } = parsedPathParams.data;

    // Authorization check: Only general_admin or establishment_admin of the specific restaurant
    if (
      token.role !== UserRole.general_admin &&
      !(token.role === UserRole.establishment_admin && token.establishment_id === restaurantId)
    ) {
      return jsonError('Forbidden', 403);
    }

    const body = await req.json();
    const validatedData = createOrderSchema.safeParse(body);

    if (!validatedData.success) {
      return jsonError(validatedData.error, 400);
    }

    const order = await orderService.createOrder({
      ...validatedData.data,
      client_user_id: token.sub, // Assuming token.sub is the user ID
      establishment_id: restaurantId,
    });

    return jsonOk(order);
  } catch (error) {
    return jsonError(error, 500);
  }
}