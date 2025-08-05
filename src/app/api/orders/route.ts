import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const orderItemSchema = z.object({
  variant_id: z.number(),
  quantity: z.number().min(1),
  unit_price: z.number(),
});

const createOrderSchema = z.object({
  establishment_id: z.number(),
  table_number: z.string().optional(),
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

    const { establishment_id, table_number, notes, items } = validation.data;

    const total_amount = items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);

    const order = await prisma.order.create({  // Cambiar de prisma.orders a prisma.order
      data: {
        establishment_id,
        table_number,
        notes,
        total_amount,
        status: 'pending',
        order_items: {
          create: items.map(item => ({
            variant_id: item.variant_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            status: 'pending',
          })),
        },
      },
      include: {
        order_items: true,
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Failed to create order:', error);
    return NextResponse.json({ message: 'Failed to create order' }, { status: 500 });
  }
}
