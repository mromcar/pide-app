import { NextResponse } from 'next/server';
import { updateVariant, deleteVariant } from '@/services/variant-service';
import { variantSchema } from '@/lib/validations/variantSchemas';

export async function PUT(req: Request, { params }: { params: { variantId: string } }) {
  const body = await req.json();
  const parsed = variantSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const variant = await updateVariant(params.variantId, parsed.data);
  return NextResponse.json(variant);
}

export async function DELETE(_: Request, { params }: { params: { variantId: string } }) {
  await deleteVariant(params.variantId);
  return NextResponse.json({ success: true });
}
