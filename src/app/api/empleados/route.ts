import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import bcrypt from 'bcryptjs'

// Obtener todos los empleados del establecimiento
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.rol !== 'establishment_admin') {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }
  const empleados = await prisma.usuario.findMany({
    where: {
      id_establecimiento: session.user.id_establecimiento,
      rol: { in: ['camarero', 'cocinero'] }
    },
    select: {
      id_usuario: true,
      nombre: true,
      email: true,
      rol: true
    }
  })
  return NextResponse.json({ empleados })
}

// Crear un nuevo empleado
export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.rol !== 'establishment_admin') {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }
  const { nombre, email, password, rol } = await request.json()
  if (!nombre || !email || !password || !rol) {
    return NextResponse.json({ error: "Datos incompletos" }, { status: 400 })
  }
  if (!['camarero', 'cocinero'].includes(rol)) {
    return NextResponse.json({ error: "Rol no permitido" }, { status: 400 })
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: "Email no válido" }, { status: 400 })
  }
  const existe = await prisma.usuario.findUnique({ where: { email } })
  if (existe) {
    return NextResponse.json({ error: "El email ya está registrado" }, { status: 400 })
  }
  const hashed = await bcrypt.hash(password, 10)
  const empleado = await prisma.usuario.create({
    data: {
      nombre,
      email,
      contrasena: hashed,
      rol,
      id_establecimiento: session.user.id_establecimiento,
    }
  })
  return NextResponse.json({ empleado })
}

// Editar empleado (solo nombre y rol)
export async function PUT(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.rol !== 'establishment_admin') {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }
  const { id_usuario, nombre, rol } = await request.json()
  if (!id_usuario || !nombre || !rol) {
    return NextResponse.json({ error: "Datos incompletos" }, { status: 400 })
  }
  const empleado = await prisma.usuario.findUnique({ where: { id_usuario } })
  if (!empleado || empleado.id_establecimiento !== session.user.id_establecimiento) {
    return NextResponse.json({ error: "Empleado no encontrado" }, { status: 404 })
  }
  const updatedEmpleado = await prisma.usuario.update({
    where: { id_usuario },
    data: { nombre, rol }
  })
  return NextResponse.json({ updatedEmpleado })
}

// Eliminar empleado
export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.rol !== 'establishment_admin') {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }
  const { id_usuario } = await request.json()
  if (!id_usuario) {
    return NextResponse.json({ error: "Falta id_usuario" }, { status: 400 })
  }
  if (id_usuario === session.user.id) {
    return NextResponse.json({ error: "No puedes eliminar tu propia cuenta" }, { status: 400 })
  }
  const empleado = await prisma.usuario.findUnique({ where: { id_usuario } })
  if (!empleado || empleado.id_establecimiento !== session.user.id_establecimiento) {
    return NextResponse.json({ error: "Empleado no encontrado" }, { status: 404 })
  }
  await prisma.usuario.delete({
    where: { id_usuario }
  })
  return NextResponse.json({ ok: true })
}
