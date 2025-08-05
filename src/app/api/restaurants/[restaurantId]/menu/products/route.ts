import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { productService } from '@/services/product.service';
import { productCreateSchema } from '@/schemas/product';
import { jsonOk, jsonError } from '@/utils/api';
import { z } from 'zod';
import { UserRole } from '@prisma/client';
import logger from '@/lib/logger';

const paramsSchema = z.object({
  restaurantId: z.coerce.number().int().positive(),
});

/**
 * @swagger
 * /api/restaurants/{restaurantId}/menu/products:
 *   get:
 *     summary: Get all products for a specific restaurant
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the restaurant.
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination.
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page.
 *     responses:
 *       200:
 *         description: A list of products.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ProductResponseDTO'
 *       400:
 *         description: Invalid request parameters.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       500:
 *         description: Internal server error.
 */
export async function GET(
  request: NextRequest, 
  { params: paramsPromise }: { params: Promise<{ restaurantId: string }> }
) {
  try {
    const params = await paramsPromise; // ✅ Await params first
    // Comentar autenticación para acceso público al menú
    // const token = await getToken({ req: request });
    // if (!token || !token.sub) {
    //   return jsonError('Unauthorized', 401);
    // }

    const paramsValidation = paramsSchema.safeParse(params);
    if (!paramsValidation.success) {
      return jsonError(paramsValidation.error.issues, 400);
    }
    const { restaurantId } = paramsValidation.data;

    // Comentar verificación de autorización para acceso público
    // const isGeneralAdmin = token.role === UserRole.general_admin;
    // const isCorrectEstablishmentAdmin = token.role === UserRole.establishment_admin && token.establishment_id === restaurantId;
    // if (!isGeneralAdmin && !isCorrectEstablishmentAdmin) {
    //     return jsonError('Forbidden: You do not have access to this restaurant.', 403);
    // }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const categoryIdString = searchParams.get('categoryId');
    const categoryId = categoryIdString ? parseInt(categoryIdString, 10) : undefined;

    // Assuming getAllProducts in service is updated to accept restaurantId, page, pageSize
    // and does not need language directly for basic product listing.
    // Language-specific data would typically be handled by how translations are included/queried in the service.
    const products = await productService.getAllProducts(restaurantId, page, pageSize, categoryId);
    return jsonOk(products);
  } catch (error) {
    logger.error('Error in GET products:', error);
    if (error instanceof z.ZodError) {
      return jsonError(error.issues, 400);
    }
    return jsonError('An unexpected error occurred.', 500);
  }
}

/**
 * @swagger
 * /api/restaurants/{restaurantId}/menu/products:
 *   post:
 *     summary: Create a new product for a specific restaurant
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the restaurant.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductCreateInput'
 *     responses:
 *       201:
 *         description: Product created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductResponseDTO'
 *       400:
 *         description: Invalid request body or parameters.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       500:
 *         description: Internal server error.
 */
export async function POST(request: NextRequest, { params }: { params: { restaurantId: string } }) {
  try {
    const token = await getToken({ req: request });
    if (!token || !token.sub) {
      return jsonError('Unauthorized', 401);
    }
    const userId = parseInt(token.sub, 10);

    const paramsValidation = paramsSchema.safeParse(params);
    if (!paramsValidation.success) {
      return jsonError(paramsValidation.error.issues, 400);
    }
    const { restaurantId } = paramsValidation.data;

    // Authorization: Ensure the admin can create products for this restaurant
    const isGeneralAdmin = token.role === UserRole.general_admin;
    const isCorrectEstablishmentAdmin = token.role === UserRole.establishment_admin && token.establishment_id === restaurantId;

    if (!isGeneralAdmin && !isCorrectEstablishmentAdmin) {
      return jsonError('Forbidden: You are not authorized to create products for this restaurant.', 403);
    }

    const body = await request.json();
    // Add restaurantId to the body before validation if your schema expects it
    // Or ensure your service method correctly uses the restaurantId from the path params.
    const validatedData = productCreateSchema.safeParse({
      ...body,
      establishment_id: restaurantId, // Ensure establishment_id is part of the data sent to service if schema requires
    });

    if (!validatedData.success) {
      return jsonError(validatedData.error.issues, 400);
    }

    const product = await productService.createProduct(
      validatedData.data, // establishment_id is now part of validatedData.data
      userId
    );
    return jsonOk(product, 201);
  } catch (error) {
    logger.error('Error in POST product:', error);
    if (error instanceof z.ZodError) {
      return jsonError(error.issues, 400);
    }
    return jsonError('An unexpected error occurred.', 500);
  }
}
