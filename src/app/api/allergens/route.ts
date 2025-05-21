import { NextResponse } from 'next/server';
import { getAllAllergens, createAllergen } from '@/services/allergen-service';
import { allergenSchema } from '@/lib/validations/allergenSchemas';

export async function GET() {
  const allergens = await getAllAllergens();
  return NextResponse.json(allergens);
}

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = allergenSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const allergen = await createAllergen(parsed.data);
  return NextResponse.json(allergen);
}
