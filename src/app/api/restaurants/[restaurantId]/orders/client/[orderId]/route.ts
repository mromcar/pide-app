import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { orderService } from '@/services/order.service';
import { jsonOk, jsonError } from '@/utils/api';
import { createOrderSchema } from '@/schemas/order';
import { UserRole } from '@/types/enums';
import { OrderCreateDTO } from '@/types/dtos/order';
import { z } from 'zod';

// Schema para validar parámetros en camelCase
const pathParamsSchema = z.object({
  restaurantId: z.coerce.number().int().positive(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { restaurantId: string } }
) {
  try {
    const token = await getToken({ req });

    if (!token) {
      return jsonError('Unauthorized', 401);
    }

    const { restaurantId } = params;
    const parsedPathParams = pathParamsSchema.safeParse({ restaurantId: parseInt(restaurantId) });

    if (!parsedPathParams.success) {
      return jsonError(parsedPathParams.error.errors, 400);
    }

    const validatedRestaurantId = parsedPathParams.data.restaurantId;

    // Authorization check
    if (
      token.role !== UserRole.GENERAL_ADMIN &&
      !(token.role === UserRole.ESTABLISHMENT_ADMIN && token.establishment_id === validatedRestaurantId)
    ) {
      return jsonError('Forbidden', 403);
    }

    const body = await req.json();
    const validatedData = createOrderSchema.safeParse(body);

    if (!validatedData.success) {
      return jsonError(validatedData.error.issues, 400);
    }

    const orderData: OrderCreateDTO = {
      establishmentId: validatedRestaurantId,
      clientUserId: parseInt(token.sub),
      tableNumber: validatedData.data.tableNumber,
      notes: validatedData.data.notes,
      totalAmount: validatedData.data.totalAmount ?? 0,
      orderItems: validatedData.data.orderItems
    };

    const order = await orderService.createOrder(orderData);

    return jsonOk(order);
  } catch (error) {
    console.error('Error creating order:', error);
    if (error instanceof Error) {
      return jsonError(error.message, 500);
    }
    return jsonError('An unexpected error occurred', 500);
  }
}
