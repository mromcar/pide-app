import { NextResponse } from 'next/server';
import { getAllOrders } from '@/services/orderServices';

export async function GET() {
  const orders = await getAllOrders();
  return NextResponse.json(orders);
}
