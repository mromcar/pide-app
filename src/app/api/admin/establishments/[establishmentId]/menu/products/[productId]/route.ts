import { NextRequest } from 'next/server'
import { requireAuth } from '@/middleware/auth-middleware'
import { UserRole } from '@/constants/enums'
import { productService } from '@/services/product.service'
import { productUpdateSchema } from '@/schemas/product'
import { jsonOk, jsonError } from '@/utils/api'
import { z, ZodError } from 'zod'
import logger from '@/lib/logger'

const paramsSchema = z.object({
  establishmentId: z.coerce.number().int().positive(),
  productId: z.coerce.number().int().positive(),
})

export async function GET(
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ establishmentId: string; productId: string }> }
) {
  try {
    // 🔒 Autenticación requerida para admin
    const session = await requireAuth([UserRole.general_admin, UserRole.establishment_admin])

    const params = await paramsPromise
    const paramsValidation = paramsSchema.safeParse(params)

    if (!paramsValidation.success) {
      logger.warn('[ADMIN API] Invalid params for product fetch:', { params })
      return jsonError(paramsValidation.error.issues, 400)
    }

    const { establishmentId, productId } = paramsValidation.data

    logger.info(`[ADMIN API] Fetching product ${productId} for establishment ${establishmentId} by user: ${session.user.id}`)

    // 🔒 Verificar permisos específicos del establecimiento
    if (session.user.role === UserRole.establishment_admin && session.user.establishmentId !== establishmentId) {
      logger.warn(`[ADMIN API] User ${session.user.id} attempted to access establishment ${establishmentId} but belongs to ${session.user.establishmentId}`)
      return jsonError('Forbidden: You can only manage your own establishment', 403)
    }

    // 🍽️ Obtener producto específico
    const product = await productService.getProductById(productId)

    if (!product) {
      logger.warn(`[ADMIN API] Product ${productId} not found`, {
        productId,
        establishmentId,
        userId: session.user.id
      })
      return jsonError('Product not found', 404)
    }

    // Verificar que el producto pertenece al establecimiento
    if (product.establishmentId !== establishmentId) {
      logger.warn(`[ADMIN API] Product ${productId} does not belong to establishment ${establishmentId}`, {
        productId,
        productEstablishmentId: product.establishmentId,
        requestedEstablishmentId: establishmentId,
        userId: session.user.id
      })
      return jsonError('Product not found in this establishment', 404)
    }

    logger.info(`[ADMIN API] Product ${productId} fetched successfully`, {
      productName: product.name,
      establishmentId,
      userId: session.user.id
    })

    return jsonOk({ product })
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
      paramsForErrorLog = `establishment:${params.establishmentId}, product:${params.productId}`
    } catch (paramsError) {
      logger.error('[ADMIN API] Error resolving params for product fetch logging:', paramsError)
    }

    logger.error(`[ADMIN API] Error fetching product for ${paramsForErrorLog}:`, error)

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
  { params: paramsPromise }: { params: Promise<{ establishmentId: string; productId: string }> }
) {
  try {
    // 🔒 Autenticación requerida para admin
    const session = await requireAuth([UserRole.general_admin, UserRole.establishment_admin])

    const params = await paramsPromise
    const paramsValidation = paramsSchema.safeParse(params)

    if (!paramsValidation.success) {
      logger.warn('[ADMIN API] Invalid params for product update:', { params })
      return jsonError(paramsValidation.error.issues, 400)
    }

    const { establishmentId, productId } = paramsValidation.data

    logger.info(`[ADMIN API] Updating product ${productId} for establishment ${establishmentId} by user: ${session.user.id}`)

    // 🔒 Verificar permisos específicos del establecimiento
    if (session.user.role === UserRole.establishment_admin && session.user.establishmentId !== establishmentId) {
      logger.warn(`[ADMIN API] User ${session.user.id} attempted to update product in establishment ${establishmentId} but belongs to ${session.user.establishmentId}`)
      return jsonError('Forbidden: You can only manage your own establishment', 403)
    }

    // Verificar que el producto existe y pertenece al establecimiento
    const existingProduct = await productService.getProductById(productId)
    if (!existingProduct) {
      logger.warn(`[ADMIN API] Product ${productId} not found for update`, {
        productId,
        establishmentId,
        userId: session.user.id
      })
      return jsonError('Product not found', 404)
    }

    if (existingProduct.establishmentId !== establishmentId) {
      logger.warn(`[ADMIN API] Product ${productId} does not belong to establishment ${establishmentId} for update`, {
        productId,
        productEstablishmentId: existingProduct.establishmentId,
        requestedEstablishmentId: establishmentId,
        userId: session.user.id
      })
      return jsonError('Product not found in this establishment', 404)
    }

    const body = await req.json()
    const validatedData = productUpdateSchema.parse(body)

    logger.info(`[ADMIN API] Updating product ${productId} with data:`, {
      productName: validatedData.name,
      establishmentId,
      userId: session.user.id
    })

    // 🍽️ Actualizar producto con auditoría
    const updatedProduct = await productService.updateProduct(
      productId,
      validatedData,
      parseInt(session.user.id)
    )

    if (!updatedProduct) {
      logger.error(`[ADMIN API] Product ${productId} update returned null`, {
        productId,
        establishmentId,
        userId: session.user.id
      })
      return jsonError('Failed to update product', 500)
    }

    logger.info(`[ADMIN API] Product ${productId} updated successfully:`, {
      productName: updatedProduct.name,
      establishmentId,
      userId: session.user.id
    })

    return jsonOk({ product: updatedProduct })
  } catch (error) {
    // 🔍 Manejo especial para Response objects (de jsonError)
    if (error instanceof Response) {
      return error
    }

    let paramsForErrorLog = 'unknown'
    try {
      const params = await paramsPromise
      paramsForErrorLog = `establishment:${params.establishmentId}, product:${params.productId}`
    } catch (paramsError) {
      logger.error('[ADMIN API] Error resolving params for product update logging:', paramsError)
    }

    logger.error(`[ADMIN API] Error updating product for ${paramsForErrorLog}:`, error)

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
  { params: paramsPromise }: { params: Promise<{ establishmentId: string; productId: string }> }
) {
  try {
    // 🔒 Autenticación requerida para admin
    const session = await requireAuth([UserRole.general_admin, UserRole.establishment_admin])

    const params = await paramsPromise
    const paramsValidation = paramsSchema.safeParse(params)

    if (!paramsValidation.success) {
      logger.warn('[ADMIN API] Invalid params for product deletion:', { params })
      return jsonError(paramsValidation.error.issues, 400)
    }

    const { establishmentId, productId } = paramsValidation.data

    logger.info(`[ADMIN API] Deleting product ${productId} for establishment ${establishmentId} by user: ${session.user.id}`)

    // 🔒 Verificar permisos específicos del establecimiento
    if (session.user.role === UserRole.establishment_admin && session.user.establishmentId !== establishmentId) {
      logger.warn(`[ADMIN API] User ${session.user.id} attempted to delete product in establishment ${establishmentId} but belongs to ${session.user.establishmentId}`)
      return jsonError('Forbidden: You can only manage your own establishment', 403)
    }

    // Verificar que el producto existe y pertenece al establecimiento
    const existingProduct = await productService.getProductById(productId)
    if (!existingProduct) {
      logger.warn(`[ADMIN API] Product ${productId} not found for deletion`, {
        productId,
        establishmentId,
        userId: session.user.id
      })
      return jsonError('Product not found', 404)
    }

    if (existingProduct.establishmentId !== establishmentId) {
      logger.warn(`[ADMIN API] Product ${productId} does not belong to establishment ${establishmentId} for deletion`, {
        productId,
        productEstablishmentId: existingProduct.establishmentId,
        requestedEstablishmentId: establishmentId,
        userId: session.user.id
      })
      return jsonError('Product not found in this establishment', 404)
    }

    // 🍽️ Eliminar producto (soft delete)
    const deletedProduct = await productService.deleteProduct(
      productId,
      parseInt(session.user.id)
    )

    if (!deletedProduct) {
      logger.error(`[ADMIN API] Product ${productId} deletion returned null`, {
        productId,
        establishmentId,
        userId: session.user.id
      })
      return jsonError('Failed to delete product', 500)
    }

    logger.info(`[ADMIN API] Product ${productId} deleted successfully:`, {
      productName: existingProduct.name,
      establishmentId,
      userId: session.user.id
    })

    return jsonOk({ message: 'Product deleted successfully' })
  } catch (error) {
    // 🔍 Manejo especial para Response objects (de jsonError)
    if (error instanceof Response) {
      return error
    }

    let paramsForErrorLog = 'unknown'
    try {
      const params = await paramsPromise
      paramsForErrorLog = `establishment:${params.establishmentId}, product:${params.productId}`
    } catch (paramsError) {
      logger.error('[ADMIN API] Error resolving params for product deletion logging:', paramsError)
    }

    logger.error(`[ADMIN API] Error deleting product for ${paramsForErrorLog}:`, error)

    if (error instanceof ZodError) {
      return jsonError(error.errors, 400)
    } else if (error instanceof Error) {
      return jsonError(error.message, 500)
    } else {
      return jsonError('An unexpected error occurred', 500)
    }
  }
}
