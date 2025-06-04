import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { orderService } from '@/services/order.service';
import { jsonError } from '@/utils/api'; // Assuming jsonOk is not needed if using NextResponse directly
import { UserRole } from '@prisma/client'; // Changed import to @prisma/client
import { z } from 'zod';

const pathParamsSchema = z.object({
  restaurantId: z.coerce.number().int().positive(),
});

const queryParamsSchema = z.object({
  status: z.string().optional(), // Add more specific validation if OrderStatus is an enum
  fromDate: z.string().datetime({ offset: true }).optional(), // Expects ISO 8601 date string
  toDate: z.string().datetime({ offset: true }).optional(),
});

/**
 * @swagger
 * /api/restaurants/{restaurantId}/orders/employee:
 *   get:
 *     summary: Get all orders for a restaurant (employee access)
 *     tags:
 *       - Orders
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the restaurant.
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter orders by status.
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter orders from this date.
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter orders up to this date.
 *     responses:
 *       200:
 *         description: A list of orders.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orders:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SerializedOrder'
 *       400:
 *         description: Invalid input.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       500:
 *         description: Internal server error.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { restaurantId: string } }
) {
  try {
    const token = await getToken({ req });
    if (!token || !token.sub) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const pathParamsValidation = pathParamsSchema.safeParse(params);
    if (!pathParamsValidation.success) {
      return NextResponse.json(
        { message: 'Invalid path parameters', errors: pathParamsValidation.error.issues },
        { status: 400 }
      );
    }
    const { restaurantId } = pathParamsValidation.data;

    // Authorization: general_admin can access any restaurant's orders.
    // establishment_admin and employee can only access orders of their own establishment.
    const isGeneralAdmin = token.role === UserRole.general_admin; // Corrected to use lowercase enum key
    const isRestaurantAdminOrEmployee =
      (token.role === UserRole.establishment_admin || token.role === UserRole.waiter || token.role === UserRole.cook) &&
      token.establishment_id === restaurantId;

    if (!isGeneralAdmin && !isRestaurantAdminOrEmployee) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const queryParams = {
      status: req.nextUrl.searchParams.get('status') || undefined,
      fromDate: req.nextUrl.searchParams.get('fromDate') || undefined,
      toDate: req.nextUrl.searchParams.get('toDate') || undefined,
    };

    const queryParamsValidation = queryParamsSchema.safeParse(queryParams);
    if (!queryParamsValidation.success) {
      return NextResponse.json(
        { message: 'Invalid query parameters', errors: queryParamsValidation.error.issues },
        { status: 400 }
      );
    }

    const filters = {
      ...queryParamsValidation.data,
      establishment_id: restaurantId, // Service expects establishment_id
    };

    const orders = await orderService.getAllOrders(filters);
    return NextResponse.json({ orders });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Validation failed', errors: error.issues }, { status: 400 });
    }
    console.error('Error fetching orders:', error);
    // Use the existing jsonError utility or create a new NextResponse for consistency
    if (error instanceof Error && typeof (error as any).status === 'number') {
      return NextResponse.json({ message: error.message }, { status: (error as any).status });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
