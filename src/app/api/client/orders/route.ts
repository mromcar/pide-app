import { NextResponse } from 'next/server';
import { createOrderSchema } from '@/lib/validations/orderSchemas';
import { createOrder } from '@/services/orderServices';

export async function POST(req: Request) {
  const body = await req.json();

  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const order = await createOrder(parsed.data);
  return NextResponse.json(order);
}
