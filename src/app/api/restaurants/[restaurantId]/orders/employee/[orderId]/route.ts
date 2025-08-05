import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt'; // ✅ Usar getToken en lugar de getServerSession
import { UserRole, OrderStatus } from '@prisma/client';
import { orderService } from '@/services/order.service';
import { order_id_schema, update_order_status_schema } from '@/schemas/order';
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
    const token = await getToken({ req }); // ✅ Usar getToken

    if (!token || !token.sub) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { restaurantId, orderId } = params;

    try {
        const validatedRestaurantId = establishmentIdSchema.safeParse({ establishmentId: Number(restaurantId) });
        if (!validatedRestaurantId.success) {
            return NextResponse.json({ message: 'Invalid Restaurant ID', errors: validatedRestaurantId.error.issues }, { status: 400 });
        }

        const validatedOrderId = order_id_schema.safeParse({ order_id: Number(orderId) });
        if (!validatedOrderId.success) {
            return NextResponse.json({ message: 'Invalid Order ID', errors: validatedOrderId.error.issues }, { status: 400 });
        }

        const body = await req.json();
        const validatedBody = update_order_status_schema.safeParse(body);

        if (!validatedBody.success) {
            return NextResponse.json({ message: 'Invalid request body', errors: validatedBody.error.issues }, { status: 400 });
        }

        const { status, notes } = validatedBody.data;

        const authorized =
            token.role === UserRole.general_admin ||
            (
                (token.role === UserRole.establishment_admin || token.role === UserRole.waiter || token.role === UserRole.cook) &&
                token.establishment_id === validatedRestaurantId.data.establishmentId
            );

        if (!authorized) {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        const updatedOrder = await orderService.updateOrderStatus(
            validatedOrderId.data.order_id, // Corregido: usar order_id
            status as OrderStatus, // Corregido: cast explícito a OrderStatus
            parseInt(token.sub, 10),
            notes
        );

        return NextResponse.json(updatedOrder, { status: 200 });

    } catch (error: unknown) { // Corregido: cambiar any por unknown
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error(`Error updating order status for order ${orderId} in restaurant ${restaurantId}:`, error);

        if (errorMessage === 'Order not found' || errorMessage === 'Establishment not found') {
            return NextResponse.json({ message: errorMessage }, { status: 404 });
        }
        return NextResponse.json({ message: 'Error updating order status', error: errorMessage }, { status: 500 });
    }
}
