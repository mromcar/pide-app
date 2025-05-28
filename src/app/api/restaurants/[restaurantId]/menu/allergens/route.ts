import { requireAuth } from "@/middleware/auth-middleware";
import { getAllAllergens, createAllergen } from '@/services/allergen-service';
import { createAllergenSchema } from '@/schemas/allergen';
import { jsonOk, jsonError } from "@/utils/api";

export async function GET(_req: Request, { params }: { params: { restaurantId: string } }) {
  try {
    await requireAuth();
    const allergens = await getAllAllergens(Number(params.restaurantId));
    return jsonOk({ allergens });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : String(error));
  }
}

export async function POST(request: Request, { params }: { params: { restaurantId: string } }) {
  try {
    await requireAuth('ADMIN');
    const body = await request.json();
    const validatedData = createAllergenSchema.parse(body);

    const allergen = await createAllergen({
      ...validatedData,
      // Si tu modelo de alérgenos lleva establishmentId, añádelo aquí
      // establishmentId: Number(params.restaurantId)
    });
    return jsonOk({ allergen }, 201);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : String(error));
  }
}
