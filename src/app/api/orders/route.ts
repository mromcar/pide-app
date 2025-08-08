import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const orderItemSchema = z.object({
  variantId: z.number(),
  quantity: z.number().min(1),
  unitPrice: z.number(),
});

const createOrderSchema = z.object({
  establishmentId: z.number(),
  tableNumber: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(orderItemSchema).min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = createOrderSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(validation.error.errors, { status: 400 });
    }

    const { establishmentId, tableNumber, notes, items } = validation.data;

    const totalAmount = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

    const order = await prisma.order.create({
      data: {
        establishmentId: establishmentId,
        tableNumber: tableNumber,
        notes,
        totalAmount: totalAmount,
        status: 'pending',
        orderItems: {
          create: items.map(item => ({
            variantId: item.variantId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            status: 'pending',
          })),
        },
      },
      include: {
        orderItems: true,
      },
    });

    // Devuelve los datos en camelCase (no uses snakecase-keys)
    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Failed to create order:', error);
    return NextResponse.json({ message: 'Failed to create order' }, { status: 500 });
  }
}
