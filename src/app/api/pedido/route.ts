import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { id_establecimiento, productos } = data

    const pedido = await prisma.pedido.create({
      data: {
        id_establecimiento,
        detalles: {
          create: productos.map((p: { id_producto: number; cantidad: number }) => ({
            id_producto: p.id_producto,
            cantidad: p.cantidad,
          })),
        },
      },
    })

    return NextResponse.json({ ok: true, id_pedido: pedido.id_pedido })
  } catch (error) {
    console.error('Error al crear pedido:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ ok: false, error: errorMessage }, { status: 500 })
  }
}
