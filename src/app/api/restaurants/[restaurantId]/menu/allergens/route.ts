import { requireAuth } from "@/middleware/auth-middleware";
import { AllergenService } from '@/services/allergen.service';
import { createAllergenSchema } from '@/schemas/allergen';
import { jsonOk, jsonError } from "@/utils/api";
import { ZodError } from "zod";
import { NextRequest, NextResponse } from 'next/server';
import { UserRole } from '@prisma/client';

const allergenService = new AllergenService();

export async function GET(request: NextRequest, { params }: { params: { restaurantId: string } }) {
  try {
    const session = await requireAuth(UserRole.general_admin); // Corregido: usar el valor correcto del enum
    const allergens = await allergenService.getAllAllergens();
    return jsonOk({ allergens });
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonError(error.errors, 400);
    }
    return jsonError(error instanceof Error ? error.message : 'An unknown error occurred while fetching allergens.', 500);
  }
}

export async function POST(request: NextRequest, { params }: { params: { restaurantId: string } }) {
  try {
    // restaurantId se usa aquí para el contexto de autorización (asegurar que el admin opera sobre su restaurante, si aplica)
    // o simplemente para mantener la estructura de la ruta.
    const session = await requireAuth(UserRole.general_admin); // Corregido: usar el enum correcto
    const body = await request.json();
    const validatedData = createAllergenSchema.parse(body);

    const allergen = await allergenService.createAllergen(validatedData);
    return jsonOk({ allergen }, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonError(error.errors, 400);
    }
    // Considerar un log del error aquí para el servidor
    return jsonError(error instanceof Error ? error.message : 'An unknown error occurred while creating the allergen.', 500);
  }
}
