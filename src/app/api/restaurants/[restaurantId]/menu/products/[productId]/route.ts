import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { z } from 'zod';
import { productService } from '@/services/product.service';
import { productUpdateSchema } from '@/schemas/product';
import { jsonOk, jsonError } from '@/utils/api';
import { UserRole } from '@prisma/client';
import logger from '@/lib/logger';

const paramsSchema = z.object({
  restaurantId: z.coerce.number().int().positive(),
  productId: z.coerce.number().int().positive(),
});

/**
 * @swagger
 * /api/restaurants/{restaurantId}/menu/products/{productId}:
 *   get:
 *     summary: Get a specific product by ID for a restaurant
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the restaurant.
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the product.
 *     responses:
 *       200:
 *         description: Product details.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductResponseDTO'
 *       400:
 *         description: Invalid request parameters.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: Product not found.
 *       500:
 *         description: Internal server error.
 */
export async function GET(req: NextRequest, { params }: { params: { restaurantId: string, productId: string } }) {
  try {
    const token = await getToken({ req });
    if (!token || !token.sub) {
      return jsonError('Unauthorized', 401);
    }

    const parsedParams = paramsSchema.safeParse(params);
    if (!parsedParams.success) {
      return jsonError(parsedParams.error.issues, 400);
    }
    const { restaurantId, productId } = parsedParams.data;

    // Authorization: Check if user can access this restaurant's data
    const isGeneralAdmin = token.role === UserRole.general_admin;
    const isCorrectEstablishmentAdmin = token.role === UserRole.establishment_admin && token.establishmentId === restaurantId;

    if (!isGeneralAdmin && !isCorrectEstablishmentAdmin) {
      return jsonError('Forbidden', 403);
    }

    const product = await productService.getProductById(productId);

    if (!product || product.establishmentId !== restaurantId) {
      return jsonError('Product not found or does not belong to the restaurant.', 404);
    }

    // Devuelve los datos en camelCase
    return jsonOk(product);
  } catch (error) {
    logger.error('Error in GET product:', error);
    if (error instanceof z.ZodError) {
      return jsonError(error.issues, 400);
    }
    return jsonError('An unexpected error occurred.', 500);
  }
}

/**
 * @swagger
 * /api/restaurants/{restaurantId}/menu/products/{productId}:
 *   put:
 *     summary: Update a product for a restaurant
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the restaurant.
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the product.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductUpdateInput'
 *     responses:
 *       200:
 *         description: Product updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductResponseDTO'
 *       400:
 *         description: Invalid request parameters or body.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: Product not found.
 *       500:
 *         description: Internal server error.
 */
export async function PUT(req: NextRequest, { params }: { params: { restaurantId: string, productId: string } }) {
  try {
    const token = await getToken({ req });
    if (!token || !token.sub) {
      return jsonError('Unauthorized', 401);
    }
    const userId = parseInt(token.sub, 10);

    const parsedParams = paramsSchema.safeParse(params);
    if (!parsedParams.success) {
      return jsonError(parsedParams.error.issues, 400);
    }
    const { restaurantId, productId } = parsedParams.data;

    // Authorization: Check if user can modify this restaurant's data
    const isGeneralAdmin = token.role === UserRole.general_admin;
    const isCorrectEstablishmentAdmin = token.role === UserRole.establishment_admin && token.establishmentId === restaurantId;

    if (!isGeneralAdmin && !isCorrectEstablishmentAdmin) {
      return jsonError('Forbidden', 403);
    }

    const body = await req.json();
    const parsedBody = productUpdateSchema.safeParse(body);
    if (!parsedBody.success) {
      return jsonError(parsedBody.error.issues, 400);
    }

    // Ensure product belongs to the restaurant before updating
    const existingProduct = await productService.getProductById(productId);
    if (!existingProduct || existingProduct.establishmentId !== restaurantId) {
      return jsonError('Product not found or does not belong to the restaurant.', 404);
    }

    const updatedProduct = await productService.updateProduct(productId, parsedBody.data, userId);
    if (!updatedProduct) {
      return jsonError('Failed to update product or product not found.', 404);
    }

    // Devuelve los datos en camelCase
    return jsonOk(updatedProduct);
  } catch (error) {
    logger.error('Error in PUT product:', error);
    if (error instanceof z.ZodError) {
      return jsonError(error.issues, 400);
    }
    return jsonError('An unexpected error occurred.', 500);
  }
}

/**
 * @swagger
 * /api/restaurants/{restaurantId}/menu/products/{productId}:
 *   delete:
 *     summary: Delete a product for a restaurant (soft delete)
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the restaurant.
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the product.
 *     responses:
 *       200:
 *         description: Product deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductResponseDTO'
 *       400:
 *         description: Invalid request parameters.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: Product not found.
 *       500:
 *         description: Internal server error.
 */
export async function DELETE(req: NextRequest, { params }: { params: { restaurantId: string, productId: string } }) {
  try {
    const token = await getToken({ req });
    if (!token || !token.sub) {
      return jsonError('Unauthorized', 401);
    }
    const userId = parseInt(token.sub, 10);

    const parsedParams = paramsSchema.safeParse(params);
    if (!parsedParams.success) {
      return jsonError(parsedParams.error.issues, 400);
    }
    const { restaurantId, productId } = parsedParams.data;

    // Authorization: Check if user can delete from this restaurant
    const isGeneralAdmin = token.role === UserRole.general_admin;
    const isCorrectEstablishmentAdmin = token.role === UserRole.establishment_admin && token.establishmentId === restaurantId;

    if (!isGeneralAdmin && !isCorrectEstablishmentAdmin) {
      return jsonError('Forbidden', 403);
    }

    // Ensure product belongs to the restaurant before deleting
    const existingProduct = await productService.getProductById(productId);
    if (!existingProduct || existingProduct.establishmentId !== restaurantId) {
      return jsonError('Product not found or does not belong to the restaurant.', 404);
    }

    const deletedProduct = await productService.deleteProduct(productId, userId);
    if (!deletedProduct) {
      return jsonError('Failed to delete product or product not found.', 404);
    }

    // Devuelve los datos en camelCase
    return jsonOk(deletedProduct);
  } catch (error) {
    logger.error('Error in DELETE product:', error);
    if (error instanceof z.ZodError) {
      return jsonError(error.issues, 400);
    }
    return jsonError('An unexpected error occurred.', 500);
  }
}
