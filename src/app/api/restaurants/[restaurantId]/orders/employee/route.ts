import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { orderService } from '@/services/order.service';
import { UserRole } from '@/types/enums';
import { OrderStatus } from '@/types/enums';
import { z } from 'zod';

// ✅ Schema para parámetros de Next.js (camelCase)
const path_params_schema = z.object({
  restaurantId: z.coerce.number().int().positive(),
});

// ✅ Schema para parámetros de consulta (snake_case interno)
const query_params_schema = z.object({
  status: z.string().optional(),
  from_date: z.string().optional(), // Cambiar a string simple para mayor flexibilidad
  to_date: z.string().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { restaurantId: string } } // ✅ Next.js requiere camelCase
) {
  try {
    const token = await getToken({ req });
    if (!token || !token.sub) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // ✅ Validar parámetros de ruta de Next.js
    const path_params_validation = path_params_schema.safeParse(params);
    if (!path_params_validation.success) {
      return NextResponse.json(
        { message: 'Invalid path parameters', errors: path_params_validation.error.issues },
        { status: 400 }
      );
    }
    
    // ✅ Conversión inmediata: camelCase → snake_case
    const { restaurantId } = path_params_validation.data; // Next.js camelCase
    const restaurant_id = restaurantId; // Convertir a snake_case para uso interno

    // Authorization: general_admin can access any restaurant's orders.
    // establishment_admin and employee can only access orders of their own establishment.
    const is_general_admin = token.role === UserRole.GENERAL_ADMIN;
    const is_restaurant_admin_or_employee =
      (token.role === UserRole.ESTABLISHMENT_ADMIN || 
       token.role === UserRole.WAITER || 
       token.role === UserRole.COOK) &&
      token.establishment_id === restaurant_id;

    if (!is_general_admin && !is_restaurant_admin_or_employee) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    // ✅ Extraer parámetros de consulta y convertir a snake_case
    const query_params = {
      status: req.nextUrl.searchParams.get('status') || undefined,
      from_date: req.nextUrl.searchParams.get('fromDate') || undefined, // camelCase de URL
      to_date: req.nextUrl.searchParams.get('toDate') || undefined,     // camelCase de URL
    };

    const query_params_validation = query_params_schema.safeParse(query_params);
    if (!query_params_validation.success) {
      return NextResponse.json(
        { message: 'Invalid query parameters', errors: query_params_validation.error.issues },
        { status: 400 }
      );
    }

    // ✅ Construir filtros en snake_case
    const filters: any = {
      establishment_id: restaurant_id, // ✅ snake_case
    };
    
    const { status, from_date, to_date } = query_params_validation.data;
    
    if (status && status !== 'all') {
      if (Object.values(OrderStatus).includes(status as OrderStatus)) {
        filters.status = status as OrderStatus;
      }
    }
    
    if (from_date) filters.from_date = from_date; // ✅ snake_case
    if (to_date) filters.to_date = to_date;       // ✅ snake_case
    
    const orders = await orderService.getAllOrders(filters);
    return NextResponse.json({ orders });

  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
