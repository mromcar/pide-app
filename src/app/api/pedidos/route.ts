import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { EstadoPedidoGeneral } from '@prisma/client'
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function PUT(request: Request) {
  const { id_pedido, estado } = await request.json()
  await prisma.pedido.update({
    where: { id_pedido },
    data: { estado },
  })
  return NextResponse.json({ ok: true })
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const pedidos = await prisma.pedido.findMany({
    where: {
      estado: { not: EstadoPedidoGeneral.COMPLETADO },
      id_establecimiento: session.user.id_establecimiento,
    },
    include: {
      detalles: { include: { producto: true } },
      establecimiento: true,
    },
    orderBy: { fecha_hora: 'desc' },
  })
  return NextResponse.json({ pedidos })
}
