import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { z } from 'zod';
import { productVariantService } from '@/services/productVariant.service'; // Updated service import
import { productService } from '@/services/product.service'; // Added productService import
import { productVariantUpdateSchema, productVariantIdSchema } from '@/schemas/productVariant'; // Updated schema imports
import { jsonOk, jsonError } from '@/utils/api';
import { UserRole } from '@prisma/client';

const paramsSchema = z.object({
  restaurantId: z.coerce.number().int().positive(),
  variantId: z.coerce.number().int().positive(),
});

/**
 * @swagger
 * /api/restaurants/{restaurantId}/menu/variants/{variantId}:
 *   get:
 *     summary: Get a specific product variant by ID for a restaurant.
 *     tags: [Product Variants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the restaurant (establishment).
 *       - in: path
 *         name: variantId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the product variant.
 *     responses:
 *       200:
 *         description: Product variant details.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductVariantResponse'
 *       400:
 *         description: Invalid input.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: Product variant not found.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { restaurantId: string; variantId: string } }
) {
  const token = await getToken({ req });
  if (!token) {
    return jsonError('Unauthorized', 401);
  }

  try {
    const parsedParams = paramsSchema.safeParse(params);
    if (!parsedParams.success) {
      return jsonError(parsedParams.error.issues, 400);
    }
    const { restaurantId, variantId } = parsedParams.data;

    // Authorization check
    if (
      token.role !== UserRole.general_admin &&
      (token.role !== UserRole.establishment_admin || token.establishment_id !== restaurantId)
    ) {
      return jsonError('Forbidden', 403);
    }

    const variant = await productVariantService.getProductVariantById(variantId);
    if (!variant || variant.establishment_id !== restaurantId) {
      return jsonError('Product variant not found or does not belong to this restaurant', 404);
    }
    return jsonOk(variant);
  } catch (error: any) {
    console.error(`Error fetching product variant ${params.variantId}:`, error);
    return jsonError(error.message || 'Failed to fetch product variant', 500);
  }
}

/**
 * @swagger
 * /api/restaurants/{restaurantId}/menu/variants/{variantId}:
 *   put:
 *     summary: Update a specific product variant.
 *     tags: [Product Variants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the restaurant (establishment).
 *       - in: path
 *         name: variantId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the product variant to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductVariantUpdate'
 *     responses:
 *       200:
 *         description: Product variant updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductVariantResponse'
 *       400:
 *         description: Invalid input.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: Product variant not found.
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { restaurantId: string; variantId: string } }
) {
  const token = await getToken({ req });
  if (!token || !token.sub) {
    return jsonError('Unauthorized', 401);
  }

  try {
    const parsedParams = paramsSchema.safeParse(params);
    if (!parsedParams.success) {
      return jsonError(parsedParams.error.issues, 400);
    }
    const { restaurantId, variantId } = parsedParams.data;

    // Authorization check
    if (
      token.role !== UserRole.general_admin &&
      (token.role !== UserRole.establishment_admin || token.establishment_id !== restaurantId)
    ) {
      return jsonError('Forbidden', 403);
    }

    const body = await req.json();
    const validatedData = productVariantUpdateSchema.safeParse(body);

    if (!validatedData.success) {
      return jsonError(validatedData.error.issues, 400);
    }

    // Ensure the variant belongs to the establishment if establishment_id is being updated
    if (validatedData.data.establishment_id && validatedData.data.establishment_id !== restaurantId) {
      return jsonError('Cannot change establishment_id to a different restaurant.', 403);
    }

    // Verify that the product_id (if provided) belongs to the restaurantId
    if (validatedData.data.product_id) {
      const product = await productService.getProductById(validatedData.data.product_id);
      if (!product || product.establishment_id !== restaurantId) {
        return jsonError('Product not found or does not belong to this restaurant.', 400);
      }
    }

    const variantToUpdate = await productVariantService.getProductVariantById(variantId);
    if (!variantToUpdate || variantToUpdate.establishment_id !== restaurantId) {
      return jsonError('Product variant not found or does not belong to this restaurant', 404);
    }

    const updatedVariant = await productVariantService.updateProductVariant(
      variantId,
      { ...validatedData.data, establishment_id: restaurantId }, // Ensure establishment_id is from path param
      Number(token.sub) // userId for audit
    );

    if (!updatedVariant) {
      return jsonError('Product variant not found or failed to update', 404);
    }
    return jsonOk(updatedVariant);
  } catch (error: any) {
    console.error(`Error updating product variant ${params.variantId}:`, error);
    if (error instanceof z.ZodError) {
      return jsonError(error.issues, 400);
    }
    return jsonError(error.message || 'Failed to update product variant', 500);
  }
}

/**
 * @swagger
 * /api/restaurants/{restaurantId}/menu/variants/{variantId}:
 *   delete:
 *     summary: Delete a specific product variant (soft delete).
 *     tags: [Product Variants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the restaurant (establishment).
 *       - in: path
 *         name: variantId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the product variant to delete.
 *     responses:
 *       200:
 *         description: Product variant deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: Product variant not found.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { restaurantId: string; variantId: string } }
) {
  const token = await getToken({ req });
  if (!token || !token.sub) {
    return jsonError('Unauthorized', 401);
  }

  try {
    const parsedParams = paramsSchema.safeParse(params);
    if (!parsedParams.success) {
      return jsonError(parsedParams.error.issues, 400);
    }
    const { restaurantId, variantId } = parsedParams.data;

    // Authorization check
    if (
      token.role !== UserRole.general_admin &&
      (token.role !== UserRole.establishment_admin || token.establishment_id !== restaurantId)
    ) {
      return jsonError('Forbidden', 403);
    }

    const variantToDelete = await productVariantService.getProductVariantById(variantId);
    if (!variantToDelete || variantToDelete.establishment_id !== restaurantId) {
      return jsonError('Product variant not found or does not belong to this restaurant', 404);
    }

    const deletedVariant = await productVariantService.deleteProductVariant(variantId, Number(token.sub));

    if (!deletedVariant) {
      return jsonError('Product variant not found or failed to delete', 404);
    }
    return jsonOk({ message: 'Product variant deleted successfully' });
  } catch (error: any) {
    console.error(`Error deleting product variant ${params.variantId}:`, error);
    return jsonError(error.message || 'Failed to delete product variant', 500);
  }
}

// Placeholder for Swagger schemas - these should be defined in a central place or generated
/**
 * @swagger
 * components:
 *   schemas:
 *     ProductVariantUpdate:
 *       type: object
 *       properties:
 *         product_id:
 *           type: integer
 *           description: ID of the product this variant belongs to.
 *         establishment_id:
 *           type: integer
 *           description: ID of the establishment this variant belongs to (should match restaurantId in path).
 *         variant_description:
 *           type: string
 *           maxLength: 100
 *         price:
 *           type: number
 *           format: float
 *           description: Price of the variant.
 *         sku:
 *           type: string
 *           maxLength: 50
 *           nullable: true
 *         sort_order:
 *           type: integer
 *           nullable: true
 *         is_active:
 *           type: boolean
 *           nullable: true
 *         translations:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ProductVariantTranslationInput'
 *     ProductVariantResponse:
 *       type: object
 *       properties:
 *         variant_id:
 *           type: integer
 *         product_id:
 *           type: integer
 *         establishment_id:
 *           type: integer
 *         variant_description:
 *           type: string
 *         price:
 *           type: number
 *         sku:
 *           type: string
 *           nullable: true
 *         sort_order:
 *           type: integer
 *           nullable: true
 *         is_active:
 *           type: boolean
 *           nullable: true
 *         created_by_user_id:
 *           type: integer
 *           nullable: true
 *         created_at:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         updated_at:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         deleted_at:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         translations:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ProductVariantTranslationResponse'
 *     ProductVariantTranslationInput:
 *       type: object
 *       properties:
 *         language_code:
 *           type: string
 *         variant_description:
 *           type: string
 *     ProductVariantTranslationResponse:
 *       type: object
 *       properties:
 *         translation_id:
 *           type: integer
 *         variant_id:
 *           type: integer
 *         language_code:
 *           type: string
 *         variant_description:
 *           type: string
 */
