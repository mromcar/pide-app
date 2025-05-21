//src/app/api/products/route.ts

import { NextResponse } from 'next/server';
import { getAllProducts, createProduct } from '@/services/product-service';
import { productSchema } from '@/lib/validations/productSchemas';

export async function GET() {
  const products = await getAllProducts();
  return NextResponse.json(products);
}

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = productSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const product = await createProduct(parsed.data);
  return NextResponse.json(product);
}
