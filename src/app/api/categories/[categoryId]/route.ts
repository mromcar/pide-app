//src/app/api/categories/[categoryId]/route.ts
import { NextResponse } from 'next/server';
import { updateCategory, deleteCategory } from '@/services/category-service';
import { categorySchema } from '@/lib/validations/categorySchemas';

export async function PUT(req: Request, { params }: { params: { categoryId: string } }) {
  const body = await req.json();
  const parsed = categorySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const category = await updateCategory(params.categoryId, parsed.data);
  return NextResponse.json(category);
}

export async function DELETE(_: Request, { params }: { params: { categoryId: string } }) {
  await deleteCategory(params.categoryId);
  return NextResponse.json({ success: true });
}
