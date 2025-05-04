import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { jsonOk, jsonError } from '@/utils/api'

// Helper para obtener la sesión y lanzar error si no hay sesión
async function requireSession() {
  const session = await getServerSession(authOptions)
  if (!session) throw jsonError("No autorizado", 401)
  return session
}

// GET: Obtener carta
export async function GET() {
  try {
    const session = await requireSession()
    const categorias = await prisma.categoria.findMany({
      where: { id_establecimiento: session.user.id_establecimiento },
      select: {
        id_categoria: true,
        nombre: true,
        imagen_url: true, // <-- Añadido
        productos: {
          select: {
            id_producto: true,
            nombre: true,
            descripcion: true,
            precio: true,
            imagen_url: true, // <-- Añadido
            ProductoTraduccion: {
              select: {
                id_traduccion: true,
                nombre: true,
                descripcion: true,
              },
            },
          },
        },
      },
      orderBy: { id_categoria: 'asc' },
    })
    return jsonOk({ categorias })
  } catch (e: any) {
    return e instanceof NextResponse ? e : jsonError("Error interno", 500)
  }
}

// POST: Añadir categoría
export async function POST(request: Request) {
  try {
    const session = await requireSession()
    const { nombre } = await request.json()
    if (!nombre) return jsonError("Nombre requerido")
    const categoria = await prisma.categoria.create({
      data: {
        nombre,
        id_establecimiento: session.user.id_establecimiento,
      },
    })
    return jsonOk({ categoria })
  } catch (e: any) {
    return e instanceof NextResponse ? e : jsonError("Error interno", 500)
  }
}

// PUT: Editar categoría
export async function PUT(request: Request) {
  try {
    const session = await requireSession()
    const { id_categoria, nombre } = await request.json()
    if (!id_categoria || !nombre) return jsonError("Datos incompletos")
    const categoria = await prisma.categoria.update({
      where: { id_categoria },
      data: { nombre },
    })
    return jsonOk({ categoria })
  } catch (e: any) {
    return e instanceof NextResponse ? e : jsonError("Error interno", 500)
  }
}

// DELETE: Borrar categoría o producto
export async function DELETE(request: Request) {
  try {
    const session = await requireSession()
    const body = await request.json()
    if (body.id_producto) {
      await prisma.producto.delete({ where: { id_producto: body.id_producto } })
      return jsonOk({ ok: true })
    }
    if (body.id_categoria) {
      await prisma.categoria.delete({ where: { id_categoria: body.id_categoria } })
      return jsonOk({ ok: true })
    }
    return jsonError("Falta id_categoria o id_producto")
  } catch (e: any) {
    return e instanceof NextResponse ? e : jsonError("Error interno", 500)
  }
}

// PATCH: Editar producto
export async function PATCH(request: Request) {
  try {
    const session = await requireSession()
    const { id_producto, nombre, precio } = await request.json()
    if (!id_producto || !nombre || precio === undefined) {
      return jsonError("Datos incompletos")
    }
    const producto = await prisma.producto.update({
      where: { id_producto },
      data: { nombre, precio: parseFloat(precio) },
    })
    return jsonOk({ producto })
  } catch (e: any) {
    return e instanceof NextResponse ? e : jsonError("Error interno", 500)
  }
}
