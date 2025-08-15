import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { UserRole, OrderStatus } from '@prisma/client';
import { orderService } from '@/services/order.service';
import { orderIdSchema, updateOrderStatusSchema } from '@/schemas/order';
import { establishmentIdSchema } from '@/schemas/establishment';
import logger from '@/lib/logger';

/**
 * @swagger
 * /api/restaurants/{restaurantId}/orders/employee/{orderId}:
 *   patch:
 *     summary: Update order status by employee
 *     tags:
 *       - Orders (Employee)
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         description: ID of the restaurant.
 *         schema:
 *           type: integer
 *       - in: path
 *         name: orderId
 *         required: true
 *         description: ID of the order to update.
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrderUpdateStatusInput'
 *     responses:
 *       200:
 *         description: Order status updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderResponse'
 *       400:
 *         description: Invalid input (e.g., invalid restaurant ID, order ID, or request body).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized (token is missing or invalid).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden (user does not have permission to update the order status for this restaurant).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Order or Establishment not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { restaurantId: string; orderId: string } }
) {
  const token = await getToken({ req });

  if (!token || !token.sub) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { restaurantId, orderId } = params;

  try {
    const validatedRestaurantId = establishmentIdSchema.safeParse({ establishmentId: Number(restaurantId) });
    if (!validatedRestaurantId.success) {
      return NextResponse.json(
        { message: 'Invalid restaurant ID', errors: validatedRestaurantId.error.issues },
        { status: 400 }
      );
    }

    const validatedOrderId = orderIdSchema.safeParse({ orderId: Number(orderId) });
    if (!validatedOrderId.success) {
      return NextResponse.json(
        { message: 'Invalid order ID', errors: validatedOrderId.error.issues },
        { status: 400 }
      );
    }

    const body = await req.json();
    const validatedBody = updateOrderStatusSchema.safeParse(body);

    if (!validatedBody.success) {
      return NextResponse.json(
        { message: 'Invalid request body', errors: validatedBody.error.issues },
        { status: 400 }
      );
    }

    const { status, notes } = validatedBody.data;

    const authorized =
      token.role === UserRole.general_admin ||
      (
        (token.role === UserRole.establishment_admin ||
          token.role === UserRole.waiter ||
          token.role === UserRole.cook) &&
        token.establishmentId === validatedRestaurantId.data.establishmentId
      );

    if (!authorized) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const updatedOrder = await orderService.updateOrderStatus(
      validatedOrderId.data.orderId,
      status as OrderStatus,
      parseInt(token.sub, 10),
      notes
    );

    return NextResponse.json(updatedOrder, { status: 200 });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`Error updating order status for order ${orderId} in restaurant ${restaurantId}:`, error);

    if (errorMessage === 'Order not found' || errorMessage === 'Establishment not found') {
      return NextResponse.json({ message: errorMessage }, { status: 404 });
    }
    return NextResponse.json({ message: 'Error updating order status', error: errorMessage }, { status: 500 });
  }
}
