import { requireAuth } from "@/middleware/auth-middleware";
import { getAllAllergens, createAllergen } from '@/services/allergen-service';
import { createAllergenSchema } from '@/schemas/allergen';
import { jsonOk, jsonError } from "@/utils/api";

export async function GET() {
  try {
    const session = await requireAuth();
    const allergens = await getAllAllergens(session.user.establishment_id);
    return jsonOk({ allergens });
  } catch (error) {
    return jsonError(error.message);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAuth('ADMIN');
    const body = await request.json();
    const validatedData = createAllergenSchema.parse(body);

    const allergen = await createAllergen({
      ...validatedData,
      establishment_id: session.user.establishment_id
    });
    return jsonOk({ allergen });
  } catch (error) {
    return jsonError(error.message);
  }
}
