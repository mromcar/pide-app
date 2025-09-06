import { NextRequest } from 'next/server'
import { requireAuth } from '@/middleware/auth-middleware'
import { UserRole } from '@/constants/enums'
import { productService } from '@/services/product.service'
import { productCreateSchema } from '@/schemas/product'
import { jsonOk, jsonError } from '@/utils/api'
import { z, ZodError } from 'zod'
import logger from '@/lib/logger'

const paramsSchema = z.object({
  establishmentId: z.coerce.number().int().positive(),
})

// ✅ CORRECCIÓN: Hacer que los defaults funcionen correctamente
const queryParamsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  categoryId: z.coerce.number().int().positive().optional(),
})

/**
 * @swagger
 * /api/admin/establishments/{establishmentId}/menu/products:
 *   get:
 *     summary: Get all products for admin management
 *     description: Admin API to retrieve all products (active and inactive) for an establishment with pagination
 *     tags:
 *       - Admin - Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: establishmentId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the establishment to retrieve products for
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
 *           default: 20
 *         description: Number of products per page
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: integer
 *         description: Optional filter by category ID
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       400:
 *         description: Invalid parameters
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Internal server error
 */
export async function GET(
  request: NextRequest,
  { params: paramsPromise }: { params: Promise<{ establishmentId: string }> }
) {
  try {
    // 🔒 Autenticación requerida para admin
    const session = await requireAuth([UserRole.general_admin, UserRole.establishment_admin])

    const params = await paramsPromise
    const paramsValidation = paramsSchema.safeParse(params)

    if (!paramsValidation.success) {
      logger.warn('[ADMIN API] Invalid establishment ID for products:', { params })
      return jsonError(paramsValidation.error.issues, 400)
    }

    const { establishmentId } = paramsValidation.data

    // ✅ CORRECCIÓN: Obtener valores raw de searchParams y aplicar defaults manualmente si es necesario
    const { searchParams } = new URL(request.url)
    const rawQueryParams = {
      page: searchParams.get('page') || '1',
      pageSize: searchParams.get('pageSize') || '20',
      categoryId: searchParams.get('categoryId') || undefined,
    }

    console.log('🔍 Raw query params:', rawQueryParams)

    const queryValidation = queryParamsSchema.safeParse(rawQueryParams)

    if (!queryValidation.success) {
      logger.warn('[ADMIN API] Invalid query parameters for products:', {
        establishmentId,
        rawQueryParams,
        errors: queryValidation.error.issues
      })
      return jsonError(queryValidation.error.issues, 400)
    }

    const { page, pageSize, categoryId } = queryValidation.data

    logger.info(`[ADMIN API] Fetching products for establishmentId: ${establishmentId} by user: ${session.user.id}`, {
      page,
      pageSize,
      categoryId
    })

    // 🔒 Verificar permisos específicos del establecimiento
    if (session.user.role === UserRole.establishment_admin && session.user.establishmentId !== establishmentId) {
      logger.warn(`[ADMIN API] User ${session.user.id} attempted to access establishment ${establishmentId} but belongs to ${session.user.establishmentId}`)
      return jsonError('Forbidden: You can only manage your own establishment', 403)
    }

    // 🔒 Obtener todos los productos (activos e inactivos) para administración con paginación
    const allProducts = await productService.getAllProducts(
      establishmentId,
      page,
      pageSize,
      categoryId
    )

    logger.info(`[ADMIN API] Found ${allProducts.length} products for establishmentId: ${establishmentId}`, {
      page,
      pageSize,
      categoryId
    })

    // ✅ CORRECCIÓN: Devolver en el formato esperado por el frontend
    return jsonOk({ products: allProducts })
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
      logger.error('[ADMIN API] Error resolving params for products logging:', paramsError)
    }

    logger.error(`[ADMIN API] Error fetching products for establishment ${establishmentIdForErrorLog}:`, error)

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
 * /api/admin/establishments/{establishmentId}/menu/products:
 *   post:
 *     summary: Create a new product
 *     description: Admin API to create a new product for an establishment
 *     tags:
 *       - Admin - Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: establishmentId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the establishment to create product for
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductCreate'
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 product:
 *                   $ref: '#/components/schemas/Product'
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Internal server error
 */
export async function POST(
  request: NextRequest,
  { params: paramsPromise }: { params: Promise<{ establishmentId: string }> }
) {
  try {
    // 🔒 Autenticación requerida para admin
    const session = await requireAuth([UserRole.general_admin, UserRole.establishment_admin])

    const params = await paramsPromise
    const paramsValidation = paramsSchema.safeParse(params)

    if (!paramsValidation.success) {
      logger.warn('[ADMIN API] Invalid establishment ID for product creation:', { params })
      return jsonError(paramsValidation.error.issues, 400)
    }

    const { establishmentId } = paramsValidation.data

    logger.info(`[ADMIN API] Creating product for establishmentId: ${establishmentId} by user: ${session.user.id}`)

    // 🔒 Verificar permisos específicos del establecimiento
    if (session.user.role === UserRole.establishment_admin && session.user.establishmentId !== establishmentId) {
      logger.warn(`[ADMIN API] User ${session.user.id} attempted to create product in establishment ${establishmentId} but belongs to ${session.user.establishmentId}`)
      return jsonError('Forbidden: You can only manage your own establishment', 403)
    }

    const body = await request.json()
    const validatedData = productCreateSchema.parse(body)

    logger.info(`[ADMIN API] Creating product with data:`, {
      establishmentId,
      productName: validatedData.name,
      categoryId: validatedData.categoryId,
      userId: session.user.id
    })

    // 🔒 Crear producto con auditoría
    const productData = {
      ...validatedData,
      establishmentId,
      createdByUserId: parseInt(session.user.id),
    }

    const product = await productService.createProduct(productData)

    logger.info(`[ADMIN API] Product created successfully:`, {
      productId: product.productId,
      establishmentId,
      userId: session.user.id
    })

    return jsonOk({ product }, 201)
  } catch (error) {
    // 🔍 Manejo especial para Response objects (de jsonError)
    if (error instanceof Response) {
      return error
    }

    let establishmentIdForErrorLog = 'unknown'
    try {
      const params = await paramsPromise
      establishmentIdForErrorLog = params.establishmentId
    } catch (paramsError) {
      logger.error('[ADMIN API] Error resolving params for product creation logging:', paramsError)
    }

    logger.error(`[ADMIN API] Error creating product for establishment ${establishmentIdForErrorLog}:`, error)

    if (error instanceof ZodError) {
      return jsonError(error.errors, 400)
    } else if (error instanceof Error) {
      return jsonError(error.message, 500)
    } else {
      return jsonError('An unexpected error occurred', 500)
    }
  }
}
