import { NextRequest } from 'next/server'
import { jsonOk, jsonError } from '@/utils/api'
import { getEstablishmentById } from '@/services/establishment.service'
import { getAllCategoriesByEstablishment } from '@/services/category.service'
import { productService } from '@/services/product.service'
import { EstablishmentResponseDTO } from '@/types/dtos/establishment'
import logger from '@/lib/logger'

/**
 * @swagger
 * /api/menu/{establishmentId}:
 *   get:
 *     summary: Get public menu for a specific establishment
 *     description: Public API to retrieve establishment details and full menu without authentication
 *     tags:
 *       - Public Menu
 *     parameters:
 *       - in: path
 *         name: establishmentId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the establishment to retrieve menu for
 *     responses:
 *       200:
 *         description: Establishment menu retrieved successfully
 *       400:
 *         description: Invalid establishment ID
 *       404:
 *         description: Establishment not found or menu not available
 *       500:
 *         description: Internal server error
 */
export async function GET(
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ establishmentId: string }> }
) {
  try {
    const params = await paramsPromise
    const { establishmentId } = params
    const parsedEstablishmentId = Number(establishmentId)

    if (isNaN(parsedEstablishmentId)) {
      logger.error('[PUBLIC API] ID inválido:', { establishmentId })
      return jsonError('Invalid establishment ID', 400)
    }

    logger.info('[PUBLIC API] Fetching public menu for establishment:', { parsedEstablishmentId })

    // ✅ Verificar establecimiento existe y está activo
    const establishment: EstablishmentResponseDTO | null = await getEstablishmentById(parsedEstablishmentId)

    if (!establishment) {
      logger.warn('[PUBLIC API] Establecimiento no encontrado para id:', { parsedEstablishmentId })
      return jsonError('Establishment not found', 404)
    }

    if (!establishment.isActive) {
      logger.warn('[PUBLIC API] Establecimiento no activo:', { parsedEstablishmentId })
      return jsonError('Establishment is currently unavailable', 404)
    }

    // ✅ Obtener categorías activas usando tu service
    const categories = await getAllCategoriesByEstablishment(parsedEstablishmentId, 1, 1000)

    // ✅ SOLUCIÓN PROFESIONAL: Obtener productos usando método específico para público
    const categoriesWithProducts = await Promise.all(
      categories
        .filter(category => category.isActive !== false)
        .map(async (category) => {

          // ✅ MEJORADO: Obtener productos públicos con variantes activas
          const products = await productService.getPublicProducts(
            parsedEstablishmentId,
            category.categoryId
          )

          // ✅ Los productos ya vienen filtrados (activos + con variantes) por getPublicProducts
          if (products.length === 0) {
            return null // Sin productos = excluir categoría
          }

          return {
            category_id: category.categoryId,
            name: category.name,
            isActive: category.isActive,
            sortOrder: category.sortOrder,
            products: products.map(product => ({
              product_id: product.productId,
              name: product.name,
              description: product.description,
              isActive: product.isActive,
              sortOrder: product.sortOrder,
              responsibleRole: product.responsibleRole,
              variants: product.variants?.map(variant => ({
                variant_id: variant.variantId,
                description: variant.variantDescription,
                price: variant.price,
                sku: variant.sku,
                isActive: variant.isActive,
                sortOrder: variant.sortOrder,
              })) || [],
              allergens: product.allergens?.map(allergen => ({
                allergen_id: allergen.allergen?.allergenId,
                code: allergen.allergen?.code,
                name: allergen.allergen?.name,
                description: allergen.allergen?.description,
                iconUrl: allergen.allergen?.iconUrl,
                isMajorAllergen: allergen.allergen?.isMajorAllergen,
              })) || [],
            })),
          }
        })
    )

    // ✅ Filtrar categorías que no devolvieron productos
    const validCategories = categoriesWithProducts.filter(Boolean)

    // ✅ Recopilar alérgenos únicos de todos los productos
    const allAllergens = validCategories
      .flatMap(cat => cat?.products.flatMap(prod => prod.allergens) || [])
      .filter((allergen, index, self) =>
        allergen.allergen_id &&
        self.findIndex(a => a.allergen_id === allergen.allergen_id) === index
      )

    // ✅ Crear respuesta con ambas estructuras (compatibilidad)
    const publicMenu = {
      // Estructura anterior (compatibilidad)
      establishmentId: establishment.establishmentId,
      establishmentName: establishment.name,
      establishmentDescription: establishment.description || '',
      address: establishment.address || '',
      postalCode: establishment.postalCode || '',
      city: establishment.city || '',
      phone1: establishment.phone1 || '',
      phone2: establishment.phone2 || '',
      website: establishment.website || '',

      // Estructura nueva (esperada por frontend)
      establishment: {
        establishment_id: establishment.establishmentId,
        name: establishment.name,
        description: establishment.description,
        address: establishment.address,
        city: establishment.city,
        phone1: establishment.phone1,
        phone2: establishment.phone2,
        website: establishment.website,
        isActive: establishment.isActive,
      },

      // ✅ Datos del menú usando arquitectura profesional
      categories: validCategories,
      allergens: allAllergens,
    }

    logger.info('[PUBLIC API] Menu público obtenido exitosamente:', {
      parsedEstablishmentId,
      categoriesCount: validCategories.length,
      totalProductsCount: validCategories.reduce((sum, cat) => sum + (cat?.products.length || 0), 0),
      allergensCount: allAllergens.length,
    })

    return jsonOk(publicMenu)

  } catch (error: unknown) {
    let establishmentIdForErrorLog = 'unknown'
    try {
      const params = await paramsPromise
      establishmentIdForErrorLog = params.establishmentId
    } catch (paramsError) {
      logger.error('[PUBLIC API] Error resolving params for logging:', paramsError)
    }

    logger.error(`[PUBLIC API] Error fetching public menu ${establishmentIdForErrorLog}:`, error)

    if (error instanceof Error) {
      return jsonError(error.message, 500)
    } else {
      return jsonError('An unexpected error occurred while fetching menu', 500)
    }
  }
}
