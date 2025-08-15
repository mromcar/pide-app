import { NextRequest } from 'next/server'
import { requireAuth } from '@/middleware/auth-middleware'
import { UserRole } from '@/constants/enums'
import * as categoryService from '@/services/category.service'
import { categoryUpdateSchema } from '@/schemas/category'
import { jsonOk, jsonError } from '@/utils/api'
import { z, ZodError } from 'zod'
import logger from '@/lib/logger'

const paramsSchema = z.object({
  establishmentId: z.coerce.number().int().positive(),
  categoryId: z.coerce.number().int().positive(),
})

export async function GET(
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ establishmentId: string; categoryId: string }> }
) {
  try {
    // 🔒 Autenticación requerida para admin
    const session = await requireAuth([UserRole.general_admin, UserRole.establishment_admin])

    const params = await paramsPromise
    const paramsValidation = paramsSchema.safeParse(params)

    if (!paramsValidation.success) {
      logger.warn('[ADMIN API] Invalid params for category fetch:', { params })
      return jsonError(paramsValidation.error.issues, 400)
    }

    const { establishmentId, categoryId } = paramsValidation.data

    logger.info(`[ADMIN API] Fetching category ${categoryId} for establishment ${establishmentId} by user: ${session.user.id}`)

    // 🔒 Verificar permisos específicos del establecimiento
    if (session.user.role === UserRole.establishment_admin && session.user.establishmentId !== establishmentId) {
      logger.warn(`[ADMIN API] User ${session.user.id} attempted to access establishment ${establishmentId} but belongs to ${session.user.establishmentId}`)
      return jsonError('Forbidden: You can only manage your own establishment', 403)
    }

    // 🏷️ Obtener categoría específica
    const category = await categoryService.getCategoryById(categoryId)

    if (!category) {
      logger.warn(`[ADMIN API] Category ${categoryId} not found`, {
        categoryId,
        establishmentId,
        userId: session.user.id
      })
      return jsonError('Category not found', 404)
    }

    // Verificar que la categoría pertenece al establecimiento
    if (category.establishmentId !== establishmentId) {
      logger.warn(`[ADMIN API] Category ${categoryId} does not belong to establishment ${establishmentId}`, {
        categoryId,
        categoryEstablishmentId: category.establishmentId,
        requestedEstablishmentId: establishmentId,
        userId: session.user.id
      })
      return jsonError('Category not found in this establishment', 404)
    }

    logger.info(`[ADMIN API] Category ${categoryId} fetched successfully`, {
      categoryName: category.name,
      establishmentId,
      userId: session.user.id
    })

    return jsonOk({ category })
  } catch (error) {
    // 🔍 Manejo especial para Response objects (de jsonError)
    if (error instanceof Response) {
      logger.info('[ADMIN API] Authentication/Authorization failed:', {
        status: error.status,
        statusText: error.statusText
      })
      return error
    }

    let paramsForErrorLog = 'unknown'
    try {
      const params = await paramsPromise
      paramsForErrorLog = `establishment:${params.establishmentId}, category:${params.categoryId}`
    } catch (paramsError) {
      logger.error('[ADMIN API] Error resolving params for category fetch logging:', paramsError)
    }

    logger.error(`[ADMIN API] Error fetching category for ${paramsForErrorLog}:`, error)

    if (error instanceof ZodError) {
      return jsonError(error.errors, 400)
    } else if (error instanceof Error) {
      return jsonError(error.message, 500)
    } else {
      return jsonError('An unexpected error occurred', 500)
    }
  }
}

export async function PUT(
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ establishmentId: string; categoryId: string }> }
) {
  try {
    // 🔒 Autenticación requerida para admin
    const session = await requireAuth([UserRole.general_admin, UserRole.establishment_admin])

    const params = await paramsPromise
    const paramsValidation = paramsSchema.safeParse(params)

    if (!paramsValidation.success) {
      logger.warn('[ADMIN API] Invalid params for category update:', { params })
      return jsonError(paramsValidation.error.issues, 400)
    }

    const { establishmentId, categoryId } = paramsValidation.data

    logger.info(`[ADMIN API] Updating category ${categoryId} for establishment ${establishmentId} by user: ${session.user.id}`)

    // 🔒 Verificar permisos específicos del establecimiento
    if (session.user.role === UserRole.establishment_admin && session.user.establishmentId !== establishmentId) {
      logger.warn(`[ADMIN API] User ${session.user.id} attempted to update category in establishment ${establishmentId} but belongs to ${session.user.establishmentId}`)
      return jsonError('Forbidden: You can only manage your own establishment', 403)
    }

    // Verificar que la categoría existe y pertenece al establecimiento
    const existingCategory = await categoryService.getCategoryById(categoryId)
    if (!existingCategory) {
      logger.warn(`[ADMIN API] Category ${categoryId} not found for update`, {
        categoryId,
        establishmentId,
        userId: session.user.id
      })
      return jsonError('Category not found', 404)
    }

    if (existingCategory.establishmentId !== establishmentId) {
      logger.warn(`[ADMIN API] Category ${categoryId} does not belong to establishment ${establishmentId} for update`, {
        categoryId,
        categoryEstablishmentId: existingCategory.establishmentId,
        requestedEstablishmentId: establishmentId,
        userId: session.user.id
      })
      return jsonError('Category not found in this establishment', 404)
    }

    const body = await req.json()
    const validatedData = categoryUpdateSchema.parse(body)

    logger.info(`[ADMIN API] Updating category ${categoryId} with data:`, {
      categoryName: validatedData.name,
      establishmentId,
      userId: session.user.id
    })

    // 🏷️ Actualizar categoría
    const updatedCategory = await categoryService.updateCategory(categoryId, establishmentId, validatedData)

    // ✅ CORRECCIÓN 1: Verificar que updatedCategory no es null
    if (!updatedCategory) {
      logger.error(`[ADMIN API] Category ${categoryId} update returned null`, {
        categoryId,
        establishmentId,
        userId: session.user.id
      })
      return jsonError('Failed to update category', 500)
    }

    logger.info(`[ADMIN API] Category ${categoryId} updated successfully:`, {
      categoryName: updatedCategory.name, // ✅ Ahora TypeScript sabe que no es null
      establishmentId,
      userId: session.user.id
    })

    return jsonOk({ category: updatedCategory })
  } catch (error) {
    // 🔍 Manejo especial para Response objects (de jsonError)
    if (error instanceof Response) {
      return error
    }

    let paramsForErrorLog = 'unknown'
    try {
      const params = await paramsPromise
      paramsForErrorLog = `establishment:${params.establishmentId}, category:${params.categoryId}`
    } catch (paramsError) {
      logger.error('[ADMIN API] Error resolving params for category update logging:', paramsError)
    }

    logger.error(`[ADMIN API] Error updating category for ${paramsForErrorLog}:`, error)

    if (error instanceof ZodError) {
      return jsonError(error.errors, 400)
    } else if (error instanceof Error) {
      return jsonError(error.message, 500)
    } else {
      return jsonError('An unexpected error occurred', 500)
    }
  }
}

export async function DELETE(
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ establishmentId: string; categoryId: string }> }
) {
  try {
    // 🔒 Autenticación requerida para admin
    const session = await requireAuth([UserRole.general_admin, UserRole.establishment_admin])

    const params = await paramsPromise
    const paramsValidation = paramsSchema.safeParse(params)

    if (!paramsValidation.success) {
      logger.warn('[ADMIN API] Invalid params for category deletion:', { params })
      return jsonError(paramsValidation.error.issues, 400)
    }

    const { establishmentId, categoryId } = paramsValidation.data

    logger.info(`[ADMIN API] Deleting category ${categoryId} for establishment ${establishmentId} by user: ${session.user.id}`)

    // 🔒 Verificar permisos específicos del establecimiento
    if (session.user.role === UserRole.establishment_admin && session.user.establishmentId !== establishmentId) {
      logger.warn(`[ADMIN API] User ${session.user.id} attempted to delete category in establishment ${establishmentId} but belongs to ${session.user.establishmentId}`)
      return jsonError('Forbidden: You can only manage your own establishment', 403)
    }

    // Verificar que la categoría existe y pertenece al establecimiento
    const existingCategory = await categoryService.getCategoryById(categoryId)
    if (!existingCategory) {
      logger.warn(`[ADMIN API] Category ${categoryId} not found for deletion`, {
        categoryId,
        establishmentId,
        userId: session.user.id
      })
      return jsonError('Category not found', 404)
    }

    if (existingCategory.establishmentId !== establishmentId) {
      logger.warn(`[ADMIN API] Category ${categoryId} does not belong to establishment ${establishmentId} for deletion`, {
        categoryId,
        categoryEstablishmentId: existingCategory.establishmentId,
        requestedEstablishmentId: establishmentId,
        userId: session.user.id
      })
      return jsonError('Category not found in this establishment', 404)
    }

    // 🏷️ Eliminar categoría (soft delete probablemente)
    await categoryService.deleteCategory(categoryId, establishmentId)

    logger.info(`[ADMIN API] Category ${categoryId} deleted successfully:`, {
      categoryName: existingCategory.name,
      establishmentId,
      userId: session.user.id
    })

    return jsonOk({ message: 'Category deleted successfully' })
  } catch (error) {
    // 🔍 Manejo especial para Response objects (de jsonError)
    if (error instanceof Response) {
      return error
    }

    let paramsForErrorLog = 'unknown'
    try {
      const params = await paramsPromise
      paramsForErrorLog = `establishment:${params.establishmentId}, category:${params.categoryId}`
    } catch (paramsError) {
      logger.error('[ADMIN API] Error resolving params for category deletion logging:', paramsError)
    }

    logger.error(`[ADMIN API] Error deleting category for ${paramsForErrorLog}:`, error)

    if (error instanceof ZodError) {
      return jsonError(error.errors, 400)
    } else if (error instanceof Error) {
      return jsonError(error.message, 500)
    } else {
      return jsonError('An unexpected error occurred', 500)
    }
  }
}
