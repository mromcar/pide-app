import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { orderService } from '@/services/order.service';
import { UserRole, OrderStatus } from '@/types/enums';
import { z } from 'zod';
import type { OrderFilters } from '@/types/dtos/order';

// Schema para parámetros de Next.js (camelCase)
const pathParamsSchema = z.object({
  restaurantId: z.coerce.number().int().positive(),
});

// Schema para parámetros de consulta (camelCase)
const queryParamsSchema = z.object({
  status: z.string().optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { restaurantId: string } }
) {
  try {
    const token = await getToken({ req });
    if (!token || !token.sub) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Validar parámetros de ruta
    const pathParamsValidation = pathParamsSchema.safeParse(params);
    if (!pathParamsValidation.success) {
      return NextResponse.json(
        { message: 'Invalid path parameters', errors: pathParamsValidation.error.issues },
        { status: 400 }
      );
    }

    const { restaurantId } = pathParamsValidation.data;

    // Authorization
    const isGeneralAdmin = token.role === UserRole.GENERAL_ADMIN;
    const isRestaurantAdminOrEmployee =
      (token.role === UserRole.ESTABLISHMENT_ADMIN ||
        token.role === UserRole.WAITER ||
        token.role === UserRole.COOK) &&
      token.establishment_id === restaurantId;

    if (!isGeneralAdmin && !isRestaurantAdminOrEmployee) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    // Extraer parámetros de consulta en camelCase
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

    // Construir filtros en camelCase para el servicio
    const filters: OrderFilters = {
      establishmentId: restaurantId,
    };

    const { status, fromDate, toDate } = queryParamsValidation.data;

    if (status && status !== 'all') {
      if (Object.values(OrderStatus).includes(status as OrderStatus)) {
        filters.status = status as OrderStatus;
      }
    }

    if (fromDate) filters.fromDate = fromDate;
    if (toDate) filters.toDate = toDate;

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
