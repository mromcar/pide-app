// src/app/api/employees/orders/[orderId]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { OrderStatus } from '@prisma/client';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { UpdateOrderStatusSchema } from '@/types/dtos'; // Importa el esquema de Zod para la actualización

// La función GET para un solo pedido no es estrictamente necesaria aquí si ya listan todos.
// Si la necesitas, el código sería similar al GET de /orders pero filtrando por order_id.

export async function PATCH(request: Request, { params }: { params: { orderId: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const allowedRoles = ['establishment_admin', 'waiter', 'cook'];
    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.json({ error: "Permiso denegado: tu rol no está autorizado para actualizar pedidos." }, { status: 403 });
    }

    const orderId = Number(params.orderId);
    if (isNaN(orderId)) {
      return NextResponse.json({ error: "ID de pedido no válido" }, { status: 400 });
    }

    const body = await request.json();

    // *** Validación con Zod para el cuerpo de la actualización ***
    const validationResult = UpdateOrderStatusSchema.safeParse(body);

    if (!validationResult.success) {
      // Devuelve errores de Zod más detallados
      return NextResponse.json(
        {
          error: "Datos de actualización de estado no válidos",
          details: validationResult.error.flatten().fieldErrors, // Muestra errores por campo
        },
        { status: 400 }
      );
    }

    const { status: newStatus, notes: statusNotes } = validationResult.data;

    // Verificar si el pedido existe y pertenece al establecimiento del empleado logueado
    const existingOrder = await prisma.order.findUnique({
      where: { order_id: orderId },
      select: {
        establishment_id: true,
        status: true // Para verificar el estado actual antes de la actualización
      },
    });

    if (!existingOrder || existingOrder.establishment_id !== session.user.establishment_id) {
      return NextResponse.json({ error: "Pedido no encontrado o no pertenece a tu establecimiento." }, { status: 404 });
    }

    // Opcional: Lógica adicional para transiciones de estado válidas.
    // Esto es muy útil para evitar cambios de estado ilógicos (ej. de "Cancelado" a "Listo").
    // if (existingOrder.status === OrderStatus.CANCELLED && newStatus !== OrderStatus.CANCELLED) {
    //   return NextResponse.json({ error: "No se puede cambiar el estado de un pedido que ya está cancelado." }, { status: 400 });
    // }
    // if (existingOrder.status === OrderStatus.READY && newStatus === OrderStatus.PENDING) {
    //   return NextResponse.json({ error: "No se puede retroceder el estado de un pedido listo a pendiente." }, { status: 400 });
    // }

    // Actualizar el estado del pedido y registrar el cambio en el historial
    const updatedOrder = await prisma.order.update({
      where: { order_id: orderId },
      data: {
        status: newStatus,
        updated_at: new Date(), // Actualizar la fecha de modificación del pedido
        status_history: {
          create: {
            status: newStatus,
            // Asigna el ID del usuario logueado como el que realizó el cambio
            changed_by_user_id: session.user.user_id,
            // Añade notas por defecto si no se proporcionan, incluyendo quién hizo el cambio
            notes: statusNotes || `Estado cambiado a ${newStatus} por ${session.user.name || session.user.email || 'Usuario desconocido'}.`,
          },
        },
      },
      // Incluye las mismas relaciones que en el GET para consistencia si el frontend las necesita
      include: {
        status_history: {
            orderBy: { changed_at: 'desc' }
        },
        items: {
            include: {
                variant: {
                    include: {
                        product: {
                            include: { translations: true } // Incluye traducciones para serializarlas
                        },
                        translations: true // Incluye traducciones para serializarlas
                    }
                }
            }
        },
        client: { select: { user_id: true, name: true, email: true } },
        waiter: { select: { user_id: true, name: true, email: true } },
      }
    });

    // Serializar la respuesta (convertir Decimal a number y manejar traducciones)
    const serializedUpdatedOrder = {
        ...updatedOrder,
        total_amount: updatedOrder.total_amount?.toNumber() ?? 0,
        created_at: updatedOrder.created_at,
        updated_at: updatedOrder.updated_at,
        // Serializar el historial de estado
        status_history: updatedOrder.status_history.map(history => ({
            ...history,
            changed_at: history.changed_at,
        })),
        // Serializar los ítems y sus relaciones anidadas
        items: updatedOrder.items.map(item => ({
            order_item_id: item.order_item_id,
            order_id: item.order_id,
            variant_id: item.variant_id,
            quantity: item.quantity,
            unit_price: item.unit_price.toNumber(),
            item_total_price: item.item_total_price?.toNumber() ?? 0,
            status: item.status,
            notes: item.notes,
            product: {
                product_id: item.variant.product.product_id,
                name: item.variant.product.translations[0]?.name || item.variant.product.name,
                description: item.variant.product.translations[0]?.description || item.variant.product.description,
                image_url: item.variant.product.image_url,
                // Puedes incluir alérgenos si son necesarios aquí, serializados similar a la ruta GET
            },
            variant: {
                variant_id: item.variant.variant_id,
                variant_description: item.variant.translations[0]?.variant_description || item.variant.variant_description,
                price: item.variant.price.toNumber(),
                sku: item.variant.sku,
            }
        })),
        // Incluir client y waiter si están en la respuesta y se necesitan serializar
        client: updatedOrder.client ? {
            user_id: updatedOrder.client.user_id,
            name: updatedOrder.client.name,
            email: updatedOrder.client.email,
        } : null,
        waiter: updatedOrder.waiter ? {
            user_id: updatedOrder.waiter.user_id,
            name: updatedOrder.waiter.name,
            email: updatedOrder.waiter.email,
        } : null,
    };

    return NextResponse.json(serializedUpdatedOrder);

  } catch (error) {
    console.error('Error al actualizar el estado del pedido:', error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: 'Error al actualizar el estado del pedido', message: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'Ocurrió un error inesperado al actualizar el estado.' },
      { status: 500 }
    );
  }
}
