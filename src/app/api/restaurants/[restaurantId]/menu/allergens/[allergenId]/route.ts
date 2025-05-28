import { requireAuth } from "@/middleware/auth-middleware";
import { updateAllergen, deleteAllergen } from '@/services/allergen-service';
import { updateAllergenSchema } from '@/schemas/allergen';
import { jsonOk, jsonError } from "@/utils/api";

export async function PUT(
  request: Request,
  { params }: { params: { allergenId: string } }
) {
  try {
    await requireAuth('ADMIN');
    const body = await request.json();
    const validatedData = updateAllergenSchema.parse(body);

    const allergen = await updateAllergen(
      Number(params.allergenId),
      validatedData
    );
    return jsonOk({ allergen });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : String(error));
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { allergenId: string } }
) {
  try {
    await requireAuth('ADMIN');
    await deleteAllergen(Number(params.allergenId));
    return jsonOk({ message: 'Allergen deleted successfully' });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : String(error));
  }
}
