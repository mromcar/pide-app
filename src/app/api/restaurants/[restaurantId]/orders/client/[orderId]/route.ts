import { NextRequest, NextResponse } from 'next/server';
import { getToken, JWT } from 'next-auth/jwt';
import { orderService } from '@/services/order.service';
import { jsonOk, jsonError } from '@/utils/api';
import { orderIdSchema } from '@/schemas/order';
import { UserRole } from '@/types/enums';
import { ZodIssue } from 'zod';

// Helper function to parse and validate path parameters
function validatePathParams(params: { restaurantId: string; orderId: string }): 
  | { success: true; data: { restaurantId: number; orderId: number } } 
  | { success: false; error: ZodIssue[] | string; status: number } {
  const parsedRestaurantId = Number(params.restaurantId);
  if (isNaN(parsedRestaurantId)) {
    return { success: false, error: 'Invalid restaurant ID', status: 400 };
  }

  const parsedOrderId = orderIdSchema.safeParse({ orderId: Number(params.orderId) });
  if (!parsedOrderId.success) {
    return { success: false, error: parsedOrderId.error.issues, status: 400 };
  }

  return { success: true, data: { restaurantId: parsedRestaurantId, orderId: parsedOrderId.data.orderId } };
}

// Helper function for authorization check
function isAuthorized(token: JWT, restaurantId: number): boolean {
  if (!token) return false;
  return (
    token.role === UserRole.GENERAL_ADMIN ||
    (token.role === UserRole.ESTABLISHMENT_ADMIN && token.establishment_id === restaurantId)
  );
}

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
 *       400:
 *         description: Invalid request parameters
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

    const validationResult = validatePathParams(params);
    if (!validationResult.success) {
      return jsonError(validationResult.error, validationResult.status);
    }

    const { restaurantId, orderId } = validationResult.data;

    if (!isAuthorized(token, restaurantId)) {
      return jsonError('Forbidden', 403);
    }

    const order = await orderService.getOrderById(
      orderId,
      restaurantId,
      token.sub // Assuming token.sub is the user ID
    );

    if (!order) {
      return jsonError('Order not found', 404);
    }

    return jsonOk(order);
  } catch (error: unknown) {
    console.error('Error fetching order:', error); // It's good practice to log the actual error
    if (error instanceof Error) {
      return jsonError(error.message, 500);
    } else {
      return jsonError('An unexpected error occurred', 500);
    }
  }
}
