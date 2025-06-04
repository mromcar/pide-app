import { requireAuth } from "@/middleware/auth-middleware";
import { CategoryService } from '@/services/category.service';
import { updateCategorySchema, categoryIdSchema } from '@/schemas/category';
import { jsonOk, jsonError } from "@/utils/api";
import { ZodError } from "zod";
import { NextRequest, NextResponse } from 'next/server';

// Instancia única del servicio
const categoryService = new CategoryService();

interface CategoryRouteParams {
  restaurantId: string;
  categoryId: string;
}

/**
 * @swagger
 * /api/restaurants/{restaurantId}/menu/categories/{categoryId}:
 *   put:
 *     summary: Update an existing category.
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
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the category to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CategoryUpdateInput'
 *     responses:
 *       200:
 *         description: Category updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       400:
 *         description: Invalid input or IDs.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Category not found.
 *       500:
 *         description: Internal server error.
 */
export async function PUT(
  request: NextRequest, // Use NextRequest
  { params }: { params: CategoryRouteParams }
) {
  try {
    // Authentication middleware
    await requireAuth('ADMIN'); // Assuming ADMIN role is required for update

    const restaurantId = Number(params.restaurantId);
    const categoryId = Number(params.categoryId);

    if (isNaN(categoryId)) {
      return jsonError("Invalid category ID", 400);
    }
    if (isNaN(restaurantId)) {
        return jsonError("Invalid restaurant ID", 400);
    }

    // Parse and validate request body using Zod schema
    const body = await request.json();
    const validatedData = updateCategorySchema.parse(body);

    // Update category using the service - now passing restaurantId
    const category = await categoryService.updateCategory(
      categoryId,
      restaurantId, 
      validatedData
    );

    if (!category) {
      return jsonError("Category not found or does not belong to this restaurant", 404);
    }

    // Return successful response
    return jsonOk({ category });
  } catch (error) {
    // Handle errors, including Zod validation errors
    if (error instanceof ZodError) {
      return jsonError(error.errors, 400); // jsonError now handles ZodIssue[]
    } else if (error instanceof Error) {
      // Handle other potential errors from service or auth
      // Consider checking for specific error messages from service for 404
      return jsonError(error.message, 500);
    } else {
      // Handle unexpected errors
      return jsonError("An unexpected error occurred", 500);
    }
  }
}

/**
 * @swagger
 * /api/restaurants/{restaurantId}/menu/categories/{categoryId}:
 *   delete:
 *     summary: Delete a category.
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
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the category to delete.
 *     responses:
 *       200:
 *         description: Category deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Category deleted successfully
 *       400:
 *         description: Invalid IDs.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Category not found.
 *       500:
 *         description: Internal server error.
 */
export async function DELETE(
  _request: NextRequest, // Use NextRequest, _request indicates it's not used
  { params }: { params: CategoryRouteParams }
) {
  try {
    // Authentication middleware
    await requireAuth('ADMIN'); // Assuming ADMIN role is required for deletion

    const restaurantId = Number(params.restaurantId);
    const categoryId = Number(params.categoryId);

    if (isNaN(categoryId)) {
      return jsonError("Invalid category ID", 400);
    }
    if (isNaN(restaurantId)) {
      return jsonError("Invalid restaurant ID", 400);
    }

    // Delete category using the service - now passing restaurantId
    const category = await categoryService.deleteCategory(categoryId, restaurantId);

    if (!category) {
      return jsonError("Category not found or does not belong to this restaurant", 404);
    }

    // Return successful response
    return jsonOk({ message: "Category deleted successfully", category });
  } catch (error) {
    // Handle errors
    if (error instanceof Error) {
      // Consider checking for specific error messages from service for 404
      return jsonError(error.message, 500);
    } else {
      // Handle unexpected errors
      return jsonError("An unexpected error occurred", 500);
    }
  }
}
