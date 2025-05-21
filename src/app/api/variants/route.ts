import { NextResponse } from 'next/server';
import { getAllVariants, createVariant } from '@/services/variant-service';
import { variantSchema } from '@/lib/validations/variantSchemas';

export async function GET() {
  const variants = await getAllVariants();
  return NextResponse.json(variants);
}

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = variantSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const variant = await createVariant(parsed.data);
  return NextResponse.json(variant);
}
