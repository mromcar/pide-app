import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { orderService } from '@/services/order.service';
import { jsonOk, jsonError } from '@/utils/api';
import { orderIdSchema } from '@/schemas/order';
import { UserRole } from '@/types/enums';

/**
 * @swagger
 * /api/restaurants/{restaurantId}/orders/client/{orderId}:
 *   get:
 *     summary: Get an order by ID for a client
 *     tags:
 *       - Orders
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the restaurant
 *       - in: path
 *         name: orderId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the order
 *     responses:
 *       200:
 *         description: Order retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderResponseDTO'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Order not found
 *       500:
 *         description: Internal server error
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { restaurantId: string; orderId: string } }
) {
  try {
    const token = await getToken({ req });

    if (!token) {
      return jsonError('Unauthorized', 401);
    }

    const { restaurantId, orderId } = params;

    const parsedPathParams = orderIdSchema.safeParse({ orderId: Number(orderId) });
    if (!parsedPathParams.success) {
      return jsonError(parsedPathParams.error, 400);
    }

    const parsedRestaurantId = Number(restaurantId);
    if (isNaN(parsedRestaurantId)) {
      return jsonError('Invalid restaurant ID', 400);
    }

    // Authorization check: Only general_admin or establishment_admin of the specific restaurant
    if (
      token.role !== UserRole.general_admin &&
      !(token.role === UserRole.establishment_admin && token.establishment_id === parsedRestaurantId)
    ) {
      return jsonError('Forbidden', 403);
    }

    const order = await orderService.getOrderById(
      parsedPathParams.data.orderId,
      parsedRestaurantId,
      token.sub // Assuming token.sub is the user ID
    );

    if (!order) {
      return jsonError('Order not found', 404);
    }

    return jsonOk(order);
  } catch (error) {
    return jsonError(error, 500);
  }
}