import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/middleware/auth-middleware';
import { UserRole } from '@prisma/client';
import * as categoryService from '@/services/category.service';
import { categoryCreateSchema } from '@/schemas/category';
import { jsonOk, jsonError } from "@/utils/api";
import { ZodError } from "zod";
import logger from '@/lib/logger';

export async function GET(
  _req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ restaurantId: string }> }
) {
  try {
    const params = await paramsPromise;
    const restaurantId = Number(params.restaurantId);

    logger.info(`[API] Fetching categories for restaurantId: ${restaurantId}`);

    if (isNaN(restaurantId)) {
      logger.warn(`[API] Invalid restaurantId received: ${params.restaurantId}`);
      return jsonError("Invalid restaurant ID", 400);
    }

    const categories = await categoryService.getAllCategoriesByEstablishment(restaurantId, 1, 100);

    logger.info(`[API] Found ${categories.length} categories for restaurantId: ${restaurantId}`);

    // Devuelve los datos en camelCase
    return jsonOk({ categories });
  } catch (error) {
    logger.error('[API] Error fetching categories:', error);
    if (error instanceof ZodError) {
      return jsonError(error.errors, 400);
    } else if (error instanceof Error) {
      return jsonError(error.message, 500);
    } else {
      return jsonError("An unexpected error occurred", 500);
    }
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { restaurantId: string } }
) {
  try {
    await requireAuth(UserRole.general_admin);
    const restaurantId = Number(params.restaurantId);
    if (isNaN(restaurantId)) {
      return jsonError("Invalid restaurant ID", 400);
    }

    const body = await request.json();
    const validatedData = categoryCreateSchema.parse(body);

    const category = await categoryService.createCategory({
      ...validatedData,
      establishmentId: restaurantId,
    });

    // Devuelve los datos en camelCase
    return jsonOk({ category }, 201);
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
