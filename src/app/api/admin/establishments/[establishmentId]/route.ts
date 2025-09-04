// ✅ CORREGIR: src/app/api/admin/establishments/[establishmentId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getEstablishmentById, updateEstablishment } from '@/services/establishment.service'
import { getServerSession } from 'next-auth'
import { ApiError } from '@/utils/apiUtils'
import { UserRole } from '@prisma/client'

// ✅ IMPORTAR desde tu configuración real de NextAuth
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

/**
 * GET /api/admin/establishments/[establishmentId]
 * Obtiene información de un establecimiento para usuarios admin
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ establishmentId: string }> } // ✅ Promise agregado
) {
  try {
    // ✅ 1. Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // ✅ 2. Verificar permisos
    const allowedRoles: UserRole[] = [
      UserRole.establishment_admin,
      UserRole.waiter,
      UserRole.cook,
      UserRole.general_admin
    ]

    if (!allowedRoles.includes(session.user.role as UserRole)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // ✅ 3. AWAIT params antes de usar sus propiedades
    const { establishmentId: establishmentIdStr } = await params
    const establishmentId = parseInt(establishmentIdStr, 10)

    if (isNaN(establishmentId) || establishmentId <= 0) {
      return NextResponse.json(
        { error: 'Invalid establishment ID' },
        { status: 400 }
      )
    }

    // ✅ 4. Verificar que el usuario pertenece al establishment (excepto general_admin)
    if (
      session.user.role !== UserRole.general_admin &&
      session.user.establishmentId !== establishmentId
    ) {
      return NextResponse.json(
        { error: 'Access denied to this establishment' },
        { status: 403 }
      )
    }

    console.log(`🔍 [GET] /api/admin/establishments/${establishmentId} - User: ${session.user.id}`)

    // ✅ 5. Obtener establishment
    const establishment = await getEstablishmentById(establishmentId)

    if (!establishment) {
      console.log(`❌ Establishment not found: ${establishmentId}`)
      return NextResponse.json(
        { error: 'Establishment not found' },
        { status: 404 }
      )
    }

    console.log(`✅ Establishment found: ${establishment.name}`)

    // ✅ 6. Retornar datos
    return NextResponse.json(establishment, { status: 200 })

  } catch (error) {
    console.error('❌ Error in GET /api/admin/establishments/[establishmentId]:', error)

    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/establishments/[establishmentId]
 * Actualiza información del establecimiento
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ establishmentId: string }> } // ✅ Promise agregado
) {
  try {
    // ✅ Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // ✅ Solo establishment_admin y general_admin pueden actualizar
    const allowedRoles: UserRole[] = [
      UserRole.establishment_admin,
      UserRole.general_admin
    ]

    if (!allowedRoles.includes(session.user.role as UserRole)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // ✅ AWAIT params antes de usar sus propiedades
    const { establishmentId: establishmentIdStr } = await params
    const establishmentId = parseInt(establishmentIdStr, 10)

    if (isNaN(establishmentId) || establishmentId <= 0) {
      return NextResponse.json(
        { error: 'Invalid establishment ID' },
        { status: 400 }
      )
    }

    // ✅ Verificar pertenencia (excepto general_admin)
    if (
      session.user.role !== UserRole.general_admin &&
      session.user.establishmentId !== establishmentId
    ) {
      return NextResponse.json(
        { error: 'Access denied to this establishment' },
        { status: 403 }
      )
    }

    const updateData = await request.json()

    console.log(`🔍 [PUT] /api/admin/establishments/${establishmentId} - User: ${session.user.id}`)

    const updatedEstablishment = await updateEstablishment(establishmentId, updateData)

    if (!updatedEstablishment) {
      return NextResponse.json(
        { error: 'Failed to update establishment' },
        { status: 500 }
      )
    }

    console.log(`✅ Establishment updated: ${updatedEstablishment.name}`)

    return NextResponse.json(updatedEstablishment, { status: 200 })

  } catch (error) {
    console.error('❌ Error in PUT /api/admin/establishments/[establishmentId]:', error)

    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
