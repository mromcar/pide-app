// src/app/api/employees/orders/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Asume que tienes un cliente Prisma inicializado aquí
import { OrderStatus, OrderItemStatus } from '@prisma/client'; // Importa los enums de Prisma Client directamente
import { getServerSession } from "next-auth"; // Importar para la autenticación
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // Importar opciones de autenticación

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    // 1. Autenticación y Autorización:
    // Asegurarse de que el usuario está logueado y tiene un rol de empleado o administrador
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const allowedRoles = ['establishment_admin', 'waiter', 'cook'];
    if (!allowedRoles.includes(session.user.role)) { // Asumiendo que session.user.role coincide con los valores del enum
      return NextResponse.json({ error: "Permiso denegado: rol no autorizado." }, { status: 403 });
    }

    // El ID del establecimiento debe venir de la sesión del usuario logueado
    const establishmentId = session.user.establishment_id;
    if (!establishmentId) {
        return NextResponse.json({ error: "ID de establecimiento no disponible en la sesión del usuario." }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get('status'); // Opcional: filtrar por estado del pedido (PENDING, PREPARING, etc.)
    const orderTypeParam = searchParams.get('orderType'); // Opcional: filtrar por tipo de pedido (ej. "COCINA", "BAR")
    const languageCode = searchParams.get('lang') || 'es'; // Idioma por defecto 'es'

    // Construir la condición `where` para la consulta de pedidos
    const whereClause: any = {
      establishment_id: establishmentId, // Filtrar por el establecimiento del empleado
    };

    if (statusParam && Object.values(OrderStatus).includes(statusParam as OrderStatus)) {
      whereClause.status = statusParam as OrderStatus;
    }

    // Validar el `orderTypeParam` si tienes un enum para ello, o déjalo como string si es flexible.
    // Ejemplo si tienes un enum OrderType:
    // if (orderTypeParam && Object.values(OrderType).includes(orderTypeParam as OrderType)) {
    //   whereClause.order_type = orderTypeParam as OrderType;
    // } else if (orderTypeParam) {
    //   // Si no coincide con el enum, podrías devolver un error o ignorarlo
    //   console.warn(`Tipo de pedido no válido: ${orderTypeParam}`);
    // }
    if (orderTypeParam) {
      whereClause.order_type = orderTypeParam;
    }


    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    translations: { where: { language_code: languageCode } },
                    allergens: {
                      include: {
                        allergen: {
                          include: { translations: { where: { language_code: languageCode } } },
                        },
                      },
                    },
                  },
                },
                translations: { where: { language_code: languageCode } },
              },
            },
          },
          orderBy: { order_item_id: 'asc' }, // Ordenar ítems dentro del pedido
        },
        client: {
          select: {
            user_id: true,
            name: true,
            email: true,
          },
        },
        waiter: {
            select: {
              user_id: true,
              name: true,
              email: true,
            },
        },
        status_history: {
            orderBy: { changed_at: 'desc' }, // Último estado primero
        }
      },
      orderBy: { created_at: 'desc' }, // Últimos pedidos primero
    });

    // Mapear los resultados para serializar las traducciones y tipos Decimal
    const serializedOrders = orders.map(order => ({
      order_id: order.order_id,
      establishment_id: order.establishment_id,
      client_user_id: order.client_user_id,
      waiter_user_id: order.waiter_user_id,
      table_number: order.table_number,
      status: order.status,
      // Convertir Decimal a number. Usar `?? 0` para asegurar que sea un número si `total_amount` pudiera ser null
      total_amount: order.total_amount?.toNumber() ?? 0,
      payment_method: order.payment_method,
      payment_status: order.payment_status,
      order_type: order.order_type,
      notes: order.notes,
      created_at: order.created_at, // `Date` se serializa automáticamente a string ISO 8601 por JSON.stringify
      updated_at: order.updated_at, // `Date` se serializa automáticamente a string ISO 8601 por JSON.stringify
      client: order.client ? {
        user_id: order.client.user_id,
        name: order.client.name,
        email: order.client.email,
      } : null,
      waiter: order.waiter ? {
        user_id: order.waiter.user_id,
        name: order.waiter.name,
        email: order.waiter.email,
      } : null,
      // Serializar el historial de estado si contiene datos que necesitan transformación (ej. fechas)
      status_history: order.status_history.map(history => ({
        ...history,
        changed_at: history.changed_at, // La fecha se serializa automáticamente
      })),
      items: order.items.map(item => ({
        order_item_id: item.order_item_id,
        order_id: item.order_id,
        variant_id: item.variant_id,
        quantity: item.quantity,
        unit_price: item.unit_price.toNumber(),
        // Convertir Decimal a number. Usar `?? 0` para asegurar que sea un número
        item_total_price: item.item_total_price?.toNumber() ?? 0,
        status: item.status,
        notes: item.notes,
        // Incluir la información del producto y variante con traducciones priorizadas
        product: { // Asumimos que quieres la info del producto anidada aquí
          product_id: item.variant.product.product_id,
          // Prioriza la traducción del nombre del producto, si no existe usa el nombre base
          name: item.variant.product.translations[0]?.name || item.variant.product.name,
          // Prioriza la traducción de la descripción, si no existe usa la descripción base
          description: item.variant.product.translations[0]?.description || item.variant.product.description,
          image_url: item.variant.product.image_url,
          allergens: item.variant.product.allergens.map(pa => ({
            // No es necesario incluir `product_id` o `allergen_id` del pivot `ProductAllergen` aquí
            allergen_id: pa.allergen.allergen_id,
            code: pa.allergen.code,
            // Prioriza la traducción del nombre del alérgeno
            name: pa.allergen.translations[0]?.name || pa.allergen.name,
            description: pa.allergen.translations[0]?.description || pa.allergen.description,
            icon_url: pa.allergen.icon_url,
            is_major_allergen: pa.allergen.is_major_allergen,
            // Si no necesitas las traducciones directas en el frontend, puedes omitir esta línea
            // translations: pa.allergen.translations,
          })),
        },
        variant: { // Asumimos que quieres la info de la variante anidada aquí
            variant_id: item.variant.variant_id,
            // Prioriza la traducción de la descripción de la variante
            variant_description: item.variant.translations[0]?.variant_description || item.variant.variant_description,
            price: item.variant.price.toNumber(),
            sku: item.variant.sku,
            // Si no necesitas las traducciones directas, puedes omitir
            // translations: item.variant.translations,
        }
      })),
    }));

    return NextResponse.json(serializedOrders);
  } catch (error) {
    console.error('Error al obtener pedidos de empleados:', error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: 'Error al obtener pedidos de empleados', message: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'Ocurrió un error inesperado' },
      { status: 500 }
    );
  }
}
