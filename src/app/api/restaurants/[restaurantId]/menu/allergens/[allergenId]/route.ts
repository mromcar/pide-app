import { requireAuth } from "@/middleware/auth-middleware";
import { AllergenService } from '@/services/allergen.service';
import { updateAllergenSchema, allergenIdSchema } from '@/schemas/allergen';
import { jsonOk, jsonError } from "@/utils/api";
import { ZodError } from "zod";
import { NextRequest } from 'next/server';
import { UserRole } from '@/types/enums';

const allergenService = new AllergenService();

interface AllergenRouteParams {
  restaurantId: string;
  allergenId: string;
}

export async function PUT(request: NextRequest, { params }: { params: AllergenRouteParams }) {
  try {
    await requireAuth(UserRole.GENERAL_ADMIN);
    const { allergenId } = allergenIdSchema.parse({ allergenId: params.allergenId });
    const body = await request.json();
    const validatedData = updateAllergenSchema.parse(body);

    const allergen = await allergenService.updateAllergen(allergenId, validatedData);
    if (!allergen) {
      return jsonError('Allergen not found.', 404);
    }
    return jsonOk({ allergen });
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonError(error.errors, 400);
    }
    return jsonError(error instanceof Error ? error.message : 'An unknown error occurred while updating the allergen.', 500);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: AllergenRouteParams }) {
  try {
    await requireAuth(UserRole.GENERAL_ADMIN);
    const { allergenId } = allergenIdSchema.parse({ allergenId: params.allergenId });

    await allergenService.deleteAllergen(allergenId);
    return jsonOk({ message: 'Allergen deleted successfully.' });
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonError(error.errors, 400);
    }
    return jsonError(error instanceof Error ? error.message : 'An unknown error occurred while deleting the allergen.', 500);
  }
}
