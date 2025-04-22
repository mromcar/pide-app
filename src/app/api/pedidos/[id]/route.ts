import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || !['establishment_admin', 'camarero', 'cocinero'].includes(session.user.rol)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }
  const id_pedido = Number(params.id)
  if (isNaN(id_pedido)) {
    return NextResponse.json({ error: "ID no válido" }, { status: 400 })
  }
  const pedido = await prisma.pedido.findUnique({
    where: { id_pedido },
    include: {
      detalles: { include: { producto: true } },
      establecimiento: true,
      cliente: true,
    }
  })
  if (!pedido || pedido.id_establecimiento !== session.user.id_establecimiento) {
    return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 })
  }
  return NextResponse.json({ pedido })
}
