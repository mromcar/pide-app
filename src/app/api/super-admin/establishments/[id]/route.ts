import { NextRequest } from 'next/server'
import { requireAuth } from '@/middleware/auth-middleware'
import { UserRole } from '@/constants/enums'
import {
  getEstablishmentById,
  updateEstablishment,
  deleteEstablishment,
} from '@/services/establishment.service'
import { establishmentUpdateSchema } from '@/schemas/establishment'
import { jsonOk, jsonError } from '@/utils/api'
import { z, ZodError } from 'zod'
import logger from '@/lib/logger'

const paramsSchema = z.object({
  id: z.coerce.number().int().positive(),
})

/**
 * @swagger
 * /api/super-admin/establishments/{id}:
 *   get:
 *     summary: Get establishment by ID (Super Admin)
 *     description: Super admin endpoint to get specific establishment with full details
 *     tags:
 *       - Super Admin
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Establishment ID
 *     responses:
 *       200:
 *         description: Establishment retrieved successfully
 *       401:
 *         description: Unauthorized - Only general_admin can access
 *       404:
 *         description: Establishment not found
 *       400:
 *         description: Invalid establishment ID
 *       500:
 *         description: Internal server error
 */
export async function GET(
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ id: string }> }
) {
  try {
    // 🔒 Solo general_admin puede gestionar establecimientos
    const session = await requireAuth([UserRole.general_admin])

    const params = await paramsPromise
    const paramsValidation = paramsSchema.safeParse(params)

    if (!paramsValidation.success) {
      logger.warn('[SUPER-ADMIN API] Invalid params for establishment fetch:', { params })
      return jsonError(paramsValidation.error.issues, 400)
    }

    const { id: establishmentId } = paramsValidation.data

    logger.info(`[SUPER-ADMIN API] Fetching establishment ${establishmentId} by user: ${session.user.id}`)

    // 🏢 Obtener establecimiento con todas las relaciones
    const establishment = await getEstablishmentById(establishmentId)

    if (!establishment) {
      logger.warn(`[SUPER-ADMIN API] Establishment ${establishmentId} not found`, {
        establishmentId,
        userId: session.user.id
      })
      return jsonError('Establishment not found', 404)
    }

    logger.info(`[SUPER-ADMIN API] Establishment ${establishmentId} fetched successfully`, {
      establishmentName: establishment.name,
      totalCategories: establishment.categories?.length || 0,
      totalAdministrators: establishment.administrators?.length || 0,
      userId: session.user.id
    })

    return jsonOk({
      establishment,
      message: 'Establishment retrieved successfully'
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

    let paramsForErrorLog = 'unknown'
    try {
      const params = await paramsPromise
      paramsForErrorLog = `establishment:${params.id}`
    } catch (paramsError) {
      logger.error('[SUPER-ADMIN API] Error resolving params for establishment fetch logging:', paramsError)
    }

    logger.error(`[SUPER-ADMIN API] Error fetching establishment for ${paramsForErrorLog}:`, error)

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
 * /api/super-admin/establishments/{id}:
 *   put:
 *     summary: Update establishment (Super Admin)
 *     description: Super admin endpoint to update establishment details
 *     tags:
 *       - Super Admin
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Establishment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Restaurant La Bella Vista Updated"
 *               taxId:
 *                 type: string
 *                 example: "B12345678"
 *               address:
 *                 type: string
 *                 example: "Calle Principal 456"
 *               postalCode:
 *                 type: string
 *                 example: "28002"
 *               city:
 *                 type: string
 *                 example: "Madrid"
 *               phone1:
 *                 type: string
 *                 example: "+34 911 222 999"
 *               phone2:
 *                 type: string
 *                 example: "+34 911 222 888"
 *               contactPerson:
 *                 type: string
 *                 example: "María García"
 *               description:
 *                 type: string
 *                 example: "Restaurante actualizado especializado en cocina mediterránea"
 *               website:
 *                 type: string
 *                 example: "https://www.labellavista-updated.com"
 *               billingBankDetails:
 *                 type: string
 *                 example: "ES91 2100 0418 4502 0005 9999"
 *               paymentBankDetails:
 *                 type: string
 *                 example: "ES91 2100 0418 4502 0005 8888"
 *               isActive:
 *                 type: boolean
 *                 example: true
 *               acceptsOrders:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: Establishment updated successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized - Only general_admin can access
 *       404:
 *         description: Establishment not found
 *       409:
 *         description: Establishment with this taxId already exists
 *       500:
 *         description: Internal server error
 */
export async function PUT(
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ id: string }> }
) {
  try {
    // 🔒 Solo general_admin puede actualizar establecimientos
    const session = await requireAuth([UserRole.general_admin])

    const params = await paramsPromise
    const paramsValidation = paramsSchema.safeParse(params)

    if (!paramsValidation.success) {
      logger.warn('[SUPER-ADMIN API] Invalid params for establishment update:', { params })
      return jsonError(paramsValidation.error.issues, 400)
    }

    const { id: establishmentId } = paramsValidation.data

    logger.info(`[SUPER-ADMIN API] Updating establishment ${establishmentId} by user: ${session.user.id}`)

    // Verificar que el establecimiento existe
    const existingEstablishment = await getEstablishmentById(establishmentId)
    if (!existingEstablishment) {
      logger.warn(`[SUPER-ADMIN API] Establishment ${establishmentId} not found for update`, {
        establishmentId,
        userId: session.user.id
      })
      return jsonError('Establishment not found', 404)
    }

    const body = await req.json()
    const validatedData = establishmentUpdateSchema.parse(body)

    logger.info(`[SUPER-ADMIN API] Updating establishment ${establishmentId} with data:`, {
      establishmentName: validatedData.name || existingEstablishment.name,
      isActive: validatedData.isActive,
      acceptsOrders: validatedData.acceptsOrders,
      userId: session.user.id
    })

    // 🏢 Actualizar establecimiento
    const updatedEstablishment = await updateEstablishment(establishmentId, validatedData)

    if (!updatedEstablishment) {
      logger.error(`[SUPER-ADMIN API] Establishment ${establishmentId} update returned null`, {
        establishmentId,
        userId: session.user.id
      })
      return jsonError('Failed to update establishment', 500)
    }

    logger.info(`[SUPER-ADMIN API] Establishment ${establishmentId} updated successfully:`, {
      establishmentName: updatedEstablishment.name,
      userId: session.user.id
    })

    return jsonOk({
      establishment: updatedEstablishment,
      message: 'Establishment updated successfully'
    })
  } catch (error) {
    // 🔍 Manejo especial para Response objects (de jsonError)
    if (error instanceof Response) {
      return error
    }

    let paramsForErrorLog = 'unknown'
    try {
      const params = await paramsPromise
      paramsForErrorLog = `establishment:${params.id}`
    } catch (paramsError) {
      logger.error('[SUPER-ADMIN API] Error resolving params for establishment update logging:', paramsError)
    }

    logger.error(`[SUPER-ADMIN API] Error updating establishment for ${paramsForErrorLog}:`, error)

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

/**
 * @swagger
 * /api/super-admin/establishments/{id}:
 *   delete:
 *     summary: Delete establishment (Super Admin)
 *     description: Super admin endpoint to permanently delete an establishment
 *     tags:
 *       - Super Admin
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Establishment ID
 *     responses:
 *       200:
 *         description: Establishment deleted successfully
 *       401:
 *         description: Unauthorized - Only general_admin can access
 *       404:
 *         description: Establishment not found
 *       400:
 *         description: Invalid establishment ID
 *       409:
 *         description: Cannot delete establishment with active dependencies
 *       500:
 *         description: Internal server error
 */
export async function DELETE(
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ id: string }> }
) {
  try {
    // 🔒 Solo general_admin puede eliminar establecimientos
    const session = await requireAuth([UserRole.general_admin])

    const params = await paramsPromise
    const paramsValidation = paramsSchema.safeParse(params)

    if (!paramsValidation.success) {
      logger.warn('[SUPER-ADMIN API] Invalid params for establishment deletion:', { params })
      return jsonError(paramsValidation.error.issues, 400)
    }

    const { id: establishmentId } = paramsValidation.data

    logger.info(`[SUPER-ADMIN API] Deleting establishment ${establishmentId} by user: ${session.user.id}`)

    // Verificar que el establecimiento existe
    const existingEstablishment = await getEstablishmentById(establishmentId)
    if (!existingEstablishment) {
      logger.warn(`[SUPER-ADMIN API] Establishment ${establishmentId} not found for deletion`, {
        establishmentId,
        userId: session.user.id
      })
      return jsonError('Establishment not found', 404)
    }

    // 🏢 Eliminar establecimiento (hard delete)
    const deletedEstablishment = await deleteEstablishment(establishmentId)

    if (!deletedEstablishment) {
      logger.error(`[SUPER-ADMIN API] Establishment ${establishmentId} deletion returned null`, {
        establishmentId,
        userId: session.user.id
      })
      return jsonError('Failed to delete establishment', 500)
    }

    logger.info(`[SUPER-ADMIN API] Establishment ${establishmentId} deleted successfully:`, {
      establishmentName: existingEstablishment.name,
      userId: session.user.id
    })

    return jsonOk({
      message: 'Establishment deleted successfully',
      deletedEstablishment: {
        establishmentId: deletedEstablishment.establishmentId,
        name: deletedEstablishment.name,
        taxId: deletedEstablishment.taxId,
      }
    })
  } catch (error) {
    // 🔍 Manejo especial para Response objects (de jsonError)
    if (error instanceof Response) {
      return error
    }

    let paramsForErrorLog = 'unknown'
    try {
      const params = await paramsPromise
      paramsForErrorLog = `establishment:${params.id}`
    } catch (paramsError) {
      logger.error('[SUPER-ADMIN API] Error resolving params for establishment deletion logging:', paramsError)
    }

    logger.error(`[SUPER-ADMIN API] Error deleting establishment for ${paramsForErrorLog}:`, error)

    if (error instanceof ZodError) {
      return jsonError(error.errors, 400)
    } else if (error instanceof Error) {
      // Manejar errores de dependencias (FK constraints)
      if (error.message.includes('foreign key') || error.message.includes('dependent')) {
        return jsonError('Cannot delete establishment with active dependencies (users, orders, etc.)', 409)
      }
      return jsonError(error.message, 500)
    } else {
      return jsonError('An unexpected error occurred', 500)
    }
  }
}
