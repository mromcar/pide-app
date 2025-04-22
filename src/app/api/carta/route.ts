import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

// Obtener la carta del establecimiento del empleado autenticado
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const categorias = await prisma.categoria.findMany({
    where: { id_establecimiento: session.user.id_establecimiento },
    include: { productos: true },
    orderBy: { id_categoria: 'asc' },
  })

  return NextResponse.json({ categorias })
}

// Añadir una nueva categoría
export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { nombre } = await request.json()
  if (!nombre) return NextResponse.json({ error: "Nombre requerido" }, { status: 400 })

  const categoria = await prisma.categoria.create({
    data: {
      nombre,
      id_establecimiento: session.user.id_establecimiento,
    },
  })

  return NextResponse.json({ categoria })
}

// Editar una categoría
export async function PUT(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id_categoria, nombre } = await request.json()
  if (!id_categoria || !nombre) return NextResponse.json({ error: "Datos incompletos" }, { status: 400 })

  const categoria = await prisma.categoria.update({
    where: { id_categoria },
    data: { nombre },
  })
  return NextResponse.json({ categoria })
}

// Borrar categoría o producto
export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const body = await request.json()
  if (body.id_producto) {
    await prisma.producto.delete({
      where: { id_producto: body.id_producto },
    })
    return NextResponse.json({ ok: true })
  }
  if (body.id_categoria) {
    await prisma.categoria.delete({
      where: { id_categoria: body.id_categoria },
    })
    return NextResponse.json({ ok: true })
  }
  return NextResponse.json({ error: "Falta id_categoria o id_producto" }, { status: 400 })
}

// Editar producto
export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id_producto, nombre, precio } = await request.json()
  if (!id_producto || !nombre || precio === undefined) {
    return NextResponse.json({ error: "Datos incompletos" }, { status: 400 })
  }
  const producto = await prisma.producto.update({
    where: { id_producto },
    data: { nombre, precio: parseFloat(precio) },
  })
  return NextResponse.json({ producto })
}
