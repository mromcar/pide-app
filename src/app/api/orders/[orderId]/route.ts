import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const orderIdSchema = z.object({
  orderId: z.string().regex(/^\d+$/, 'Order ID must be a valid number').transform(val => parseInt(val, 10))
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    // Await the params first
    const resolvedParams = await params;
    console.log('Received orderId param:', resolvedParams.orderId);

    const validation = orderIdSchema.safeParse(resolvedParams);

    if (!validation.success) {
      console.error('Validation failed:', validation.error);
      return NextResponse.json(
        { message: 'Invalid order ID', errors: validation.error.errors },
        { status: 400 }
      );
    }

    const { orderId } = validation.data;
    console.log('Parsed orderId:', orderId);

    const order = await prisma.order.findUnique({
      where: { order_id: orderId },
      include: {
        order_items: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    translations: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!order) {
      console.log('Order not found for ID:', orderId);
      return NextResponse.json(
        { message: 'Order not found' },
        { status: 404 }
      );
    }

    console.log('Order found successfully:', order.order_id);
    return NextResponse.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
