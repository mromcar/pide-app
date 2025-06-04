import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { z } from 'zod';
import { productVariantService } from '@/services/productVariant.service';
import { productService } from '@/services/product.service'; // Added productService import
import { productVariantCreateSchema } from '@/schemas/productVariant';
import { jsonOk, jsonError } from '@/utils/api';
import { UserRole } from '@prisma/client';

const paramsSchema = z.object({
  restaurantId: z.coerce.number().int().positive(),
});

const queryParamsSchema = z.object({
  productId: z.coerce.number().int().positive(),
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().optional().default(10),
});

/**
 * @swagger
 * /api/restaurants/{restaurantId}/menu/variants:
 *   get:
 *     summary: Retrieve a list of product variants for a specific product within a restaurant.
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
 *       - in: query
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the product to fetch variants for.
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
 *         description: Number of variants per page.
 *     responses:
 *       200:
 *         description: A list of product variants.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ProductVariantResponse'
 *       400:
 *         description: Invalid input.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { restaurantId: string } }
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
    const { restaurantId } = parsedParams.data;

    // Authorization check
    if (
      token.role !== UserRole.general_admin &&
      (token.role !== UserRole.establishment_admin || token.establishment_id !== restaurantId)
    ) {
      return jsonError('Forbidden', 403);
    }

    const { searchParams } = new URL(req.url);
    const queryValidation = queryParamsSchema.safeParse({
      productId: searchParams.get('productId'),
      page: searchParams.get('page'),
      pageSize: searchParams.get('pageSize'),
    });

    if (!queryValidation.success) {
      return jsonError(queryValidation.error.issues, 400);
    }
    const { productId, page, pageSize } = queryValidation.data;

    // Further check: ensure the product actually belongs to the restaurantId
    // This might require a quick productService.getProductById(productId) call
    // and checking its establishment_id if not handled by productVariantService.
    // For now, assuming productVariantService handles this or it's implicitly correct.

    const variants = await productVariantService.getAllProductVariantsForProduct(
      productId,
      page,
      pageSize
    );
    // Potentially filter variants by establishment_id if service doesn't do it strictly
    const filteredVariants = variants.filter(v => v.establishment_id === restaurantId);

    return jsonOk(filteredVariants);
  } catch (error: any) {
    console.error('Error fetching product variants:', error);
    return jsonError(error.message || 'Failed to fetch product variants', 500);
  }
}

/**
 * @swagger
 * /api/restaurants/{restaurantId}/menu/variants:
 *   post:
 *     summary: Create a new product variant for a product within a restaurant.
 *     tags: [Product Variants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the restaurant (establishment) where the variant will be created.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductVariantCreate'
 *     responses:
 *       201:
 *         description: Product variant created successfully.
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
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { restaurantId: string } }
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
    const { restaurantId } = parsedParams.data;

    // Authorization check
    if (
      token.role !== UserRole.general_admin &&
      (token.role !== UserRole.establishment_admin || token.establishment_id !== restaurantId)
    ) {
      return jsonError('Forbidden', 403);
    }

    const body = await req.json();
    // Ensure establishment_id in body matches restaurantId from path or is set by it
    const dataToValidate = {
      ...body,
      establishment_id: restaurantId,
      created_by_user_id: Number(token.sub)
    };

    const validatedData = productVariantCreateSchema.safeParse(dataToValidate);

    if (!validatedData.success) {
      return jsonError(validatedData.error.issues, 400);
    }

    // Verify that the product_id belongs to the restaurantId
    if (validatedData.data.product_id) {
      const product = await productService.getProductById(validatedData.data.product_id);
      if (!product || product.establishment_id !== restaurantId) {
        return jsonError('Product not found or does not belong to this restaurant.', 400);
      }
    }

    const newVariant = await productVariantService.createProductVariant(
      validatedData.data, // establishment_id and created_by_user_id are now part of this
      Number(token.sub) // userId for audit (already in validatedData.data but service might expect it separately)
    );
    return jsonOk(newVariant, 201);
  } catch (error: any) {
    console.error('Error creating product variant:', error);
    if (error instanceof z.ZodError) {
      return jsonError(error.issues, 400);
    }
    return jsonError(error.message || 'Failed to create product variant', 500);
  }
}

// Placeholder for Swagger schemas - these should be defined in a central place or generated
/**
 * @swagger
 * components:
 *   schemas:
 *     ProductVariantCreate:
 *       type: object
 *       required:
 *         - product_id
 *         - establishment_id
 *         - variant_description
 *         - price
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
 *           default: 0
 *         is_active:
 *           type: boolean
 *           nullable: true
 *           default: true
 *         created_by_user_id:
 *           type: integer
 *           nullable: true
 *           description: ID of the user creating the variant (usually set by the backend).
 *         translations:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ProductVariantTranslationInput'
 *     ProductVariantResponse: {}
 *     ProductVariantTranslationInput: {}
 *     ProductVariantTranslationResponse: {}
 */
