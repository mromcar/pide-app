import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { orderService } from '@/services/order.service';
import { jsonOk, jsonError } from '@/utils/api';
import { create_order_schema } from '@/schemas/order';
import { UserRole } from '@/types/enums';
import { OrderCreateDTO } from '@/types/dtos/order'; // Agregar importación faltante
import { z } from 'zod';

const path_params_schema = z.object({
  restaurant_id: z.coerce.number().int().positive(),
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

    // ✅ Conversión inmediata: camelCase → snake_case
    const { restaurantId } = params;
    const restaurant_id = parseInt(restaurantId);

    const parsed_path_params = path_params_schema.safeParse({
      restaurant_id
    });

    if (!parsed_path_params.success) {
      return jsonError(parsed_path_params.error.errors, 400);
    }

    const { restaurant_id: validated_restaurant_id } = parsed_path_params.data;

    // Authorization check
    if (
      token.role !== UserRole.GENERAL_ADMIN &&
      !(token.role === UserRole.ESTABLISHMENT_ADMIN && token.establishment_id === validated_restaurant_id)
    ) {
      return jsonError('Forbidden', 403);
    }

    const body = await req.json();
    const validated_data = create_order_schema.safeParse(body);

    if (!validated_data.success) {
      return jsonError(validated_data.error.issues, 400);
    }

    // ✅ Crear orden usando los datos validados con tipo explícito
    const orderData: OrderCreateDTO = {
      ...validated_data.data,
      client_user_id: token.sub ? parseInt(token.sub) : null,
      establishment_id: validated_restaurant_id,
      total_amount: validated_data.data.total_amount || 0, // ✅ Asegurar que no sea undefined
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
