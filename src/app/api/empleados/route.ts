import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import bcrypt from 'bcryptjs'

// Obtener todos los empleados del establecimiento
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'establishment_admin') {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }
  const empleados = await prisma.user.findMany({
    where: {
      establishment_id: session.user.establishment_id,
      role: { in: ['waiter', 'cook'] }
    },
    select: {
      user_id: true,
      name: true,
      email: true,
      role: true
    }
  })
  return NextResponse.json({ empleados })
}

// Crear un nuevo empleado
export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'establishment_admin') {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }
  const { name, email, password, role } = await request.json()
  if (!name || !email || !password || !role) {
    return NextResponse.json({ error: "Datos incompletos" }, { status: 400 })
  }
  if (!['waiter', 'cook'].includes(role)) {
    return NextResponse.json({ error: "Rol no permitido" }, { status: 400 })
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: "Email no válido" }, { status: 400 })
  }
  const existe = await prisma.user.findUnique({ where: { email } })
  if (existe) {
    return NextResponse.json({ error: "El email ya está registrado" }, { status: 400 })
  }
  const hashed = await bcrypt.hash(password, 10)
  const empleado = await prisma.user.create({
    data: {
      name,
      email,
      password_hash: hashed,
      role,
      establishment_id: session.user.establishment_id,
    }
  })
  return NextResponse.json({ empleado })
}

// Editar empleado (solo nombre y rol)
export async function PUT(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'establishment_admin') {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }
  const { user_id, name, role } = await request.json()
  if (!user_id || !name || !role) {
    return NextResponse.json({ error: "Datos incompletos" }, { status: 400 })
  }
  const empleado = await prisma.user.findUnique({ where: { user_id } })
  if (!empleado || empleado.establishment_id !== session.user.establishment_id) {
    return NextResponse.json({ error: "Empleado no encontrado" }, { status: 404 })
  }
  const updatedEmpleado = await prisma.user.update({
    where: { user_id },
    data: { name, role }
  })
  return NextResponse.json({ updatedEmpleado })
}

// Eliminar empleado
export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'establishment_admin') {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }
  const { user_id } = await request.json()
  if (!user_id) {
    return NextResponse.json({ error: "Falta user_id" }, { status: 400 })
  }
  if (user_id === session.user.user_id) {
    return NextResponse.json({ error: "No puedes eliminar tu propia cuenta" }, { status: 400 })
  }
  const empleado = await prisma.user.findUnique({ where: { user_id } })
  if (!empleado || empleado.establishment_id !== session.user.establishment_id) {
    return NextResponse.json({ error: "Empleado no encontrado" }, { status: 404 })
  }
  await prisma.user.delete({
    where: { user_id }
  })
  return NextResponse.json({ ok: true })
}
