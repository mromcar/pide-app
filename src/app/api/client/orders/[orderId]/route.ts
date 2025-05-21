//src/app/api/client/orders/[orderId]/route.ts
import { NextResponse } from 'next/server';
import { updateOrderStatusSchema } from '@/lib/validations/orderSchemas';
import { updateOrderStatus } from '@/services/orderServices';

export async function PATCH(req: Request, { params }: { params: { orderId: string } }) {
  const body = await req.json();
  const parsed = updateOrderStatusSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const updated = await updateOrderStatus(params.orderId, parsed.data.status);
  return NextResponse.json(updated);
}
