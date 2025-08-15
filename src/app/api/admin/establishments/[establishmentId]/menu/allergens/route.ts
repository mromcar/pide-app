import { NextRequest } from 'next/server'
import { requireAuth } from '@/middleware/auth-middleware'
import { UserRole } from '@prisma/client'
import { AllergenService } from '@/services/allergen.service'
import { createAllergenSchema } from '@/schemas/allergen'
import { jsonOk, jsonError } from '@/utils/api'
import { z, ZodError } from 'zod'
import logger from '@/lib/logger'

const allergenService = new AllergenService()

const paramsSchema = z.object({
  establishmentId: z.coerce.number().int().positive(),
})

const queryParamsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
})

export async function GET(
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ establishmentId: string }> }
) {
  try {
    // 🔒 Autenticación requerida para admin (solo general_admin puede gestionar alérgenos globales)
    const session = await requireAuth([UserRole.general_admin])

    const params = await paramsPromise
    const paramsValidation = paramsSchema.safeParse(params)

    if (!paramsValidation.success) {
      logger.warn('[ADMIN API] Invalid establishment ID for allergens:', { params })
      return jsonError(paramsValidation.error.issues, 400)
    }

    const { establishmentId } = paramsValidation.data

    const { searchParams } = new URL(req.url)
    const queryValidation = queryParamsSchema.safeParse({
      page: searchParams.get('page'),
      pageSize: searchParams.get('pageSize'),
    })

    if (!queryValidation.success) {
      logger.warn('[ADMIN API] Invalid query parameters for allergens:', {
        establishmentId,
        searchParams: Object.fromEntries(searchParams)
      })
      return jsonError(queryValidation.error.issues, 400)
    }

    const { page, pageSize } = queryValidation.data

    logger.info(`[ADMIN API] Fetching allergens for admin management by user: ${session.user.id}`, {
      establishmentId,
      page,
      pageSize
    })

    // 🌐 Los alérgenos son globales
    const allergens = await allergenService.getAllAllergens()

    // Simulamos paginación simple en memoria
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    const paginatedAllergens = allergens.slice(startIndex, endIndex)

    logger.info(`[ADMIN API] Found ${allergens.length} total allergens, returning ${paginatedAllergens.length} for page ${page}`)

    return jsonOk(paginatedAllergens)
  } catch (error) {
    // 🔍 Manejo especial para Response objects (de jsonError)
    if (error instanceof Response) {
      logger.info('[ADMIN API] Authentication/Authorization failed:', {
        status: error.status,
        statusText: error.statusText
      })
      return error // Devolver directamente la respuesta de autenticación
    }

    let establishmentIdForErrorLog = 'unknown'
    try {
      const params = await paramsPromise
      establishmentIdForErrorLog = params.establishmentId
    } catch (paramsError) {
      logger.error('[ADMIN API] Error resolving params for allergens logging:', paramsError)
    }

    logger.error(`[ADMIN API] Error fetching allergens for establishment ${establishmentIdForErrorLog}:`, error)

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
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ establishmentId: string }> }
) {
  try {
    // 🔒 Solo general_admin puede crear alérgenos globales
    const session = await requireAuth([UserRole.general_admin])

    const params = await paramsPromise
    const paramsValidation = paramsSchema.safeParse(params)

    if (!paramsValidation.success) {
      logger.warn('[ADMIN API] Invalid establishment ID for allergen creation:', { params })
      return jsonError(paramsValidation.error.issues, 400)
    }

    const { establishmentId } = paramsValidation.data

    logger.info(`[ADMIN API] Creating allergen by user: ${session.user.id}`, {
      establishmentId
    })

    const body = await req.json()
    const validatedData = createAllergenSchema.parse(body)

    logger.info(`[ADMIN API] Creating allergen with data:`, {
      allergenCode: validatedData.code,
      allergenName: validatedData.name,
      userId: session.user.id
    })

    // 🌐 Crear alérgeno global
    const allergen = await allergenService.createAllergen(validatedData)

    logger.info(`[ADMIN API] Allergen created successfully:`, {
      allergenId: allergen.allergenId,
      code: allergen.code,
      userId: session.user.id
    })

    return jsonOk({ allergen }, 201)
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
      logger.error('[ADMIN API] Error resolving params for allergen creation logging:', paramsError)
    }

    logger.error(`[ADMIN API] Error creating allergen for establishment ${establishmentIdForErrorLog}:`, error)

    if (error instanceof ZodError) {
      return jsonError(error.errors, 400)
    } else if (error instanceof Error) {
      return jsonError(error.message, 500)
    } else {
      return jsonError('An unexpected error occurred', 500)
    }
  }
}
