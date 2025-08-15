import { NextRequest } from 'next/server'
import { requireAuth } from '@/middleware/auth-middleware'
import { UserRole } from '@/constants/enums'
import { UserService } from '@/services/user.service'
import { userCreateSchema } from '@/schemas/user'
import { jsonOk, jsonError } from '@/utils/api'
import { z, ZodError } from 'zod'
import logger from '@/lib/logger'

const userService = new UserService()

// Schema para query parameters de búsqueda y paginación
const querySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10),
  role: z.nativeEnum(UserRole).optional(),
  search: z.string().max(100).optional(),
  establishmentId: z.coerce.number().int().positive().optional(),
})

/**
 * @swagger
 * /api/super-admin/users:
 *   get:
 *     summary: Get all users with filters (Super Admin)
 *     description: Super admin endpoint to list all users with advanced filtering and pagination
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
 *         description: Number of users per page
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [client, establishment_admin, general_admin]
 *         description: Filter by user role
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           maxLength: 100
 *         description: Search by name or email
 *       - in: query
 *         name: establishmentId
 *         schema:
 *           type: integer
 *         description: Filter by establishment ID
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       401:
 *         description: Unauthorized - Only general_admin can access
 *       400:
 *         description: Invalid query parameters
 *       500:
 *         description: Internal server error
 */
export async function GET(req: NextRequest) {
  try {
    // 🔒 Solo general_admin puede gestionar usuarios globalmente
    const session = await requireAuth([UserRole.general_admin])

    // Extraer y validar query parameters
    const { searchParams } = new URL(req.url)
    const queryValidation = querySchema.safeParse({
      page: searchParams.get('page'),
      pageSize: searchParams.get('pageSize'),
      role: searchParams.get('role'),
      search: searchParams.get('search'),
      establishmentId: searchParams.get('establishmentId'),
    })

    if (!queryValidation.success) {
      logger.warn('[SUPER-ADMIN API] Invalid query parameters for users fetch:', {
        errors: queryValidation.error.issues,
        userId: session.user.id
      })
      return jsonError(queryValidation.error.issues, 400)
    }

    const { page, pageSize, role, search, establishmentId } = queryValidation.data

    logger.info(`[SUPER-ADMIN API] Fetching users by admin: ${session.user.id}`, {
      page,
      pageSize,
      role,
      search,
      establishmentId,
      userId: session.user.id
    })

    let users = []

    // 👥 Aplicar filtros según los parámetros
    if (search) {
      // Búsqueda por nombre o email
      users = await userService.searchUsers(search, pageSize)
    } else if (role) {
      // Filtrar por rol
      users = await userService.getUsersByRole(role)
      // Aplicar paginación manual si es necesario
      const start = (page - 1) * pageSize
      users = users.slice(start, start + pageSize)
    } else if (establishmentId) {
      // Filtrar por establecimiento
      users = await userService.getUsersByEstablishment(establishmentId)
      // Aplicar paginación manual si es necesario
      const start = (page - 1) * pageSize
      users = users.slice(start, start + pageSize)
    } else {
      // Obtener todos con paginación
      users = await userService.getAllUsers(page, pageSize)
    }

    // Obtener estadísticas adicionales
    const totalUsers = await userService.getUserCount()

    logger.info(`[SUPER-ADMIN API] Users fetched successfully:`, {
      totalUsersReturned: users.length,
      totalUsersInSystem: totalUsers,
      page,
      pageSize,
      filters: { role, search, establishmentId },
      userId: session.user.id
    })

    return jsonOk({
      users,
      pagination: {
        page,
        pageSize,
        total: users.length,
        totalPages: Math.ceil(users.length / pageSize)
      },
      stats: {
        totalUsersInSystem: totalUsers
      },
      filters: {
        role: role || null,
        search: search || null,
        establishmentId: establishmentId || null
      },
      message: 'Users retrieved successfully'
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

    logger.error(`[SUPER-ADMIN API] Error fetching users:`, error)

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
 * /api/super-admin/users:
 *   post:
 *     summary: Create new user (Super Admin)
 *     description: Super admin endpoint to create users of any role
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
 *               - email
 *               - password
 *               - name
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "admin@example.com"
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 example: "SecurePassword123"
 *               name:
 *                 type: string
 *                 example: "Admin Usuario"
 *               role:
 *                 type: string
 *                 enum: [client, establishment_admin, general_admin]
 *                 example: "establishment_admin"
 *               establishmentId:
 *                 type: integer
 *                 example: 1
 *                 description: Required if role is establishment_admin
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized - Only general_admin can access
 *       409:
 *         description: User with this email already exists
 *       500:
 *         description: Internal server error
 */
export async function POST(req: NextRequest) {
  try {
    // 🔒 Solo general_admin puede crear usuarios
    const session = await requireAuth([UserRole.general_admin])

    const body = await req.json()
    const validatedData = userCreateSchema.parse(body)

    logger.info(`[SUPER-ADMIN API] Creating new user by admin: ${session.user.id}`, {
      userEmail: validatedData.email,
      userName: validatedData.name,
      role: validatedData.role,
      establishmentId: validatedData.establishmentId,
      adminUserId: session.user.id
    })

    // 👥 Crear usuario
    const newUser = await userService.createUser(validatedData)

    logger.info(`[SUPER-ADMIN API] User created successfully:`, {
      userId: newUser.userId,
      userEmail: newUser.email,
      role: newUser.role,
      establishmentId: newUser.establishmentId,
      adminUserId: session.user.id
    })

    return jsonOk({
      user: newUser,
      message: 'User created successfully'
    }, 201)
  } catch (error) {
    // 🔍 Manejo especial para Response objects (de jsonError)
    if (error instanceof Response) {
      return error
    }

    logger.error(`[SUPER-ADMIN API] Error creating user:`, error)

    if (error instanceof ZodError) {
      return jsonError(error.errors, 400)
    } else if (error instanceof Error) {
      // Manejar errores específicos
      if (error.message.includes('already exists')) {
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
