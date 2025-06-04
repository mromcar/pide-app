import { requireAuth } from "@/middleware/auth-middleware";
import { CategoryService } from '@/services/category.service';
import { createCategorySchema } from '@/schemas/category';
import { jsonOk, jsonError } from "@/utils/api";
import { ZodError } from "zod";
import { NextRequest, NextResponse } from 'next/server';

// Instancia única del servicio para ser reutilizada por los handlers
const categoryService = new CategoryService();

/**
 * @swagger
 * /api/restaurants/{restaurantId}/menu/categories:
 *   get:
 *     summary: Retrieve a list of categories for a specific restaurant.
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the restaurant.
 *     responses:
 *       200:
 *         description: A list of categories.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 categories:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Category'
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Internal server error.
 */
export async function GET(
  _req: NextRequest, // Use NextRequest
  { params }: { params: { restaurantId: string } }
) {
  try {
    // Authentication middleware
    await requireAuth(); // Adjust role if needed

    const restaurantId = Number(params.restaurantId);
    if (isNaN(restaurantId)) {
      return jsonError("Invalid restaurant ID", 400);
    }

    // Fetch categories using the service - corrected method name
    const categories = await categoryService.getAllCategoriesByEstablishment(restaurantId);

    // Return successful response
    return jsonOk({ categories });
  } catch (error) {
    // Handle errors, including Zod validation errors
    if (error instanceof ZodError) {
      return jsonError(error.errors, 400); // jsonError now handles ZodIssue[]
    } else if (error instanceof Error) {
      // Handle other potential errors from service or auth
      return jsonError(error.message, 500);
    } else {
      // Handle unexpected errors
      return jsonError("An unexpected error occurred", 500);
    }
  }
}

/**
 * @swagger
 * /api/restaurants/{restaurantId}/menu/categories:
 *   post:
 *     summary: Create a new category for a restaurant.
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the restaurant.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CategoryCreateInput'
 *     responses:
 *       201:
 *         description: Category created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       400:
 *         description: Invalid input.
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Internal server error.
 */
export async function POST(
  request: NextRequest, // Use NextRequest
  { params }: { params: { restaurantId: string } }
) {
  try {
    // Authentication middleware
    await requireAuth('ADMIN'); // Assuming ADMIN role is required for creation

    const restaurantId = Number(params.restaurantId);
    if (isNaN(restaurantId)) {
      return jsonError("Invalid restaurant ID", 400);
    }

    // Parse and validate request body using Zod schema
    const body = await request.json();
    const validatedData = createCategorySchema.parse(body);

    // Create category using the service
    const category = await categoryService.createCategory({
      ...validatedData,
      establishment_id: restaurantId, // Use the parsed restaurantId
    });

    // Return successful response (201 Created)
    return jsonOk({ category }, 201);
  } catch (error) {
    // Handle errors, including Zod validation errors
    if (error instanceof ZodError) {
      return jsonError(error.errors, 400); // jsonError now handles ZodIssue[]
    } else if (error instanceof Error) {
      // Handle other potential errors from service or auth
      return jsonError(error.message, 500);
    } else {
      // Handle unexpected errors
      return jsonError("An unexpected error occurred", 500);
    }
  }
}
