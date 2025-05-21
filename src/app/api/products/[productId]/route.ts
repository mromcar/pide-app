import { NextResponse } from 'next/server';
import { updateProduct, deleteProduct } from '@/services/product-service';
import { productSchema } from '@/lib/validations/productSchemas';

export async function PUT(req: Request, { params }: { params: { productId: string } }) {
  const body = await req.json();
  const parsed = productSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const product = await updateProduct(params.productId, parsed.data);
  return NextResponse.json(product);
}

export async function DELETE(_: Request, { params }: { params: { productId: string } }) {
  await deleteProduct(params.productId);
  return NextResponse.json({ success: true });
}
