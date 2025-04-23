import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { EstadoPedidoGeneral } from '@prisma/client'
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

// Cambiar estado de un pedido (solo admin)
export async function PUT(request: Request) {
  const session = await getServerSession(authOptions)
  console.log('SESSION:', session)

  if (!session || !['establishment_admin', 'camarero', 'cocinero'].includes(session.user.rol)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }
  const { id_pedido, estado } = await request.json()
  if (!id_pedido || !estado) {
    return NextResponse.json({ error: "Datos incompletos" }, { status: 400 })
  }
  // Validar que el estado es válido
  if (!Object.values(EstadoPedidoGeneral).includes(estado)) {
    return NextResponse.json({ error: "Estado no válido" }, { status: 400 })
  }
  // Actualizar solo si el pedido pertenece al establecimiento del admin
  const pedido = await prisma.pedido.findUnique({
    where: { id_pedido },
    select: { id_establecimiento: true }
  })
  if (!pedido || pedido.id_establecimiento !== session.user.id_establecimiento) {
    return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 })
  }
  await prisma.pedido.update({
    where: { id_pedido },
    data: { estado },
  })
  return NextResponse.json({ ok: true })
}

// Obtener pedidos activos del establecimiento
export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session || !['establishment_admin', 'camarero', 'cocinero'].includes(session.user.rol)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const estado = searchParams.get('estado') as EstadoPedidoGeneral | null

  const where: any = {
    id_establecimiento: session.user.id_establecimiento,
  }

  // Si es camarero o cocinero, excluye COMPLETADO y CANCELADO
  if (['camarero', 'cocinero'].includes(session.user.rol)) {
    where.estado = { notIn: [EstadoPedidoGeneral.COMPLETADO, EstadoPedidoGeneral.CANCELADO] }
  } else if (estado && Object.values(EstadoPedidoGeneral).includes(estado)) {
    where.estado = estado
  } else {
    where.estado = { not: EstadoPedidoGeneral.COMPLETADO }
  }

  const pedidos = await prisma.pedido.findMany({
    where,
    include: {
      detalles: { include: { producto: true } },
      establecimiento: true,
      cliente: true,
    },
    orderBy: { fecha_hora: 'desc' },
  })
  return NextResponse.json({ pedidos })
}
