import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { orderService } from '@/services/order.service';
import { jsonOk, jsonError } from '@/utils/api';
import { create_order_schema } from '@/schemas/order';
import { UserRole } from '@/types/enums';
import { OrderCreateDTO } from '@/types/dtos/order'; // ✅ Importación faltante
import { z } from 'zod';

// Schema para validar parámetros internos en snake_case
const path_params_schema = z.object({
  restaurant_id: z.coerce.number().int().positive(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { restaurantId: string } } // ✅ Next.js requiere camelCase
) {
  try {
    const token = await getToken({ req });

    if (!token) {
      return jsonError('Unauthorized', 401);
    }

    // ✅ Conversión inmediata: camelCase → snake_case
    const { restaurantId } = params; // Next.js camelCase
    const restaurant_id = parseInt(restaurantId); // Convertir a snake_case para uso interno

    const parsed_path_params = path_params_schema.safeParse({
      restaurant_id // ✅ Usar snake_case internamente
    });

    if (!parsed_path_params.success) {
      return jsonError(parsed_path_params.error.errors, 400);
    }

    const { restaurant_id: validated_restaurant_id } = parsed_path_params.data;

    // Authorization check: Only general_admin or establishment_admin of the specific restaurant
    if (
      token.role !== UserRole.GENERAL_ADMIN &&
      !(token.role === UserRole.ESTABLISHMENT_ADMIN && token.establishment_id === validated_restaurant_id)
    ) {
      return jsonError('Forbidden', 403);
    }

    const body = await req.json();
    const validated_data = create_order_schema.safeParse(body); // ✅ Cambiar validatedBody por validated_data

    if (!validated_data.success) {
      return jsonError(validated_data.error.issues, 400);
    }

    // ✅ Crear orderData usando validated_data en lugar de validatedBody
    const orderData: OrderCreateDTO = {
      establishment_id: validated_restaurant_id,
      client_user_id: parseInt(token.sub),
      table_number: validated_data.data.table_number,
      notes: validated_data.data.notes,
      total_amount: validated_data.data.total_amount ?? 0, // ✅ Proporcionar valor por defecto
      order_items: validated_data.data.order_items
    };

    // ✅ Usar orderData en lugar de mezclar datos
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
