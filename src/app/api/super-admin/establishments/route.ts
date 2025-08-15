import { NextRequest } from 'next/server'
import { requireAuth } from '@/middleware/auth-middleware'
import { UserRole } from '@/constants/enums'
import {
  getAllEstablishments,
  createEstablishment,
} from '@/services/establishment.service'
import { establishmentCreateSchema } from '@/schemas/establishment'
import { jsonOk, jsonError } from '@/utils/api'
import { z, ZodError } from 'zod'
import logger from '@/lib/logger'

// Schema para query parameters de paginación
const querySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10),
})

/**
 * @swagger
 * /api/super-admin/establishments:
 *   get:
 *     summary: Get all establishments (Super Admin)
 *     description: Super admin endpoint to list all establishments with pagination
 *     tags:
 *       - Super Admin
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of establishments per page
 *     responses:
 *       200:
 *         description: Establishments retrieved successfully
 *       401:
 *         description: Unauthorized - Only general_admin can access
 *       400:
 *         description: Invalid query parameters
 *       500:
 *         description: Internal server error
 */
export async function GET(req: NextRequest) {
  try {
    // 🔒 Solo general_admin puede gestionar establecimientos
    const session = await requireAuth([UserRole.general_admin])

    // Extraer y validar query parameters
    const { searchParams } = new URL(req.url)
    const queryValidation = querySchema.safeParse({
      page: searchParams.get('page'),
      pageSize: searchParams.get('pageSize'),
    })

    if (!queryValidation.success) {
      logger.warn('[SUPER-ADMIN API] Invalid query parameters for establishments fetch:', {
        errors: queryValidation.error.issues,
        userId: session.user.id
      })
      return jsonError(queryValidation.error.issues, 400)
    }

    const { page, pageSize } = queryValidation.data

    logger.info(`[SUPER-ADMIN API] Fetching establishments by user: ${session.user.id}`, {
      page,
      pageSize,
      userId: session.user.id
    })

    // 🏢 Obtener establecimientos con paginación
    const establishments = await getAllEstablishments(page, pageSize)

    logger.info(`[SUPER-ADMIN API] Establishments fetched successfully:`, {
      totalEstablishments: establishments.length,
      page,
      pageSize,
      userId: session.user.id
    })

    return jsonOk({
      establishments,
      pagination: {
        page,
        pageSize,
        total: establishments.length,
        totalPages: Math.ceil(establishments.length / pageSize)
      },
      message: 'Establishments retrieved successfully'
    })
  } catch (error) {
    // 🔍 Manejo especial para Response objects (de jsonError)
    if (error instanceof Response) {
      logger.info('[SUPER-ADMIN API] Authentication/Authorization failed:', {
        status: error.status,
        statusText: error.statusText
      })
      return error
    }

    logger.error(`[SUPER-ADMIN API] Error fetching establishments:`, error)

    if (error instanceof ZodError) {
      return jsonError(error.errors, 400)
    } else if (error instanceof Error) {
      return jsonError(error.message, 500)
    } else {
      return jsonError('An unexpected error occurred', 500)
    }
  }
}

/**
 * @swagger
 * /api/super-admin/establishments:
 *   post:
 *     summary: Create new establishment (Super Admin)
 *     description: Super admin endpoint to create new establishments
 *     tags:
 *       - Super Admin
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - taxId
 *               - address
 *               - city
 *               - contactPerson
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Restaurant La Bella Vista"
 *               taxId:
 *                 type: string
 *                 example: "B12345678"
 *               address:
 *                 type: string
 *                 example: "Calle Principal 123"
 *               postalCode:
 *                 type: string
 *                 example: "28001"
 *               city:
 *                 type: string
 *                 example: "Madrid"
 *               phone1:
 *                 type: string
 *                 example: "+34 911 222 333"
 *               phone2:
 *                 type: string
 *                 example: "+34 911 222 334"
 *               contactPerson:
 *                 type: string
 *                 example: "Juan Pérez"
 *               description:
 *                 type: string
 *                 example: "Restaurante especializado en cocina mediterránea"
 *               website:
 *                 type: string
 *                 example: "https://www.labellavista.com"
 *               billingBankDetails:
 *                 type: string
 *                 example: "ES91 2100 0418 4502 0005 1332"
 *               paymentBankDetails:
 *                 type: string
 *                 example: "ES91 2100 0418 4502 0005 1333"
 *               isActive:
 *                 type: boolean
 *                 default: true
 *               acceptsOrders:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Establishment created successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized - Only general_admin can access
 *       409:
 *         description: Establishment with this taxId already exists
 *       500:
 *         description: Internal server error
 */
export async function POST(req: NextRequest) {
  try {
    // 🔒 Solo general_admin puede crear establecimientos
    const session = await requireAuth([UserRole.general_admin])

    const body = await req.json()
    const validatedData = establishmentCreateSchema.parse(body)

    logger.info(`[SUPER-ADMIN API] Creating new establishment by user: ${session.user.id}`, {
      establishmentName: validatedData.name,
      taxId: validatedData.taxId,
      city: validatedData.city,
      userId: session.user.id
    })

    // 🏢 Crear establecimiento
    const newEstablishment = await createEstablishment(validatedData)

    logger.info(`[SUPER-ADMIN API] Establishment created successfully:`, {
      establishmentId: newEstablishment.establishmentId,
      establishmentName: newEstablishment.name,
      userId: session.user.id
    })

    return jsonOk({
      establishment: newEstablishment,
      message: 'Establishment created successfully'
    }, 201)
  } catch (error) {
    // 🔍 Manejo especial para Response objects (de jsonError)
    if (error instanceof Response) {
      return error
    }

    logger.error(`[SUPER-ADMIN API] Error creating establishment:`, error)

    if (error instanceof ZodError) {
      return jsonError(error.errors, 400)
    } else if (error instanceof Error) {
      // Manejar errores específicos de BD (taxId duplicado, etc.)
      if (error.message.includes('Unique constraint') || error.message.includes('taxId')) {
        return jsonError('Establishment with this Tax ID already exists', 409)
      }
      return jsonError(error.message, 500)
    } else {
      return jsonError('An unexpected error occurred', 500)
    }
  }
}
