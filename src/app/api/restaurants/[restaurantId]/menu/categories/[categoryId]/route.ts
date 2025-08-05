import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/middleware/auth-middleware';
import { UserRole } from '@prisma/client';
import { CategoryService } from '@/services/category.service';
import { jsonOk, jsonError } from "@/utils/api";
import { ZodError } from 'zod';
import { categoryUpdateSchema } from '@/schemas/category';

const categoryService = new CategoryService();

/**
 * @swagger
 * /api/restaurants/{restaurantId}/menu/categories/{categoryId}:
 *   put:
 *     summary: Update a category for a restaurant.
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
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
 *         description: Invalid input.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Category not found.
 *       500:
 *         description: Internal server error.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { restaurantId: string; categoryId: string } }
) {
  try {
    await requireAuth(UserRole.general_admin); // Corregido: usar el valor correcto del enum

    const restaurantId = Number(params.restaurantId);
    const categoryId = Number(params.categoryId);
    if (isNaN(restaurantId) || isNaN(categoryId)) {
      return jsonError("Invalid restaurant or category ID", 400);
    }

    const body = await request.json();
    const validatedData = categoryUpdateSchema.parse(body);

    const updatedCategory = await categoryService.updateCategory(categoryId, {
      ...validatedData,
      establishment_id: restaurantId,
    });

    if (!updatedCategory) {
      return jsonError("Category not found", 404);
    }

    return jsonOk({ category: updatedCategory });
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonError(error.errors, 400);
    } else if (error instanceof Error) {
      return jsonError(error.message, 500);
    } else {
      return jsonError("An unexpected error occurred", 500);
    }
  }
}

/**
 * @swagger
 * /api/restaurants/{restaurantId}/menu/categories/{categoryId}:
 *   delete:
 *     summary: Delete a category for a restaurant.
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Category deleted successfully.
 *       400:
 *         description: Invalid input.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Category not found.
 *       500:
 *         description: Internal server error.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { restaurantId: string; categoryId: string } }
) {
  try {
    await requireAuth(UserRole.general_admin); // Corregido: usar el valor correcto del enum

    const restaurantId = Number(params.restaurantId);
    const categoryId = Number(params.categoryId);
    if (isNaN(restaurantId) || isNaN(categoryId)) {
      return jsonError("Invalid restaurant or category ID", 400);
    }

    const deleted = await categoryService.deleteCategory(categoryId, restaurantId);

    if (!deleted) {
      return jsonError("Category not found", 404);
    }

    // 204 No Content
    return new Response(null, { status: 204 });
  } catch (error) {
    if (error instanceof Error) {
      return jsonError(error.message, 500);
    } else {
      return jsonError("An unexpected error occurred", 500);
    }
  }
}
