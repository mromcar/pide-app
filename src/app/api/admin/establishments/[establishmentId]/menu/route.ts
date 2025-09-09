import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { MenuService } from '@/services/menu.service'
import { mapPrismaMenuToAdminDTO } from '@/services/mappers/menuMappers'

type Params = { establishmentId: string }

async function canManage(session: any, estId: number) {
  const role = session?.user?.role as string | undefined
  if (!role) return false
  if (role === 'general_admin') return true
  if (role !== 'establishment_admin') return false

  // Para establishment_admin, validar asignación
  const userId = Number(session.user.id)
  if (!Number.isFinite(userId)) return false

  // Si lleva establishmentId en sesión y coincide, OK
  const sessionEstId = Number(session.user.establishmentId)
  if (Number.isFinite(sessionEstId) && sessionEstId === estId) return true

  // Si no, comprueba la tabla puente
  const link = await prisma.establishmentAdministrator.findUnique({
    where: { userId_establishmentId: { userId, establishmentId: estId } },
  })
  return !!link
}

export async function GET(_req: Request, { params }: { params: Params }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const estId = Number(params.establishmentId)
  if (!Number.isFinite(estId) || estId <= 0) {
    return NextResponse.json({ error: 'Invalid establishmentId' }, { status: 400 })
  }
  if (!(await canManage(session, estId))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const prismaResult = await MenuService.getMenu(estId)
    const categories = mapPrismaMenuToAdminDTO(prismaResult)
    return NextResponse.json({ categories }, { status: 200 })
  } catch (err) {
    console.error('GET /api/admin/establishments/[id]/menu failed', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
