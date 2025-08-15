import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { orderService } from '@/services/order.service';
import { jsonOk, jsonError } from '@/utils/api';
import { createOrderSchema } from '@/schemas/order';
import { UserRole } from '@/constants/enums';
import { OrderCreateDTO } from '@/types/dtos/order';
import { z } from 'zod';

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
    const parsedPathParams = pathParamsSchema.safeParse({
      restaurantId: parseInt(restaurantId),
    });

    if (!parsedPathParams.success) {
      return jsonError(parsedPathParams.error.errors, 400);
    }

    const validatedRestaurantId = parsedPathParams.data.restaurantId;

    // Authorization check
    if (
      token.role !== UserRole.general_admin &&
      !(token.role === UserRole.establishment_admin && token.establishmentId === validatedRestaurantId)
    ) {
      return jsonError('Forbidden', 403);
    }

    const body = await req.json();
    const validatedData = createOrderSchema.safeParse(body);

    if (!validatedData.success) {
      return jsonError(validatedData.error.issues, 400);
    }

    // Crea la orden usando camelCase en las propiedades
    const orderData: OrderCreateDTO = {
      ...validatedData.data,
      clientUserId: token.sub ? parseInt(token.sub) : null,
      establishmentId: validatedRestaurantId,
      totalAmount: validatedData.data.totalAmount || 0,
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
