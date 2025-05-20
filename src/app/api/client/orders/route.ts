// src/app/api/client/orders/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Asume que tienes tu instancia de Prisma
import { CreateOrderSchema } from '@/types/dtos'; // Importa el esquema de Zod
import { OrderStatus, PaymentStatus } from '@prisma/client'; // Importa los enums de Prisma

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. Validación con Zod
    const validationResult = CreateOrderSchema.safeParse(body);

    if (!validationResult.success) {
      console.error('Validation errors:', validationResult.error.flatten().fieldErrors);
      return NextResponse.json(
        {
          error: "Datos de pedido no válidos",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { establishment_id, table_number, items, notes } = validationResult.data;

    // 2. Verificar existencia del establecimiento y sus productos/variantes
    const establishment = await prisma.establishment.findUnique({
      where: { establishment_id },
      select: { establishment_id: true },
    });

    if (!establishment) {
      return NextResponse.json({ error: "Establecimiento no encontrado." }, { status: 404 });
    }

    // Obtener información detallada de las variantes para calcular el total
    const variantIds = items.map(item => item.variant_id);
    const productVariants = await prisma.productVariant.findMany({
      where: {
        variant_id: { in: variantIds },
        product: {
          category: {
            establishment_id: establishment_id // Asegura que las variantes pertenecen a este establecimiento
          }
        }
      },
      select: {
        variant_id: true,
        price: true,
      },
    });

    // Mapear variantes para fácil acceso y verificar si todas existen
    const variantMap = new Map(productVariants.map(v => [v.variant_id, v]));

    let total_amount = 0;
    for (const item of items) {
      const variant = variantMap.get(item.variant_id);
      if (!variant) {
        return NextResponse.json(
          { error: `Variante de producto con ID ${item.variant_id} no encontrada o no pertenece al establecimiento.` },
          { status: 400 }
        );
      }
      total_amount += variant.price.toNumber() * item.quantity; // Asegúrate de manejar Decimal
    }

    // 3. Crear el pedido y los ítems del pedido en una transacción
    // Esto es vital para asegurar que la operación es atómica (o todo se guarda, o nada)
    const newOrder = await prisma.$transaction(async (prisma) => {
      const order = await prisma.order.create({
        data: {
          establishment_id: establishment_id,
          table_number: table_number,
          status: OrderStatus.PENDING, // Estado inicial del pedido
          total_amount: total_amount, // Usa el total calculado
          payment_status: PaymentStatus.PENDING, // Estado inicial de pago
          notes: notes,
          order_type: 'TABLE_ORDER', // O puedes deducir esto de alguna manera
          created_at: new Date(),
          updated_at: new Date(),
          items: {
            create: items.map(item => ({
              variant_id: item.variant_id,
              quantity: item.quantity,
              unit_price: variantMap.get(item.variant_id)!.price, // Precio unitario de la variante
              item_total_price: variantMap.get(item.variant_id)!.price.toNumber() * item.quantity,
              status: OrderStatus.PENDING, // Estado inicial del ítem
            })),
          },
          status_history: {
            create: {
              status: OrderStatus.PENDING,
              notes: 'Pedido creado por el cliente.',
            },
          },
        },
        include: {
          items: {
            include: {
              variant: {
                include: {
                  product: {
                    include: {
                      translations: true,
                      allergens: {
                        include: { allergen: { include: { translations: true } } }
                      }
                    }
                  },
                  translations: true
                }
              }
            }
          },
          status_history: {
            orderBy: { changed_at: 'desc' }
          }
        },
      });
      return order;
    });

    // 4. Serializar la respuesta (convertir Decimal a number, etc.)
    const serializedOrder = {
        ...newOrder,
        total_amount: newOrder.total_amount?.toNumber() ?? 0,
        // Serializa otras fechas si es necesario o asegúrate de que JSON.stringify las maneje
        created_at: newOrder.created_at.toISOString(),
        updated_at: newOrder.updated_at.toISOString(),
        items: newOrder.items.map(item => ({
            ...item,
            unit_price: item.unit_price.toNumber(),
            item_total_price: item.item_total_price?.toNumber() ?? 0,
            variant: {
                ...item.variant,
                price: item.variant.price.toNumber(),
                // Lógica de traducción para variante
                variant_description: item.variant.translations[0]?.variant_description || item.variant.variant_description,
                product: {
                  ...item.variant.product,
                  // Lógica de traducción para producto
                  name: item.variant.product.translations[0]?.name || item.variant.product.name,
                  description: item.variant.product.translations[0]?.description || item.variant.product.description,
                  allergens: item.variant.product.allergens.map(pa => ({
                    ...pa,
                    allergen: {
                      ...pa.allergen,
                      name: pa.allergen.translations[0]?.name || pa.allergen.name,
                      description: pa.allergen.translations[0]?.description || pa.allergen.description,
                    }
                  }))
                }
            }
        })),
        status_history: newOrder.status_history.map(history => ({
          ...history,
          changed_at: history.changed_at.toISOString(),
        }))
    };


    return NextResponse.json(serializedOrder, { status: 201 });
  } catch (error) {
    console.error('Error al crear el pedido:', error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: 'Error al crear el pedido', message: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'Ocurrió un error inesperado al crear el pedido.' },
      { status: 500 }
    );
  }
}
