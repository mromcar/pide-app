import { NextRequest } from 'next/server'
import { requireAuth } from '@/middleware/auth-middleware'
import { UserRole } from '@prisma/client'
import { AllergenService } from '@/services/allergen.service'
import { updateAllergenSchema } from '@/schemas/allergen'
import { jsonOk, jsonError } from '@/utils/api'
import { z, ZodError } from 'zod'
import logger from '@/lib/logger'

const allergenService = new AllergenService()

const paramsSchema = z.object({
  establishmentId: z.coerce.number().int().positive(),
  allergenId: z.coerce.number().int().positive(),
})

export async function GET(
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ establishmentId: string; allergenId: string }> }
) {
  try {
    // 🔒 Autenticación requerida (solo general_admin puede gestionar alérgenos globales)
    const session = await requireAuth([UserRole.general_admin])

    const params = await paramsPromise
    const paramsValidation = paramsSchema.safeParse(params)

    if (!paramsValidation.success) {
      logger.warn('[ADMIN API] Invalid params for allergen fetch:', { params })
      return jsonError(paramsValidation.error.issues, 400)
    }

    const { establishmentId, allergenId } = paramsValidation.data

    logger.info(`[ADMIN API] Fetching allergen ${allergenId} by user: ${session.user.id}`, {
      establishmentId,
      allergenId
    })

    // 🌐 Obtener alérgeno global por ID
    const allergen = await allergenService.getAllergenById(allergenId)

    if (!allergen) {
      logger.warn(`[ADMIN API] Allergen ${allergenId} not found`, {
        allergenId,
        userId: session.user.id
      })
      return jsonError('Allergen not found', 404)
    }

    logger.info(`[ADMIN API] Allergen ${allergenId} fetched successfully`, {
      allergenCode: allergen.code,
      userId: session.user.id
    })

    return jsonOk({ allergen })
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
      paramsForErrorLog = `establishment:${params.establishmentId}, allergen:${params.allergenId}`
    } catch (paramsError) {
      logger.error('[ADMIN API] Error resolving params for allergen fetch logging:', paramsError)
    }

    logger.error(`[ADMIN API] Error fetching allergen for ${paramsForErrorLog}:`, error)

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
  { params: paramsPromise }: { params: Promise<{ establishmentId: string; allergenId: string }> }
) {
  try {
    // 🔒 Solo general_admin puede actualizar alérgenos globales
    const session = await requireAuth([UserRole.general_admin])

    const params = await paramsPromise
    const paramsValidation = paramsSchema.safeParse(params)

    if (!paramsValidation.success) {
      logger.warn('[ADMIN API] Invalid params for allergen update:', { params })
      return jsonError(paramsValidation.error.issues, 400)
    }

    const { establishmentId, allergenId } = paramsValidation.data

    logger.info(`[ADMIN API] Updating allergen ${allergenId} by user: ${session.user.id}`, {
      establishmentId,
      allergenId
    })

    // Verificar que el alérgeno existe
    const existingAllergen = await allergenService.getAllergenById(allergenId)
    if (!existingAllergen) {
      logger.warn(`[ADMIN API] Allergen ${allergenId} not found for update`, {
        allergenId,
        userId: session.user.id
      })
      return jsonError('Allergen not found', 404)
    }

    const body = await req.json()
    const validatedData = updateAllergenSchema.parse(body)

    logger.info(`[ADMIN API] Updating allergen ${allergenId} with data:`, {
      allergenCode: validatedData.code,
      allergenName: validatedData.name,
      userId: session.user.id
    })

    // 🌐 Actualizar alérgeno global
    const updatedAllergen = await allergenService.updateAllergen(allergenId, validatedData)

    logger.info(`[ADMIN API] Allergen ${allergenId} updated successfully:`, {
      allergenCode: updatedAllergen.code,
      userId: session.user.id
    })

    return jsonOk({ allergen: updatedAllergen })
  } catch (error) {
    // 🔍 Manejo especial para Response objects (de jsonError)
    if (error instanceof Response) {
      return error
    }

    let paramsForErrorLog = 'unknown'
    try {
      const params = await paramsPromise
      paramsForErrorLog = `establishment:${params.establishmentId}, allergen:${params.allergenId}`
    } catch (paramsError) {
      logger.error('[ADMIN API] Error resolving params for allergen update logging:', paramsError)
    }

    logger.error(`[ADMIN API] Error updating allergen for ${paramsForErrorLog}:`, error)

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
  { params: paramsPromise }: { params: Promise<{ establishmentId: string; allergenId: string }> }
) {
  try {
    // 🔒 Solo general_admin puede eliminar alérgenos globales
    const session = await requireAuth([UserRole.general_admin])

    const params = await paramsPromise
    const paramsValidation = paramsSchema.safeParse(params)

    if (!paramsValidation.success) {
      logger.warn('[ADMIN API] Invalid params for allergen deletion:', { params })
      return jsonError(paramsValidation.error.issues, 400)
    }

    const { establishmentId, allergenId } = paramsValidation.data

    logger.info(`[ADMIN API] Deleting allergen ${allergenId} by user: ${session.user.id}`, {
      establishmentId,
      allergenId
    })

    // Verificar que el alérgeno existe
    const existingAllergen = await allergenService.getAllergenById(allergenId)
    if (!existingAllergen) {
      logger.warn(`[ADMIN API] Allergen ${allergenId} not found for deletion`, {
        allergenId,
        userId: session.user.id
      })
      return jsonError('Allergen not found', 404)
    }

    // 🌐 Eliminar alérgeno global
    await allergenService.deleteAllergen(allergenId)

    logger.info(`[ADMIN API] Allergen ${allergenId} deleted successfully:`, {
      allegenCode: existingAllergen.code,
      userId: session.user.id
    })

    return jsonOk({ message: 'Allergen deleted successfully' })
  } catch (error) {
    // 🔍 Manejo especial para Response objects (de jsonError)
    if (error instanceof Response) {
      return error
    }

    let paramsForErrorLog = 'unknown'
    try {
      const params = await paramsPromise
      paramsForErrorLog = `establishment:${params.establishmentId}, allergen:${params.allergenId}`
    } catch (paramsError) {
      logger.error('[ADMIN API] Error resolving params for allergen deletion logging:', paramsError)
    }

    logger.error(`[ADMIN API] Error deleting allergen for ${paramsForErrorLog}:`, error)

    if (error instanceof ZodError) {
      return jsonError(error.errors, 400)
    } else if (error instanceof Error) {
      return jsonError(error.message, 500)
    } else {
      return jsonError('An unexpected error occurred', 500)
    }
  }
}
