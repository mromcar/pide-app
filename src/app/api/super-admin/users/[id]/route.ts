import { NextRequest } from 'next/server'
import { requireAuth } from '@/middleware/auth-middleware'
import { UserRole } from '@/constants/enums'
import { UserService } from '@/services/user.service'
import { userUpdateSchema } from '@/schemas/user'
import { jsonOk, jsonError } from '@/utils/api'
import { z, ZodError } from 'zod'
import logger from '@/lib/logger'

const userService = new UserService()

const paramsSchema = z.object({
  id: z.coerce.number().int().positive(),
})

/**
 * @swagger
 * /api/super-admin/users/{id}:
 *   get:
 *     summary: Get user by ID (Super Admin)
 *     description: Super admin endpoint to get specific user with full details
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
 *         description: User ID
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *       401:
 *         description: Unauthorized - Only general_admin can access
 *       404:
 *         description: User not found
 *       400:
 *         description: Invalid user ID
 *       500:
 *         description: Internal server error
 */
export async function GET(
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ id: string }> }
) {
  try {
    // 🔒 Solo general_admin puede gestionar usuarios globalmente
    const session = await requireAuth([UserRole.general_admin])

    const params = await paramsPromise
    const paramsValidation = paramsSchema.safeParse(params)

    if (!paramsValidation.success) {
      logger.warn('[SUPER-ADMIN API] Invalid params for user fetch:', { params })
      return jsonError(paramsValidation.error.issues, 400)
    }

    const { id: userId } = paramsValidation.data

    logger.info(`[SUPER-ADMIN API] Fetching user ${userId} by admin: ${session.user.id}`)

    // 👤 Obtener usuario con establishment relacionado
    const user = await userService.getUserById(userId)

    if (!user) {
      logger.warn(`[SUPER-ADMIN API] User ${userId} not found`, {
        userId,
        adminUserId: session.user.id
      })
      return jsonError('User not found', 404)
    }

    // Obtener información adicional de administración si es establishment_admin
    let administratedEstablishments = []
    if (user.role === UserRole.establishment_admin) {
      administratedEstablishments = await userService.getEstablishmentAdmins(user.establishmentId || 0)
    }

    logger.info(`[SUPER-ADMIN API] User ${userId} fetched successfully`, {
      userName: user.name,
      userEmail: user.email,
      userRole: user.role,
      establishmentId: user.establishmentId,
      adminUserId: session.user.id
    })

    return jsonOk({
      user,
      additionalInfo: {
        administratedEstablishments: administratedEstablishments.length,
        canManageEstablishment: user.establishmentId ? true : false
      },
      message: 'User retrieved successfully'
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
      paramsForErrorLog = `user:${params.id}`
    } catch (paramsError) {
      logger.error('[SUPER-ADMIN API] Error resolving params for user fetch logging:', paramsError)
    }

    logger.error(`[SUPER-ADMIN API] Error fetching user for ${paramsForErrorLog}:`, error)

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
 * /api/super-admin/users/{id}:
 *   put:
 *     summary: Update user (Super Admin)
 *     description: Super admin endpoint to update any user including role changes
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
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Usuario Actualizado"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "updated@example.com"
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 example: "NewPassword123"
 *               role:
 *                 type: string
 *                 enum: [client, establishment_admin, general_admin]
 *                 example: "establishment_admin"
 *               establishmentId:
 *                 type: integer
 *                 example: 2
 *                 description: Required if role is establishment_admin
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized - Only general_admin can access
 *       404:
 *         description: User not found
 *       409:
 *         description: Email already exists
 *       500:
 *         description: Internal server error
 */
export async function PUT(
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ id: string }> }
) {
  try {
    // 🔒 Solo general_admin puede actualizar usuarios
    const session = await requireAuth([UserRole.general_admin])

    const params = await paramsPromise
    const paramsValidation = paramsSchema.safeParse(params)

    if (!paramsValidation.success) {
      logger.warn('[SUPER-ADMIN API] Invalid params for user update:', { params })
      return jsonError(paramsValidation.error.issues, 400)
    }

    const { id: userId } = paramsValidation.data

    logger.info(`[SUPER-ADMIN API] Updating user ${userId} by admin: ${session.user.id}`)

    // Verificar que el usuario existe
    const existingUser = await userService.getUserById(userId)
    if (!existingUser) {
      logger.warn(`[SUPER-ADMIN API] User ${userId} not found for update`, {
        userId,
        adminUserId: session.user.id
      })
      return jsonError('User not found', 404)
    }

    const body = await req.json()
    const validatedData = userUpdateSchema.parse(body)

    logger.info(`[SUPER-ADMIN API] Updating user ${userId} with data:`, {
      userName: validatedData.name || existingUser.name,
      userEmail: validatedData.email || existingUser.email,
      newRole: validatedData.role,
      newEstablishmentId: validatedData.establishmentId,
      adminUserId: session.user.id
    })

    // 👤 Actualizar usuario
    const updatedUser = await userService.updateUser(userId, validatedData)

    if (!updatedUser) {
      logger.error(`[SUPER-ADMIN API] User ${userId} update returned null`, {
        userId,
        adminUserId: session.user.id
      })
      return jsonError('Failed to update user', 500)
    }

    // Log importante: cambios de rol o establecimiento
    if (validatedData.role && validatedData.role !== existingUser.role) {
      logger.info(`[SUPER-ADMIN API] ROLE CHANGE: User ${userId} role changed from ${existingUser.role} to ${validatedData.role}`, {
        userId,
        oldRole: existingUser.role,
        newRole: validatedData.role,
        adminUserId: session.user.id
      })
    }

    if (validatedData.establishmentId && validatedData.establishmentId !== existingUser.establishmentId) {
      logger.info(`[SUPER-ADMIN API] ESTABLISHMENT CHANGE: User ${userId} moved from establishment ${existingUser.establishmentId} to ${validatedData.establishmentId}`, {
        userId,
        oldEstablishmentId: existingUser.establishmentId,
        newEstablishmentId: validatedData.establishmentId,
        adminUserId: session.user.id
      })
    }

    logger.info(`[SUPER-ADMIN API] User ${userId} updated successfully:`, {
      userName: updatedUser.name,
      userRole: updatedUser.role,
      establishmentId: updatedUser.establishmentId,
      adminUserId: session.user.id
    })

    return jsonOk({
      user: updatedUser,
      message: 'User updated successfully'
    })
  } catch (error) {
    // 🔍 Manejo especial para Response objects (de jsonError)
    if (error instanceof Response) {
      return error
    }

    let paramsForErrorLog = 'unknown'
    try {
      const params = await paramsPromise
      paramsForErrorLog = `user:${params.id}`
    } catch (paramsError) {
      logger.error('[SUPER-ADMIN API] Error resolving params for user update logging:', paramsError)
    }

    logger.error(`[SUPER-ADMIN API] Error updating user for ${paramsForErrorLog}:`, error)

    if (error instanceof ZodError) {
      return jsonError(error.errors, 400)
    } else if (error instanceof Error) {
      // Manejar errores específicos
      if (error.message.includes('already exists') || error.message.includes('email')) {
        return jsonError('User with this email already exists', 409)
      }
      if (error.message.includes('foreign key') || error.message.includes('establishment')) {
        return jsonError('Invalid establishment ID', 400)
      }
      return jsonError(error.message, 500)
    } else {
      return jsonError('An unexpected error occurred', 500)
    }
  }
}

/**
 * @swagger
 * /api/super-admin/users/{id}:
 *   delete:
 *     summary: Delete user (Super Admin)
 *     description: Super admin endpoint to permanently delete a user
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
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       401:
 *         description: Unauthorized - Only general_admin can access
 *       404:
 *         description: User not found
 *       400:
 *         description: Invalid user ID
 *       409:
 *         description: Cannot delete user with active dependencies
 *       403:
 *         description: Cannot delete another general_admin
 *       500:
 *         description: Internal server error
 */
export async function DELETE(
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ id: string }> }
) {
  try {
    // 🔒 Solo general_admin puede eliminar usuarios
    const session = await requireAuth([UserRole.general_admin])

    const params = await paramsPromise
    const paramsValidation = paramsSchema.safeParse(params)

    if (!paramsValidation.success) {
      logger.warn('[SUPER-ADMIN API] Invalid params for user deletion:', { params })
      return jsonError(paramsValidation.error.issues, 400)
    }

    const { id: userId } = paramsValidation.data

    // 🚫 No permitir que un general_admin se elimine a sí mismo
    if (parseInt(session.user.id) === userId) {
      logger.warn(`[SUPER-ADMIN API] Admin ${session.user.id} attempted to delete themselves`, {
        userId,
        adminUserId: session.user.id
      })
      return jsonError('Cannot delete your own account', 403)
    }

    logger.info(`[SUPER-ADMIN API] Deleting user ${userId} by admin: ${session.user.id}`)

    // Verificar que el usuario existe
    const existingUser = await userService.getUserById(userId)
    if (!existingUser) {
      logger.warn(`[SUPER-ADMIN API] User ${userId} not found for deletion`, {
        userId,
        adminUserId: session.user.id
      })
      return jsonError('User not found', 404)
    }

    // 🚫 Protección adicional: no eliminar otros general_admin (opcional)
    if (existingUser.role === UserRole.general_admin) {
      logger.warn(`[SUPER-ADMIN API] Admin ${session.user.id} attempted to delete another general_admin ${userId}`, {
        targetUserId: userId,
        targetUserEmail: existingUser.email,
        adminUserId: session.user.id
      })
      return jsonError('Cannot delete another general admin', 403)
    }

    // 👤 Eliminar usuario (hard delete)
    const deletedUser = await userService.deleteUser(userId)

    if (!deletedUser) {
      logger.error(`[SUPER-ADMIN API] User ${userId} deletion returned null`, {
        userId,
        adminUserId: session.user.id
      })
      return jsonError('Failed to delete user', 500)
    }

    logger.info(`[SUPER-ADMIN API] User ${userId} deleted successfully:`, {
      deletedUserName: existingUser.name,
      deletedUserEmail: existingUser.email,
      deletedUserRole: existingUser.role,
      adminUserId: session.user.id
    })

    return jsonOk({
      message: 'User deleted successfully',
      deletedUser: {
        userId: deletedUser.userId,
        name: deletedUser.name,
        email: deletedUser.email,
        role: deletedUser.role,
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
      paramsForErrorLog = `user:${params.id}`
    } catch (paramsError) {
      logger.error('[SUPER-ADMIN API] Error resolving params for user deletion logging:', paramsError)
    }

    logger.error(`[SUPER-ADMIN API] Error deleting user for ${paramsForErrorLog}:`, error)

    if (error instanceof ZodError) {
      return jsonError(error.errors, 400)
    } else if (error instanceof Error) {
      // Manejar errores de dependencias (FK constraints)
      if (error.message.includes('foreign key') || error.message.includes('dependent')) {
        return jsonError('Cannot delete user with active dependencies (orders, admin records, etc.)', 409)
      }
      return jsonError(error.message, 500)
    } else {
      return jsonError('An unexpected error occurred', 500)
    }
  }
}
