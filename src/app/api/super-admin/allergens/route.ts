import { NextRequest } from 'next/server'
import { requireAuth } from '@/middleware/auth-middleware'
import { UserRole } from '@/constants/enums'
import { AllergenService } from '@/services/allergen.service'
import { createAllergenSchema } from '@/schemas/allergen'
import { jsonOk, jsonError } from '@/utils/api'
import { ZodError } from 'zod'
import logger from '@/lib/logger'

const allergenService = new AllergenService()

/**
 * @swagger
 * /api/super-admin/allergens:
 *   get:
 *     summary: Get all global allergens (Super Admin)
 *     description: Super admin endpoint to manage global allergens
 *     tags:
 *       - Super Admin
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Allergens retrieved successfully
 *       401:
 *         description: Unauthorized - Only general_admin can access
 *       500:
 *         description: Internal server error
 */
// ✅ CORRECCIÓN: Eliminar parámetro 'req' no utilizado
export async function GET() {
  try {
    // 🔒 Solo general_admin puede gestionar alérgenos globales
    const session = await requireAuth([UserRole.general_admin])

    logger.info(`[SUPER-ADMIN API] Fetching all allergens by user: ${session.user.id}`)

    // 🌐 Obtener todos los alérgenos globales
    const allergens = await allergenService.getAllAllergens()

    logger.info(`[SUPER-ADMIN API] Allergens fetched successfully:`, {
      totalAllergens: allergens.length,
      userId: session.user.id
    })

    return jsonOk({
      allergens,
      total: allergens.length,
      message: 'Global allergens retrieved successfully'
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

    logger.error(`[SUPER-ADMIN API] Error fetching all allergens:`, error)

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
 * /api/super-admin/allergens:
 *   post:
 *     summary: Create new global allergen (Super Admin)
 *     description: Super admin endpoint to create global allergens
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
 *               - code
 *               - name
 *             properties:
 *               code:
 *                 type: string
 *                 example: "NUTS"
 *               name:
 *                 type: string
 *                 example: "Nuts"
 *               description:
 *                 type: string
 *                 example: "Contains nuts"
 *               iconUrl:
 *                 type: string
 *                 example: "https://example.com/nuts-icon.png"
 *               isMajorAllergen:
 *                 type: boolean
 *                 example: true
 *               translations:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     languageCode:
 *                       type: string
 *                       example: "es"
 *                     name:
 *                       type: string
 *                       example: "Frutos secos"
 *                     description:
 *                       type: string
 *                       example: "Contiene frutos secos"
 *     responses:
 *       201:
 *         description: Allergen created successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized - Only general_admin can access
 *       409:
 *         description: Allergen with this code already exists
 *       500:
 *         description: Internal server error
 */
export async function POST(req: NextRequest) {
  try {
    // 🔒 Solo general_admin puede crear alérgenos globales
    const session = await requireAuth([UserRole.general_admin])

    const body = await req.json()
    const validatedData = createAllergenSchema.parse(body)

    logger.info(`[SUPER-ADMIN API] Creating new allergen by user: ${session.user.id}`, {
      allergenCode: validatedData.code,
      allergenName: validatedData.name,
      userId: session.user.id
    })

    // 🌐 Crear alérgeno global
    const newAllergen = await allergenService.createAllergen(validatedData)

    logger.info(`[SUPER-ADMIN API] Allergen created successfully:`, {
      allergenId: newAllergen.allergenId,
      allergenCode: newAllergen.code,
      userId: session.user.id
    })

    return jsonOk({
      allergen: newAllergen,
      message: 'Global allergen created successfully'
    }, 201)
  } catch (error) {
    // 🔍 Manejo especial para Response objects (de jsonError)
    if (error instanceof Response) {
      return error
    }

    logger.error(`[SUPER-ADMIN API] Error creating allergen:`, error)

    if (error instanceof ZodError) {
      return jsonError(error.errors, 400)
    } else if (error instanceof Error) {
      // Manejar errores específicos de BD (códigos duplicados, etc.)
      if (error.message.includes('Unique constraint')) {
        return jsonError('Allergen with this code already exists', 409)
      }
      return jsonError(error.message, 500)
    } else {
      return jsonError('An unexpected error occurred', 500)
    }
  }
}
