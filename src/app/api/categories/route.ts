//src/app/api/client/orders/[orderId]/route.ts


import { NextResponse } from 'next/server';
import { createCategory, getAllCategories } from '@/services/category-service';
import { categorySchema } from '@/lib/validations/categorySchemas';

export async function GET() {
  const categories = await getAllCategories();
  return NextResponse.json(categories);
}

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = categorySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const category = await createCategory(parsed.data);
  return NextResponse.json(category);
}
