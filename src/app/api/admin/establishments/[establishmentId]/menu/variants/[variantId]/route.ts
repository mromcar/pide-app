import { NextRequest } from 'next/server'
import { requireAuth } from '@/middleware/auth-middleware'
import { UserRole } from '@/constants/enums'
import { productVariantService } from '@/services/productVariant.service'
import { productVariantUpdateSchema } from '@/schemas/productVariant'
import { jsonOk, jsonError } from '@/utils/api'
import { z, ZodError } from 'zod'
import logger from '@/lib/logger'

const paramsSchema = z.object({
  establishmentId: z.coerce.number().int().positive(),
  variantId: z.coerce.number().int().positive(),
})

export async function GET(
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ establishmentId: string; variantId: string }> }
) {
  try {
    // 🔒 Autenticación requerida para admin
    const session = await requireAuth([UserRole.general_admin, UserRole.establishment_admin])

    const params = await paramsPromise
    const paramsValidation = paramsSchema.safeParse(params)

    if (!paramsValidation.success) {
      logger.warn('[ADMIN API] Invalid params for variant fetch:', { params })
      return jsonError(paramsValidation.error.issues, 400)
    }

    const { establishmentId, variantId } = paramsValidation.data

    logger.info(`[ADMIN API] Fetching variant ${variantId} for establishment ${establishmentId} by user: ${session.user.id}`)

    // 🔒 Verificar permisos específicos del establecimiento
    if (session.user.role === UserRole.establishment_admin && session.user.establishmentId !== establishmentId) {
      logger.warn(`[ADMIN API] User ${session.user.id} attempted to access establishment ${establishmentId} but belongs to ${session.user.establishmentId}`)
      return jsonError('Forbidden: You can only manage your own establishment', 403)
    }

    // 🍽️ Obtener variant específica
    const variant = await productVariantService.getProductVariantById(variantId)

    if (!variant) {
      logger.warn(`[ADMIN API] Variant ${variantId} not found`, {
        variantId,
        establishmentId,
        userId: session.user.id
      })
      return jsonError('Variant not found', 404)
    }

    // Verificar que la variant pertenece al establecimiento
    if (variant.establishmentId !== establishmentId) {
      logger.warn(`[ADMIN API] Variant ${variantId} does not belong to establishment ${establishmentId}`, {
        variantId,
        variantEstablishmentId: variant.establishmentId,
        requestedEstablishmentId: establishmentId,
        userId: session.user.id
      })
      return jsonError('Variant not found in this establishment', 404)
    }

    logger.info(`[ADMIN API] Variant ${variantId} fetched successfully`, {
      variantDescription: variant.variantDescription,
      productId: variant.productId,
      establishmentId,
      userId: session.user.id
    })

    return jsonOk({ variant })
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
      paramsForErrorLog = `establishment:${params.establishmentId}, variant:${params.variantId}`
    } catch (paramsError) {
      logger.error('[ADMIN API] Error resolving params for variant fetch logging:', paramsError)
    }

    logger.error(`[ADMIN API] Error fetching variant for ${paramsForErrorLog}:`, error)

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
  { params: paramsPromise }: { params: Promise<{ establishmentId: string; variantId: string }> }
) {
  try {
    // 🔒 Autenticación requerida para admin
    const session = await requireAuth([UserRole.general_admin, UserRole.establishment_admin])

    const params = await paramsPromise
    const paramsValidation = paramsSchema.safeParse(params)

    if (!paramsValidation.success) {
      logger.warn('[ADMIN API] Invalid params for variant update:', { params })
      return jsonError(paramsValidation.error.issues, 400)
    }

    const { establishmentId, variantId } = paramsValidation.data

    logger.info(`[ADMIN API] Updating variant ${variantId} for establishment ${establishmentId} by user: ${session.user.id}`)

    // 🔒 Verificar permisos específicos del establecimiento
    if (session.user.role === UserRole.establishment_admin && session.user.establishmentId !== establishmentId) {
      logger.warn(`[ADMIN API] User ${session.user.id} attempted to update variant in establishment ${establishmentId} but belongs to ${session.user.establishmentId}`)
      return jsonError('Forbidden: You can only manage your own establishment', 403)
    }

    // Verificar que la variant existe y pertenece al establecimiento
    const existingVariant = await productVariantService.getProductVariantById(variantId)
    if (!existingVariant) {
      logger.warn(`[ADMIN API] Variant ${variantId} not found for update`, {
        variantId,
        establishmentId,
        userId: session.user.id
      })
      return jsonError('Variant not found', 404)
    }

    if (existingVariant.establishmentId !== establishmentId) {
      logger.warn(`[ADMIN API] Variant ${variantId} does not belong to establishment ${establishmentId} for update`, {
        variantId,
        variantEstablishmentId: existingVariant.establishmentId,
        requestedEstablishmentId: establishmentId,
        userId: session.user.id
      })
      return jsonError('Variant not found in this establishment', 404)
    }

    const body = await req.json()
    const validatedData = productVariantUpdateSchema.parse(body)

    logger.info(`[ADMIN API] Updating variant ${variantId} with data:`, {
      variantDescription: validatedData.variantDescription,
      price: validatedData.price,
      establishmentId,
      userId: session.user.id
    })

    // 🍽️ Actualizar variant con auditoría
    const updatedVariant = await productVariantService.updateProductVariant(
      variantId,
      validatedData,
      parseInt(session.user.id)
    )

    if (!updatedVariant) {
      logger.error(`[ADMIN API] Variant ${variantId} update returned null`, {
        variantId,
        establishmentId,
        userId: session.user.id
      })
      return jsonError('Failed to update variant', 500)
    }

    logger.info(`[ADMIN API] Variant ${variantId} updated successfully:`, {
      variantDescription: updatedVariant.variantDescription,
      price: updatedVariant.price,
      establishmentId,
      userId: session.user.id
    })

    return jsonOk({ variant: updatedVariant })
  } catch (error) {
    // 🔍 Manejo especial para Response objects (de jsonError)
    if (error instanceof Response) {
      return error
    }

    let paramsForErrorLog = 'unknown'
    try {
      const params = await paramsPromise
      paramsForErrorLog = `establishment:${params.establishmentId}, variant:${params.variantId}`
    } catch (paramsError) {
      logger.error('[ADMIN API] Error resolving params for variant update logging:', paramsError)
    }

    logger.error(`[ADMIN API] Error updating variant for ${paramsForErrorLog}:`, error)

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
  { params: paramsPromise }: { params: Promise<{ establishmentId: string; variantId: string }> }
) {
  try {
    // 🔒 Autenticación requerida para admin
    const session = await requireAuth([UserRole.general_admin, UserRole.establishment_admin])

    const params = await paramsPromise
    const paramsValidation = paramsSchema.safeParse(params)

    if (!paramsValidation.success) {
      logger.warn('[ADMIN API] Invalid params for variant deletion:', { params })
      return jsonError(paramsValidation.error.issues, 400)
    }

    const { establishmentId, variantId } = paramsValidation.data

    logger.info(`[ADMIN API] Deleting variant ${variantId} for establishment ${establishmentId} by user: ${session.user.id}`)

    // 🔒 Verificar permisos específicos del establecimiento
    if (session.user.role === UserRole.establishment_admin && session.user.establishmentId !== establishmentId) {
      logger.warn(`[ADMIN API] User ${session.user.id} attempted to delete variant in establishment ${establishmentId} but belongs to ${session.user.establishmentId}`)
      return jsonError('Forbidden: You can only manage your own establishment', 403)
    }

    // Verificar que la variant existe y pertenece al establecimiento
    const existingVariant = await productVariantService.getProductVariantById(variantId)
    if (!existingVariant) {
      logger.warn(`[ADMIN API] Variant ${variantId} not found for deletion`, {
        variantId,
        establishmentId,
        userId: session.user.id
      })
      return jsonError('Variant not found', 404)
    }

    if (existingVariant.establishmentId !== establishmentId) {
      logger.warn(`[ADMIN API] Variant ${variantId} does not belong to establishment ${establishmentId} for deletion`, {
        variantId,
        variantEstablishmentId: existingVariant.establishmentId,
        requestedEstablishmentId: establishmentId,
        userId: session.user.id
      })
      return jsonError('Variant not found in this establishment', 404)
    }

    // 🍽️ Eliminar variant (soft delete)
    const deletedVariant = await productVariantService.deleteProductVariant(
      variantId,
      parseInt(session.user.id)
    )

    if (!deletedVariant) {
      logger.error(`[ADMIN API] Variant ${variantId} deletion returned null`, {
        variantId,
        establishmentId,
        userId: session.user.id
      })
      return jsonError('Failed to delete variant', 500)
    }

    logger.info(`[ADMIN API] Variant ${variantId} deleted successfully:`, {
      variantDescription: existingVariant.variantDescription,
      productId: existingVariant.productId,
      establishmentId,
      userId: session.user.id
    })

    return jsonOk({ message: 'Variant deleted successfully' })
  } catch (error) {
    // 🔍 Manejo especial para Response objects (de jsonError)
    if (error instanceof Response) {
      return error
    }

    let paramsForErrorLog = 'unknown'
    try {
      const params = await paramsPromise
      paramsForErrorLog = `establishment:${params.establishmentId}, variant:${params.variantId}`
    } catch (paramsError) {
      logger.error('[ADMIN API] Error resolving params for variant deletion logging:', paramsError)
    }

    logger.error(`[ADMIN API] Error deleting variant for ${paramsForErrorLog}:`, error)

    if (error instanceof ZodError) {
      return jsonError(error.errors, 400)
    } else if (error instanceof Error) {
      return jsonError(error.message, 500)
    } else {
      return jsonError('An unexpected error occurred', 500)
    }
  }
}
