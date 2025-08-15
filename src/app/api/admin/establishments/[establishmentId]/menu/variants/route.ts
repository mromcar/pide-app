import { NextRequest } from 'next/server'
import { requireAuth } from '@/middleware/auth-middleware'
import { UserRole } from '@/constants/enums'
import { productVariantService } from '@/services/productVariant.service'
import { productService } from '@/services/product.service'
import { productVariantCreateSchema } from '@/schemas/productVariant'
import { jsonOk, jsonError } from '@/utils/api'
import { z, ZodError } from 'zod'
import logger from '@/lib/logger'

const paramsSchema = z.object({
  establishmentId: z.coerce.number().int().positive(),
})

const queryParamsSchema = z.object({
  productId: z.coerce.number().int().positive(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
})

/**
 * @swagger
 * /api/admin/establishments/{establishmentId}/menu/variants:
 *   get:
 *     summary: Get all variants for admin management
 *     description: Admin API to retrieve all variants (active and inactive) for a product with pagination
 *     tags:
 *       - Admin - Variants
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: establishmentId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the establishment
 *       - in: query
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the product to fetch variants for
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
 *         description: Number of variants per page
 *     responses:
 *       200:
 *         description: Variants retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ProductVariant'
 *       400:
 *         description: Invalid parameters
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Product not found or does not belong to establishment
 *       500:
 *         description: Internal server error
 */
export async function GET(
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ establishmentId: string }> }
) {
  try {
    // 🔒 Autenticación requerida para admin
    const session = await requireAuth([UserRole.general_admin, UserRole.establishment_admin])

    const params = await paramsPromise
    const paramsValidation = paramsSchema.safeParse(params)

    if (!paramsValidation.success) {
      logger.warn('[ADMIN API] Invalid establishment ID for variants:', { params })
      return jsonError(paramsValidation.error.issues, 400)
    }

    const { establishmentId } = paramsValidation.data

    const { searchParams } = new URL(req.url)
    const queryValidation = queryParamsSchema.safeParse({
      productId: searchParams.get('productId'),
      page: searchParams.get('page'),
      pageSize: searchParams.get('pageSize'),
    })

    if (!queryValidation.success) {
      logger.warn('[ADMIN API] Invalid query parameters for variants:', {
        establishmentId,
        searchParams: Object.fromEntries(searchParams)
      })
      return jsonError(queryValidation.error.issues, 400)
    }

    const { productId, page, pageSize } = queryValidation.data

    logger.info(`[ADMIN API] Fetching variants for product: ${productId} in establishment: ${establishmentId} by user: ${session.user.id}`, {
      page,
      pageSize
    })

    // 🔒 Verificar permisos específicos del establecimiento
    if (session.user.role === UserRole.establishment_admin && session.user.establishmentId !== establishmentId) {
      logger.warn(`[ADMIN API] User ${session.user.id} attempted to access establishment ${establishmentId} but belongs to ${session.user.establishmentId}`)
      return jsonError('Forbidden: You can only manage your own establishment', 403)
    }

    // 🔒 Verificar que el producto existe y pertenece al establecimiento
    const product = await productService.getProductById(productId)
    if (!product || product.establishmentId !== establishmentId) {
      logger.warn('[ADMIN API] Product not found or does not belong to establishment:', {
        establishmentId,
        productId
      })
      return jsonError('Product not found or does not belong to this establishment', 404)
    }

    // 🔒 Obtener todas las variantes (activas e inactivas) para administración con paginación
    const allVariants = await productVariantService.getAllProductVariantsForProduct(
      productId,
      page,
      pageSize
    )

    // Filtrar por establecimiento (doble verificación de seguridad)
    const establishmentVariants = allVariants.filter(variant =>
      variant.establishmentId === establishmentId
    )

    logger.info(`[ADMIN API] Found ${establishmentVariants.length} variants for product: ${productId}`, {
      establishmentId,
      page,
      pageSize,
      totalVariants: allVariants.length,
      establishmentVariants: establishmentVariants.length
    })

    return jsonOk(establishmentVariants)
  } catch (error) {
    // 🔍 Manejo especial para Response objects (de jsonError)
    if (error instanceof Response) {
      return error // Devolver directamente la respuesta de autenticación
    }

    let establishmentIdForErrorLog = 'unknown'
    let productIdForErrorLog = 'unknown'

    try {
      const params = await paramsPromise
      establishmentIdForErrorLog = params.establishmentId

      const { searchParams } = new URL(req.url)
      productIdForErrorLog = searchParams.get('productId') || 'unknown'
    } catch (paramsError) {
      logger.error('[ADMIN API] Error resolving params for variants logging:', paramsError)
    }

    logger.error(`[ADMIN API] Error fetching variants for establishment ${establishmentIdForErrorLog}, product ${productIdForErrorLog}:`, error)

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
 * /api/admin/establishments/{establishmentId}/menu/variants:
 *   post:
 *     summary: Create a new variant
 *     description: Admin API to create a new variant for a product
 *     tags:
 *       - Admin - Variants
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: establishmentId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the establishment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductVariantCreate'
 *     responses:
 *       201:
 *         description: Variant created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 variant:
 *                   $ref: '#/components/schemas/ProductVariant'
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Product not found or does not belong to establishment
 *       500:
 *         description: Internal server error
 */
export async function POST(
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ establishmentId: string }> }
) {
  try {
    // 🔒 Autenticación requerida para admin
    const session = await requireAuth([UserRole.general_admin, UserRole.establishment_admin])

    const params = await paramsPromise
    const paramsValidation = paramsSchema.safeParse(params)

    if (!paramsValidation.success) {
      logger.warn('[ADMIN API] Invalid establishment ID for variant creation:', { params })
      return jsonError(paramsValidation.error.issues, 400)
    }

    const { establishmentId } = paramsValidation.data

    logger.info(`[ADMIN API] Creating variant for establishmentId: ${establishmentId} by user: ${session.user.id}`)

    // 🔒 Verificar permisos específicos del establecimiento
    if (session.user.role === UserRole.establishment_admin && session.user.establishmentId !== establishmentId) {
      logger.warn(`[ADMIN API] User ${session.user.id} attempted to create variant in establishment ${establishmentId} but belongs to ${session.user.establishmentId}`)
      return jsonError('Forbidden: You can only manage your own establishment', 403)
    }

    const body = await req.json()
    const validatedData = productVariantCreateSchema.parse(body)

    // 🔒 Verificar que el producto existe y pertenece al establecimiento
    const product = await productService.getProductById(validatedData.productId)
    if (!product || product.establishmentId !== establishmentId) {
      logger.warn('[ADMIN API] Product not found or does not belong to establishment for variant creation:', {
        establishmentId,
        productId: validatedData.productId
      })
      return jsonError('Product not found or does not belong to this establishment', 404)
    }

    logger.info(`[ADMIN API] Creating variant with data:`, {
      establishmentId,
      productId: validatedData.productId,
      variantDescription: validatedData.variantDescription,
      userId: session.user.id
    })

    // 🔒 Crear variante con auditoría - agregamos createdByUserId después de la validación
    const variantData = {
      ...validatedData,
      establishmentId,
      createdByUserId: parseInt(session.user.id), // Auditoría: quién creó la variante
    }

    const variant = await productVariantService.createProductVariant(variantData)

    logger.info(`[ADMIN API] Variant created successfully:`, {
      variantId: variant.variantId,
      productId: validatedData.productId,
      establishmentId,
      userId: session.user.id
    })

    return jsonOk({ variant }, 201)
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
      logger.error('[ADMIN API] Error resolving params for variant creation logging:', paramsError)
    }

    logger.error(`[ADMIN API] Error creating variant for establishment ${establishmentIdForErrorLog}:`, error)

    if (error instanceof ZodError) {
      return jsonError(error.errors, 400)
    } else if (error instanceof Error) {
      return jsonError(error.message, 500)
    } else {
      return jsonError('An unexpected error occurred', 500)
    }
  }
}
