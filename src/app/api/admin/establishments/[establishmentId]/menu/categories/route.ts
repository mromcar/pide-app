import { NextRequest } from 'next/server'
import { requireAuth } from '@/middleware/auth-middleware'
import { UserRole } from '@/constants/enums'
import * as categoryService from '@/services/category.service'
import { categoryCreateSchema } from '@/schemas/category'
import { jsonOk, jsonError } from '@/utils/api'
import { ZodError } from 'zod'
import logger from '@/lib/logger'

export async function GET(
  _req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ establishmentId: string }> }
) {
  try {
    // 🔒 Autenticación requerida para admin
    const session = await requireAuth([UserRole.general_admin, UserRole.establishment_admin])

    const params = await paramsPromise
    const establishmentId = Number(params.establishmentId)

    logger.info(`[ADMIN API] Fetching categories for establishmentId: ${establishmentId} by user: ${session.user.id}`)

    if (isNaN(establishmentId)) {
      logger.warn(`[ADMIN API] Invalid establishmentId received: ${params.establishmentId}`)
      return jsonError('Invalid establishment ID', 400)
    }

    // 🔒 Verificar permisos específicos del establecimiento
    if (session.user.role === UserRole.establishment_admin && session.user.establishmentId !== establishmentId) {
      logger.warn(`[ADMIN API] User ${session.user.id} attempted to access establishment ${establishmentId} but belongs to ${session.user.establishmentId}`)
      return jsonError('Forbidden: You can only manage your own establishment', 403)
    }

    // 🔒 Obtener todas las categorías (activas e inactivas) para administración
    const categories = await categoryService.getAllCategoriesByEstablishment(establishmentId, 1, 100)

    logger.info(`[ADMIN API] Found ${categories.length} categories for establishmentId: ${establishmentId}`)

    return jsonOk({ categories })
  } catch (error) {
    // 🔍 Manejo especial para Response objects (de jsonError)
    if (error instanceof Response) {
      return error // Devolver directamente la respuesta de autenticación
    }

    let establishmentIdForErrorLog = 'unknown'
    try {
      const params = await paramsPromise
      establishmentIdForErrorLog = params.establishmentId
    } catch (paramsError) {
      logger.error('[ADMIN API] Error resolving params for categories logging:', paramsError)
    }

    logger.error(`[ADMIN API] Error fetching categories for establishment ${establishmentIdForErrorLog}:`, error)

    if (error instanceof ZodError) {
      return jsonError(error.errors, 400)
    } else if (error instanceof Error) {
      return jsonError(error.message, 500)
    } else {
      return jsonError('An unexpected error occurred', 500)
    }
  }
}

export async function POST(
  request: NextRequest,
  { params: paramsPromise }: { params: Promise<{ establishmentId: string }> }
) {
  try {
    // 🔒 Autenticación requerida para admin
    const session = await requireAuth([UserRole.general_admin, UserRole.establishment_admin])

    const params = await paramsPromise
    const establishmentId = Number(params.establishmentId)

    logger.info(`[ADMIN API] Creating category for establishmentId: ${establishmentId} by user: ${session.user.id}`)

    if (isNaN(establishmentId)) {
      logger.warn(`[ADMIN API] Invalid establishmentId for category creation: ${params.establishmentId}`)
      return jsonError('Invalid establishment ID', 400)
    }

    // 🔒 Verificar permisos específicos del establecimiento
    if (session.user.role === UserRole.establishment_admin && session.user.establishmentId !== establishmentId) {
      logger.warn(`[ADMIN API] User ${session.user.id} attempted to create category in establishment ${establishmentId} but belongs to ${session.user.establishmentId}`)
      return jsonError('Forbidden: You can only manage your own establishment', 403)
    }

    const body = await request.json()
    const validatedData = categoryCreateSchema.parse(body)

    logger.info(`[ADMIN API] Creating category with data:`, {
      establishmentId,
      categoryName: validatedData.name,
      userId: session.user.id
    })

    // 🔒 Crear categoría
    const category = await categoryService.createCategory({
      ...validatedData,
      establishmentId,
    })

    logger.info(`[ADMIN API] Category created successfully:`, {
      categoryId: category.categoryId,
      establishmentId,
      userId: session.user.id
    })

    return jsonOk({ category }, 201)
  } catch (error) {
    // 🔍 Manejo especial para Response objects (de jsonError)
    if (error instanceof Response) {
      return error // Devolver directamente la respuesta de autenticación
    }

    let establishmentIdForErrorLog = 'unknown'
    try {
      const params = await paramsPromise
      establishmentIdForErrorLog = params.establishmentId
    } catch (paramsError) {
      logger.error('[ADMIN API] Error resolving params for category creation logging:', paramsError)
    }

    logger.error(`[ADMIN API] Error creating category for establishment ${establishmentIdForErrorLog}:`, error)

    if (error instanceof ZodError) {
      return jsonError(error.errors, 400)
    } else if (error instanceof Error) {
      return jsonError(error.message, 500)
    } else {
      return jsonError('An unexpected error occurred', 500)
    }
  }
}
