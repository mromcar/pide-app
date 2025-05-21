import { NextResponse } from 'next/server';
import { updateAllergen, deleteAllergen } from '@/services/allergen-service';
import { allergenSchema } from '@/lib/validations/allergenSchemas';

export async function PUT(req: Request, { params }: { params: { allergenId: string } }) {
  const body = await req.json();
  const parsed = allergenSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const allergen = await updateAllergen(params.allergenId, parsed.data);
  return NextResponse.json(allergen);
}

export async function DELETE(_: Request, { params }: { params: { allergenId: string } }) {
  await deleteAllergen(params.allergenId);
  return NextResponse.json({ success: true });
}
